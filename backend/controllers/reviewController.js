const Review = require('../models/Review');
const Course = require('../models/Course');
const Order = require('../models/Order');

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private (Student)
exports.createReview = async (req, res, next) => {
    try {
        const { courseId, rating, comment } = req.body;
        const userId = req.user.id;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if user purchased the course
        const hasPurchased = await Order.findOne({
            user: userId,
            course: courseId,
            paymentStatus: 'completed'
        });

        if (!hasPurchased) {
            return res.status(403).json({
                success: false,
                message: 'You must purchase the course before reviewing it'
            });
        }

        // Check if user already reviewed this course
        const existingReview = await Review.findOne({
            user: userId,
            course: courseId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this course'
            });
        }

        // Create review
        const review = await Review.create({
            user: userId,
            course: courseId,
            rating,
            comment
        });

        // Update course rating
        await updateCourseRating(courseId);

        // Populate user details
        await review.populate('user', 'name');

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            review
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private (Student - own review)
exports.updateReview = async (req, res, next) => {
    try {
        const { rating, comment } = req.body;

        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns this review
        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this review'
            });
        }

        // Update review
        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        await review.save();

        // Update course rating
        await updateCourseRating(review.course);

        await review.populate('user', 'name');

        res.status(200).json({
            success: true,
            message: 'Review updated successfully',
            review
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Student - own review or Admin)
exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Check if user owns this review or is admin
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this review'
            });
        }

        const courseId = review.course;
        await review.deleteOne();

        // Update course rating
        await updateCourseRating(courseId);

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get reviews for a course
// @route   GET /api/reviews/course/:courseId
// @access  Public
exports.getCourseReviews = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ course: courseId })
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments({ course: courseId });

        res.status(200).json({
            success: true,
            count: reviews.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            reviews
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's review for a course
// @route   GET /api/reviews/my-review/:courseId
// @access  Private
exports.getMyReview = async (req, res, next) => {
    try {
        const review = await Review.findOne({
            user: req.user.id,
            course: req.params.courseId
        }).populate('user', 'name');

        res.status(200).json({
            success: true,
            review
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to update course rating
async function updateCourseRating(courseId) {
    const reviews = await Review.find({ course: courseId });

    if (reviews.length === 0) {
        await Course.findByIdAndUpdate(courseId, {
            averageRating: 0,
            totalReviews: 0
        });
        return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Course.findByIdAndUpdate(courseId, {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length
    });
}
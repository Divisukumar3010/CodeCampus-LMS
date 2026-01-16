const express = require('express');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Create review
router.post('/', protect, authorize('student'), async (req, res, next) => {
    try {
        const { courseId, rating, comment } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if user purchased the course
        const order = await Order.findOne({
            user: req.user.id,
            course: courseId,
            paymentStatus: 'completed'
        });

        if (!order) {
            return res.status(403).json({
                success: false,
                message: 'You must purchase the course before reviewing'
            });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({
            user: req.user.id,
            course: courseId
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this course'
            });
        }

        const review = await Review.create({
            course: courseId,
            user: req.user.id,
            rating,
            comment,
            isVerifiedPurchase: true
        });

        // Update course rating
        await updateCourseRating(courseId);

        await review.populate('user', 'name');

        res.status(201).json({
            success: true,
            review
        });
    } catch (error) {
        next(error);
    }
});

// Get course reviews
router.get('/course/:courseId', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const reviews = await Review.find({ course: req.params.courseId })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Review.countDocuments({ course: req.params.courseId });

        res.status(200).json({
            success: true,
            count: reviews.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            reviews
        });
    } catch (error) {
        next(error);
    }
});

// Get my review for a specific course - ADD THIS NEW ROUTE
router.get('/my-review/:courseId', protect, async (req, res, next) => {
    try {
        const review = await Review.findOne({
            user: req.user.id,
            course: req.params.courseId
        }).populate('user', 'name');

        res.status(200).json({
            success: true,
            review: review || null
        });
    } catch (error) {
        next(error);
    }
});

// Update review
router.put('/:id', protect, async (req, res, next) => {
    try {
        let review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this review'
            });
        }

        // Validate rating if provided
        if (req.body.rating && (req.body.rating < 1 || req.body.rating > 5)) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        review = await Review.findByIdAndUpdate(
            req.params.id,
            { rating: req.body.rating, comment: req.body.comment },
            { new: true, runValidators: true }
        ).populate('user', 'name');

        // Update course rating
        await updateCourseRating(review.course);

        res.status(200).json({
            success: true,
            review
        });
    } catch (error) {
        next(error);
    }
});

// Delete review
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

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
});

// Helper function to update course rating
async function updateCourseRating(courseId) {
    try {
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
    } catch (error) {
        console.error('Error updating course rating:', error);
    }
}

module.exports = router;
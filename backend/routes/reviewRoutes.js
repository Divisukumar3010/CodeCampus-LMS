const express = require('express');
const Review = require('../models/Review');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Create review
router.post('/', protect, authorize('student'), async (req, res, next) => {
    try {
        const { courseId, rating, comment } = req.body;

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

        review = await Review.findByIdAndUpdate(
            req.params.id,
            { rating: req.body.rating, comment: req.body.comment },
            { new: true, runValidators: true }
        );

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

        await review.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
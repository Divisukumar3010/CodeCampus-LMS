const express = require('express');
const Progress = require('../models/Progress');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const {
    getUserProfile,
    getUserPublicProfile,
    updateUserProfile,
    deleteAvatar,
    searchUsers
} = require('../controllers/profileController');

const router = express.Router();

// Profile routes
router.get('/profile', protect, getUserProfile);
router.put('/profile/update', protect, uploadSingle('avatar'), updateUserProfile);
router.delete('/profile/avatar', protect, deleteAvatar);
router.get('/search', protect, searchUsers);
router.get('/:userId/profile', getUserPublicProfile);

// Get user's enrolled courses
router.get('/enrolled-courses', protect, async (req, res, next) => {
    try {
        const progress = await Progress.find({ user: req.user.id })
            .populate('course', 'title thumbnail trainer price averageRating totalLessons totalDuration createdAt updatedAt') // Added totalDuration, createdAt, updatedAt
            .sort({ lastAccessedAt: -1 });

        res.status(200).json({
            success: true,
            count: progress.length,
            courses: progress
        });
    } catch (error) {
        next(error);
    }
});

// Get course progress
router.get('/progress/:courseId', protect, async (req, res, next) => {
    try {
        const progress = await Progress.findOne({
            user: req.user.id,
            course: req.params.courseId
        }).populate('course', 'title sections');

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'Progress not found'
            });
        }

        res.status(200).json({
            success: true,
            progress
        });
    } catch (error) {
        next(error);
    }
});

// Mark lesson as complete
router.post('/progress/:courseId/complete-lesson', protect, async (req, res, next) => {
    try {
        const { lessonId, watchTime } = req.body;

        let progress = await Progress.findOne({
            user: req.user.id,
            course: req.params.courseId
        });

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'You are not enrolled in this course'
            });
        }

        // Check if lesson already completed
        const alreadyCompleted = progress.completedLessons.some(
            cl => cl.lessonId.toString() === lessonId
        );

        if (!alreadyCompleted) {
            progress.completedLessons.push({
                lessonId,
                watchTime: watchTime || 0,
                completedAt: new Date()
            });
        }

        progress.currentLesson = lessonId;
        progress.lastAccessedAt = new Date();

        await progress.calculateProgress();

        res.status(200).json({
            success: true,
            progress
        });
    } catch (error) {
        next(error);
    }
});

// Get trainer's courses
router.get('/trainer/my-courses', protect, authorize('trainer', 'admin'), async (req, res, next) => {
    try {
        const courses = await Course.find({ trainer: req.user.id })
            .populate('category', 'name')
            .sort({ createdAt: -1 });

        // Get best performing course
        const bestCourse = await Course.findOne({ trainer: req.user.id })
            .sort({ averageRating: -1, enrollmentCount: -1 })
            .limit(1);

        // Calculate total stats
        const stats = {
            totalCourses: courses.length,
            totalEnrollments: courses.reduce((sum, course) => sum + course.enrollmentCount, 0),
            totalRevenue: courses.reduce((sum, course) => sum + course.revenue, 0),
            averageRating: courses.length > 0
                ? courses.reduce((sum, course) => sum + course.averageRating, 0) / courses.length
                : 0
        };

        res.status(200).json({
            success: true,
            courses,
            bestCourse,
            stats
        });
    } catch (error) {
        next(error);
    }
});
// Mark lesson as complete
router.post('/progress/:courseId/complete-lesson', protect, async (req, res, next) => {
    try {
        const { lessonId, watchTime } = req.body;

        let progress = await Progress.findOne({
            user: req.user.id,
            course: req.params.courseId
        });

        if (!progress) {
            return res.status(404).json({
                success: false,
                message: 'You are not enrolled in this course'
            });
        }

        // Check if lesson already completed
        const alreadyCompleted = progress.completedLessons.some(
            cl => cl.lessonId.toString() === lessonId
        );

        if (!alreadyCompleted) {
            progress.completedLessons.push({
                lessonId,
                watchTime: watchTime || 0,
                completedAt: new Date()
            });
        }

        progress.lastAccessedLesson = lessonId;
        progress.lastAccessedAt = new Date();

        // Calculate progress
        await progress.calculateProgress();

        // Log for debugging
        console.log('Progress after calculation:', {
            percentComplete: progress.percentComplete,
            isCompleted: progress.isCompleted,
            completedLessons: progress.completedLessons.length
        });

        res.status(200).json({
            success: true,
            progress
        });
    } catch (error) {
        console.error('Complete lesson error:', error);
        next(error);
    }
});

module.exports = router;
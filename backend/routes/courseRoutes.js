const express = require('express');
const rateLimit = require('express-rate-limit');
const {
    getCourses,
    getCourse,
    getCourseContent,
    createCourse,
    updateCourse,
    deleteCourse,
    addSection,
    addLesson,
    getEnrolledStudents,
    getPendingCourses,
    approveCourse,
    rejectCourse,
    getApprovalStatus
} = require('../controllers/courseController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadSingle, uploadAny, handleUploadError } = require('../middleware/uploadMiddleware');
const isEnrolled = require('../middleware/isEnrolled');

const router = express.Router();

// ============================================================
// RATE LIMITING CONFIG
// ============================================================

const browseLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    message: 'Too many requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
        // Use user ID if authenticated, otherwise use IP
        return req.user?.id || req.ip;
    }
});

const createLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 courses per hour
    message: 'Too many courses created. Please wait before creating another.',
    standardHeaders: true,
    legacyHeaders: false
});

// ============================================================
// PUBLIC ROUTES
// ============================================================

// Get all courses - with rate limiting
router.get('/', browseLimiter, optionalAuth, getCourses);

// Get single course - with rate limiting
router.get('/:id', browseLimiter, optionalAuth, getCourse);

// ============================================================
// ADMIN ONLY ROUTES
// ============================================================

router.get(
    '/admin/pending',
    protect,
    authorize('admin'),
    getPendingCourses
);

router.put(
    '/:id/approve',
    protect,
    authorize('admin'),
    approveCourse
);

router.put(
    '/:id/reject',
    protect,
    authorize('admin'),
    rejectCourse
);

router.get(
    '/:id/approval-status',
    protect,
    getApprovalStatus
);

// ============================================================
// PROTECTED ROUTES (Trainer/Admin)
// ============================================================

router.post(
    '/',
    protect,
    authorize('trainer', 'admin'),
    createLimiter,
    uploadAny(),
    handleUploadError,
    createCourse
);

router.put(
    '/:id',
    protect,
    authorize('trainer', 'admin'),
    uploadAny(),
    handleUploadError,
    updateCourse
);

router.delete(
    '/:id',
    protect,
    authorize('trainer', 'admin'),
    deleteCourse
);

router.post(
    '/:id/sections',
    protect,
    authorize('trainer', 'admin'),
    addSection
);

router.post(
    '/:id/sections/:sectionId/lessons',
    protect,
    authorize('trainer', 'admin'),
    uploadSingle('video'),
    handleUploadError,
    addLesson
);

router.get(
    '/:id/students',
    protect,
    authorize('trainer', 'admin'),
    getEnrolledStudents
);

// ============================================================
// PAID CONTENT (Requires enrollment)
// ============================================================

router.get(
    '/:id/content',
    protect,
    isEnrolled,
    getCourseContent
);

module.exports = router;
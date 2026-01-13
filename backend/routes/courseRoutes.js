const express = require('express');
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

// Public routes
router.get('/', optionalAuth, getCourses);

// Admin approval routes (MUST come before /:id route to avoid conflicts)
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

// Single course (public)
router.get('/:id', optionalAuth, getCourse);

// Create course - use uploadAny() to handle thumbnail + lesson videos
router.post(
    '/',
    protect,
    authorize('trainer', 'admin'),
    uploadAny(),
    handleUploadError,
    createCourse
);

// Update course
router.put(
    '/:id',
    protect,
    authorize('trainer', 'admin'),
    uploadAny(),  // Change from uploadSingle('thumbnail') to uploadAny()
    handleUploadError,
    updateCourse
);

// Delete course
router.delete(
    '/:id',
    protect,
    authorize('trainer', 'admin'),
    deleteCourse
);

// Add section
router.post(
    '/:id/sections',
    protect,
    authorize('trainer', 'admin'),
    addSection
);

// Add lesson
router.post(
    '/:id/sections/:sectionId/lessons',
    protect,
    authorize('trainer', 'admin'),
    uploadSingle('video'),
    handleUploadError,
    addLesson
);

// Get enrolled students
router.get(
    '/:id/students',
    protect,
    authorize('trainer', 'admin'),
    getEnrolledStudents
);
// 🔒 Course learning content (PAID)
router.get(
    '/:id/content',
    protect,
    isEnrolled,
    getCourseContent
);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
    createExam,
    updateExam,
    getExam,
    deleteExam,
    startAttempt,
    submitAttempt,
    getAttemptResult,
    getMyAttempts
} = require('../controllers/examController');
const { protect, authorize } = require('../middleware/auth');

// Trainer/Admin: CRUD
router.post('/:courseId', protect, authorize('trainer', 'admin'), createExam);
router.put('/:courseId', protect, authorize('trainer', 'admin'), updateExam);
router.delete('/:courseId', protect, authorize('trainer', 'admin'), deleteExam);

// Any authenticated user can view exam info
router.get('/:courseId', protect, getExam);

// Student: attempt lifecycle
router.post('/:courseId/start', protect, authorize('student'), startAttempt);
router.post('/:courseId/submit/:attemptId', protect, authorize('student'), submitAttempt);

// Get attempts
router.get('/:courseId/attempts', protect, getMyAttempts);
router.get('/:courseId/attempts/:attemptId', protect, getAttemptResult);

module.exports = router;

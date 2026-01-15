const express = require('express');
const router = express.Router();
const {
    generateCourseCertificate,
    getCertificate,
    getMyCertificates,
    verifyCertificate
} = require('../controllers/certificateController');
const { protect, authorize } = require('../middleware/auth');

// Generate certificate (student only)
router.post('/generate/:courseId', protect, authorize('student'), generateCourseCertificate);

// Get specific certificate
router.get('/:courseId', protect, getCertificate);

// Get all user certificates
router.get('/my-certificates', protect, getMyCertificates);

// Verify certificate (public)
router.get('/verify/:certificateId', verifyCertificate);

module.exports = router;
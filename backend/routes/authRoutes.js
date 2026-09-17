const express = require('express');
const {
    register,
    login,
    logout,
    getMe,
    refreshToken,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    initiateGoogleAuth,
    googleCallback,
    googleAuth
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/refresh-token', refreshToken);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// Password Reset Routes
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Real Google OAuth 2.0 (Authorization Code Flow)
router.get('/google', initiateGoogleAuth);
router.get('/google/callback', googleCallback);
router.post('/google', googleAuth);

module.exports = router;
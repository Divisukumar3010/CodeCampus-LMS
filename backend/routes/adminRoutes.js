const express = require('express');
const {
    getDashboardStats,
    getAllUsers,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    getAllCourses,
    approveCourse,
    suspendCourse,
    getRevenueByCourse,
    getRevenueByTrainer,
    createCategory,
    getCategories,
    getPublicPlatformStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ⭐ PUBLIC ROUTES - No auth required
router.get('/categories', getCategories);
router.get('/platform-stats', getPublicPlatformStats);

// All other admin routes require authentication
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/courses', getAllCourses);
router.put('/courses/:id/approve', approveCourse);
router.put('/courses/:id/suspend', suspendCourse);
router.get('/revenue/courses', getRevenueByCourse);
router.get('/revenue/trainers', getRevenueByTrainer);
router.post('/categories', createCategory);

module.exports = router;
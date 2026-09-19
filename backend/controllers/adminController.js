const User = require('../models/User');
const Course = require('../models/Course');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Progress = require('../models/Progress');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
exports.getDashboardStats = async (req, res, next) => {
    try {
        // Total users by role
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalTrainers = await User.countDocuments({ role: 'trainer' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });

        // Total courses
        const totalCourses = await Course.countDocuments();
        const publishedCourses = await Course.countDocuments({ status: 'published' });
        const pendingApproval = await Course.countDocuments({ isApproved: false, status: 'published' });

        // Revenue stats
        const revenueStats = await Order.aggregate([
            { $match: { paymentStatus: 'completed' } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$amount' },
                    totalOrders: { $sum: 1 }
                }
            }
        ]);

        const totalRevenue = revenueStats[0]?.totalRevenue || 0;
        const totalOrders = revenueStats[0]?.totalOrders || 0;

        // Revenue by month (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Order.aggregate([
            {
                $match: {
                    paymentStatus: 'completed',
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$amount' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Top courses by revenue
        const topCourses = await Course.find()
            .sort({createdAt: -1 })
            // .limit(5)
            .populate('trainer', 'name')
            .select('title revenue enrollmentCount averageRating');

        // Recent orders
        const recentOrders = await Order.find({ paymentStatus: 'completed' })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('user', 'name email')
            .populate('course', 'title price');

        res.status(200).json({
            success: true,
            stats: {
                users: {
                    totalStudents,
                    totalTrainers,
                    totalAdmins,
                    total: totalStudents + totalTrainers + totalAdmins
                },
                courses: {
                    total: totalCourses,
                    published: publishedCourses,
                    pendingApproval
                },
                revenue: {
                    total: totalRevenue,
                    totalOrders,
                    monthlyRevenue
                },
                topCourses,
                recentOrders
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.role) {
            query.role = req.query.role;
        }
        if (req.query.search) {
            query.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;

        if (!['student', 'trainer', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Deactivate/Activate user
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
exports.updateUserStatus = async (req, res, next) => {
    try {
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Prevent self-deletion
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all courses for admin
// @route   GET /api/admin/courses
// @access  Private (Admin)
exports.getAllCourses = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.isApproved !== undefined) {
            query.isApproved = req.query.isApproved === 'true';
        }

        const courses = await Course.find(query)
            .populate('trainer', 'name email')
            .populate('category', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Course.countDocuments(query);

        res.status(200).json({
            success: true,
            count: courses.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            courses
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve/Reject course
// @route   PUT /api/admin/courses/:id/approve
// @access  Private (Admin)
exports.approveCourse = async (req, res, next) => {
    try {
        const { isApproved } = req.body;

        const course = await Course.findByIdAndUpdate(
            req.params.id,
            {
                isApproved,
                approvedBy: isApproved ? req.user.id : null,
                approvedAt: isApproved ? new Date() : null
            },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Course ${isApproved ? 'approved' : 'rejected'} successfully`,
            course
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Suspend course
// @route   PUT /api/admin/courses/:id/suspend
// @access  Private (Admin)
exports.suspendCourse = async (req, res, next) => {
    try {
        const course = await Course.findByIdAndUpdate(
            req.params.id,
            { status: 'suspended' },
            { new: true }
        );

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Course suspended successfully',
            course
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get revenue by course
// @route   GET /api/admin/revenue/courses
// @access  Private (Admin)
exports.getRevenueByCourse = async (req, res, next) => {
    try {
        const revenue = await Order.aggregate([
            { $match: { paymentStatus: 'completed' } },
            {
                $group: {
                    _id: '$course',
                    totalRevenue: { $sum: '$amount' },
                    totalOrders: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'course'
                }
            },
            { $unwind: '$course' },
            {
                $project: {
                    courseTitle: '$course.title',
                    totalRevenue: 1,
                    totalOrders: 1
                }
            },
            { $sort: { totalRevenue: -1 } },
            { $limit: 20 }
        ]);

        res.status(200).json({
            success: true,
            revenue
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get revenue by trainer
// @route   GET /api/admin/revenue/trainers
// @access  Private (Admin)
exports.getRevenueByTrainer = async (req, res, next) => {
    try {
        const revenue = await Course.aggregate([
            {
                $group: {
                    _id: '$trainer',
                    totalRevenue: { $sum: '$revenue' },
                    totalCourses: { $sum: 1 },
                    totalEnrollments: { $sum: '$enrollmentCount' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'trainer'
                }
            },
            { $unwind: '$trainer' },
            {
                $project: {
                    trainerName: '$trainer.name',
                    trainerEmail: '$trainer.email',
                    totalRevenue: 1,
                    totalCourses: 1,
                    totalEnrollments: 1
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        res.status(200).json({
            success: true,
            revenue
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create/Update category
// @route   POST /api/admin/categories
// @access  Private (Admin)
exports.createCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);

        res.status(201).json({
            success: true,
            category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find().sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get public real-time platform metrics
// @route   GET /api/admin/platform-stats
// @access  Public
exports.getPublicPlatformStats = async (req, res, next) => {
    try {
        const [
            totalLearners,
            totalInstructors,
            totalCourses,
            totalCertificates,
            courseRatingAgg
        ] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'trainer' }),
            Course.countDocuments({ status: 'published', isApproved: true }),
            Progress.countDocuments({ 'certificate.isGenerated': true }),
            Course.aggregate([
                { $match: { status: 'published', isApproved: true, averageRating: { $gt: 0 } } },
                {
                    $group: {
                        _id: null,
                        avgRating: { $avg: '$averageRating' }
                    }
                }
            ])
        ]);

        const rawRating = courseRatingAgg[0]?.avgRating;
        const averageRating = rawRating ? Math.round(rawRating * 10) / 10 : 5.0;

        res.status(200).json({
            success: true,
            stats: {
                totalLearners,
                totalInstructors,
                totalCourses,
                totalCertificates,
                averageRating
            }
        });
    } catch (error) {
        next(error);
    }
};
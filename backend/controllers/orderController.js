const Order = require('../models/Order');
const Course = require('../models/Course');
const User = require('../models/User');
const Progress = require('../models/Progress');
const { createCheckoutSession, retrieveSession } = require('../config/stripe');

// @desc    Create payment session
// @route   POST /api/orders/create-session
// @access  Private (Student)
exports.createPaymentSession = async (req, res, next) => {
    try {
        const { courseId } = req.body;

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Check if already purchased
        const existingOrder = await Order.findOne({
            user: req.user.id,
            course: courseId,
            paymentStatus: 'completed'
        });

        if (existingOrder) {
            return res.status(400).json({
                success: false,
                message: 'You have already purchased this course'
            });
        }

        // Get final price (discount if available)
        const price = course.discountPrice || course.price;

        // Create Stripe checkout session
        const session = await createCheckoutSession(
            courseId,
            course.title,
            price,
            req.user.id,
            req.user.email
        );

        res.status(200).json({
            success: true,
            sessionId: session.id,
            url: session.url
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify payment and create order
// @route   POST /api/orders/verify-payment
// @access  Private
exports.verifyPayment = async (req, res, next) => {
    try {
        const { sessionId } = req.body;

        // Retrieve session from Stripe
        const session = await retrieveSession(sessionId);

        if (!session) {
            return res.status(400).json({
                success: false,
                message: 'Invalid session'
            });
        }

        // Check if payment was successful
        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment not completed'
            });
        }

        const courseId = session.client_reference_id;
        const userId = session.metadata.userId;

        // Check if order already exists
        const existingOrder = await Order.findOne({
            user: userId,
            course: courseId,
            paymentStatus: 'completed'
        });

        if (existingOrder) {
            return res.status(200).json({
                success: true,
                message: 'Order already exists',
                order: existingOrder
            });
        }

        // Create order
        const order = await Order.create({
            user: userId,
            course: courseId,
            amount: session.amount_total / 100,
            paymentMethod: 'stripe',
            paymentId: session.payment_intent,
            paymentStatus: 'completed',
            paymentDate: new Date(),
            stripeSessionId: sessionId,
            currency: session.currency.toUpperCase()
        });

        // Update course enrollment count and revenue
        const course = await Course.findById(courseId);
        course.enrollmentCount += 1;
        course.revenue += order.amount;
        await course.save();

        // Add course to user's enrolled courses
        await User.findByIdAndUpdate(userId, {
            $addToSet: { enrolledCourses: courseId }
        });

        // Create progress tracking
        await Progress.create({
            user: userId,
            course: courseId,
            enrolledAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Payment verified and enrollment successful',
            order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .populate('course', 'title thumbnail price trainer')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('course', 'title thumbnail price trainer')
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Make sure user owns this order or is admin
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this order'
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Check if user purchased course
// @route   GET /api/orders/check/:courseId
// @access  Private
exports.checkPurchase = async (req, res, next) => {
    try {
        const order = await Order.findOne({
            user: req.user.id,
            course: req.params.courseId,
            paymentStatus: 'completed'
        });

        res.status(200).json({
            success: true,
            isPurchased: !!order
        });
    } catch (error) {
        next(error);
    }
};
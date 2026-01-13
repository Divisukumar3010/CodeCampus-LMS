const Order = require('../models/Order');

const isEnrolled = async (req, res, next) => {
    const courseId = req.params.id || req.params.courseId;

    const order = await Order.findOne({
        user: req.user.id,
        course: courseId,
        paymentStatus: 'completed'
    });

    if (!order) {
        return res.status(403).json({
            success: false,
            message: 'Please enroll in this course to access content'
        });
    }

    next();
};

module.exports = isEnrolled;

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['stripe', 'razorpay'],
        required: true
    },
    paymentId: {
        type: String,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentDate: {
        type: Date
    },
    currency: {
        type: String,
        default: 'INR'
    },
    razorpayOrderId: String, // For Razorpay
    razorpaySignature: String,
    stripeSessionId: String, // For Stripe
    refundId: String,
    refundReason: String,
    refundDate: Date
}, {
    timestamps: true
});

// Prevent duplicate purchases
orderSchema.index({ user: 1, course: 1 }, { unique: true });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
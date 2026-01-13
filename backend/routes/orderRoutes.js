const express = require('express');
const {
    createPaymentSession,
    verifyPayment,
    getMyOrders,
    getOrder,
    checkPurchase
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/create-session', protect, authorize('student'), createPaymentSession);
router.post('/verify-payment', protect, verifyPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/check/:courseId', protect, checkPurchase);
router.get('/:id', protect, getOrder);

module.exports = router;

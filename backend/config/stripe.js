const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Stripe checkout session
exports.createCheckoutSession = async (courseId, courseName, price, userId, userEmail) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: courseName,
                            description: `Enroll in ${courseName}`,
                        },
                        unit_amount: Math.round(price * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
            client_reference_id: courseId,
            customer_email: userEmail,
            metadata: {
                userId: userId.toString(),
                courseId: courseId.toString()
            }
        });

        return session;
    } catch (error) {
        console.error('Stripe session creation error:', error);
        throw error;
    }
};

// Verify Stripe webhook signature
exports.constructWebhookEvent = (payload, signature) => {
    try {
        return stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        throw error;
    }
};

// Retrieve session details
exports.retrieveSession = async (sessionId) => {
    try {
        return await stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
        console.error('Error retrieving Stripe session:', error);
        throw error;
    }
};

// Create refund
exports.createRefund = async (paymentIntentId, amount) => {
    try {
        return await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: Math.round(amount * 100) // Convert to cents
        });
    } catch (error) {
        console.error('Error creating refund:', error);
        throw error;
    }
};

module.exports = stripe;
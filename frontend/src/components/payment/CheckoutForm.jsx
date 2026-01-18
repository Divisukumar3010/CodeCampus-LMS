import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { orderAPI } from '../../services/api';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ courseId, courseName, price }) => {
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);

        try {
            const response = await orderAPI.createSession({ courseId });
            const stripe = await stripePromise;

            const { error } = await stripe.redirectToCheckout({
                sessionId: response.data.sessionId,
            });

            if (error) {
                toast.error(error.message);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            toast.error('Failed to initiate checkout');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-950 dark:bg-slate-900 rounded-xl shadow-lg dark:shadow-slate-700 p-6">
            <h3 className="text-2xl font-bold mb-4">{courseName}</h3>
            <div className="text-4xl font-bold text-primary-600 mb-6">
                ${price}
            </div>
            <button
                onClick={handleCheckout}
                disabled={loading}
                className="btn-primary w-full"
            >
                {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
            <p className="text-sm text-gray-500 mt-4 text-center">
                Secure payment powered by Stripe
            </p>
        </div>
    );
};

export default CheckoutForm;
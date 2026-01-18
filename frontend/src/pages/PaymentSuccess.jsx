import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const verifyPayment = async () => {
            const sessionId = searchParams.get('session_id');

            if (!sessionId) {
                setStatus('error');
                toast.error('Invalid payment session');
                return;
            }

            try {
                const response = await orderAPI.verifyPayment({ sessionId });

                if (response.data.success) {
                    setStatus('success');
                    setOrder(response.data.order);
                    toast.success('Payment successful! You are now enrolled.');

                    // Redirect to dashboard after 3 seconds
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 3000);
                } else {
                    setStatus('error');
                    toast.error('Payment verification failed');
                }
            } catch (error) {
                console.error('Payment verification error:', error);
                setStatus('error');
                toast.error(error.response?.data?.message || 'Payment verification failed');
            }
        };

        verifyPayment();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-slate-950 dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
                    {status === 'verifying' && (
                        <>
                            <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                                <FiLoader className="text-blue-600 text-4xl animate-spin" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                                Verifying Payment...
                            </h2>
                            <p className="text-gray-600">
                                Please wait while we confirm your enrollment.
                            </p>
                            <div className="mt-6">
                                <div className="animate-pulse flex space-x-2 justify-center">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animation-delay-200"></div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animation-delay-400"></div>
                                </div>
                            </div>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                                <FiCheckCircle className="text-green-600 text-4xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                                Payment Successful! 🎉
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Congratulations! You've been enrolled in the course.
                            </p>

                            {order && (
                                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">Order ID:</span>
                                        <span className="text-sm font-mono text-gray-900 dark:text-gray-100">
                                            {order._id.slice(-8).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Amount Paid:</span>
                                        <span className="text-lg font-bold text-green-600">
                                            ₹{order.amount}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <p className="text-sm text-gray-500">
                                Redirecting to your dashboard in 3 seconds...
                            </p>

                            <button
                                onClick={() => navigate('/dashboard')}
                                className="mt-4 btn-primary w-full"
                            >
                                Go to Dashboard Now
                            </button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                                <FiXCircle className="text-red-600 text-4xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                                Payment Verification Failed
                            </h2>
                            <p className="text-gray-600 mb-6">
                                We couldn't verify your payment. Please contact support if you were charged.
                            </p>

                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/courses')}
                                    className="btn-primary w-full"
                                >
                                    Browse Courses
                                </button>
                                <button
                                    onClick={() => navigate('/support')}
                                    className="btn-outline w-full"
                                >
                                    Contact Support
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
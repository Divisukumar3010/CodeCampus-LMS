import { useNavigate } from 'react-router-dom';
import { FiXCircle } from 'react-icons/fi';

const PaymentCancel = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-slate-950 dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
                        <FiXCircle className="text-orange-600 text-4xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                        Payment Cancelled
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Your payment was cancelled. No charges were made to your account.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="btn-primary w-full"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/courses')}
                            className="btn-outline w-full"
                        >
                            Browse Other Courses
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancel;
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { FiMail, FiArrowLeft, FiCheckCircle, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Please enter your registered email address');
            return;
        }

        setLoading(true);

        try {
            const res = await authAPI.forgotPassword({ email });
            setSubmitted(true);
            toast.success(res.data.message || 'Password reset link sent!');
        } catch (error) {
            console.error('Forgot password error:', error);
            // Even on error, show safe message to prevent enumeration
            setSubmitted(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="card p-8 sm:p-10 shadow-lg">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                            <FiShield size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Forgot your password?
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                            Enter your verified institutional or registered email address to receive secure reset instructions.
                        </p>
                    </div>

                    {submitted ? (
                        <div className="space-y-5 text-center">
                            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left">
                                <div className="flex items-start gap-3">
                                    <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" size={18} />
                                    <div className="text-xs text-emerald-900 dark:text-emerald-200">
                                        <p className="font-semibold text-sm mb-1">Check your inbox</p>
                                        <p className="leading-relaxed">
                                            If an account exists for <span className="font-semibold">{email}</span>, a secure password reset link has been dispatched.
                                        </p>
                                        <p className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-300">
                                            ⏰ The reset link expires in <strong>15 minutes</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Didn't receive an email? Check your spam folder or request a new link after 15 minutes.
                            </p>

                            <div className="pt-2">
                                <Link
                                    to="/login"
                                    className="btn-primary w-full py-2.5 text-xs font-semibold"
                                >
                                    Return to Login
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="scholar@university.edu"
                                        disabled={loading}
                                        className="input-field pl-10"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary py-2.5 text-sm font-semibold"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Sending Instructions...
                                    </span>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>

                            <div className="pt-2 text-center">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                                >
                                    <FiArrowLeft size={14} />
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;

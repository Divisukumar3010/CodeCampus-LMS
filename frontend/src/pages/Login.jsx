import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';
import { GoogleAuthButton, SocialAuthDivider } from '../components/auth/SocialAuthButtons';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const successMessage = location.state?.message;

    // Redirect if already logged in
    if (isAuthenticated) {
        navigate('/dashboard');
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError(''); // Clear error when user types
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(formData);

            if (result.success) {
                // Small delay to ensure auth state is updated
                setTimeout(() => {
                    navigate('/dashboard');
                }, 100);
            } else {
                setError(result.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-slate-800">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg dark:shadow-slate-700">
                            <FiLock className="text-white text-2xl" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
                        <p className="mt-2 text-gray-600 dark:text-slate-400">Sign in to your academic LMS portal</p>
                    </div>

                    {/* Success Banner (e.g. from password reset) */}
                    {successMessage && (
                        <div className="mb-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-xl text-sm flex items-center gap-2.5">
                            <FiCheckCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* One-Click Single Sign-On (Google) */}
                    <div className="mb-6">
                        <GoogleAuthButton text="Continue with Google" />
                    </div>

                    <SocialAuthDivider text="Or sign in with email" />

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="input-field pl-10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-700 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="you@example.com"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="input-field pl-10 pr-10 bg-white dark:bg-slate-800 text-gray-900 dark:text-white border-gray-300 dark:border-slate-700 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-400"
                                    disabled={loading}
                                >
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-slate-600 rounded cursor-pointer"
                                    disabled={loading}
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-slate-300 cursor-pointer">
                                    Remember me
                                </label>
                            </div>
                            <Link
                                to="/forgot-password"
                                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-bold py-3 rounded-lg transition-all shadow-md hover:shadow-lg dark:shadow-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold">
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
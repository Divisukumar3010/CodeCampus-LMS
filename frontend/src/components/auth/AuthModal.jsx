import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { authAPI } from '../../services/api';
import { GoogleAuthButton, SocialAuthDivider } from './SocialAuthButtons';
import {
    FiX,
    FiMail,
    FiLock,
    FiUser,
    FiEye,
    FiEyeOff,
    FiCheckCircle,
    FiShield,
    FiAlertCircle,
    FiArrowLeft,
    FiArrowRight
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AuthModal() {
    const { isOpen, view, closeModal, switchView } = useAuthModal();
    const { login, register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Modal container ref for focus and click handling
    const modalRef = useRef(null);

    // ==========================================
    // LOGIN FORM STATE
    // ==========================================
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [loginShowPassword, setLoginShowPassword] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    // ==========================================
    // REGISTER FORM STATE
    // ==========================================
    const [registerData, setRegisterData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student'
    });
    const [registerShowPassword, setRegisterShowPassword] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);
    const [registerError, setRegisterError] = useState('');

    // ==========================================
    // FORGOT PASSWORD STATE
    // ==========================================
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotSubmitted, setForgotSubmitted] = useState(false);
    const [forgotError, setForgotError] = useState('');

    // Close modal if already authenticated
    useEffect(() => {
        if (isAuthenticated && isOpen) {
            closeModal();
        }
    }, [isAuthenticated, isOpen, closeModal]);

    // Handle ESC key and Body Scroll Lock
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        };

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', handleKeyDown);

        // Focus modal container on open
        if (modalRef.current) {
            modalRef.current.focus();
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, closeModal]);

    // Reset error messages when view switches
    useEffect(() => {
        setLoginError('');
        setRegisterError('');
        setForgotError('');
        setForgotSubmitted(false);
    }, [view]);

    if (!isOpen) return null;

    // ==========================================
    // LOGIN HANDLER
    // ==========================================
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');

        if (!loginData.email || !loginData.password) {
            setLoginError('Please enter both email and password.');
            return;
        }

        setLoginLoading(true);
        try {
            const result = await login(loginData);
            if (result.success) {
                closeModal();
                if (location.pathname === '/login') {
                    navigate('/');
                }
            } else {
                setLoginError(result.message || 'Invalid email or password.');
            }
        } catch (err) {
            setLoginError('An error occurred during sign in. Please try again.');
        } finally {
            setLoginLoading(false);
        }
    };

    // ==========================================
    // REGISTER HANDLER
    // ==========================================
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setRegisterError('');

        if (!registerData.name.trim()) {
            setRegisterError('Please enter your full name.');
            return;
        }
        if (!registerData.email.trim()) {
            setRegisterError('Please enter a valid email address.');
            return;
        }
        if (registerData.password.length < 8) {
            setRegisterError('Password must be at least 8 characters long.');
            return;
        }
        if (registerData.password !== registerData.confirmPassword) {
            setRegisterError('Passwords do not match.');
            return;
        }

        setRegisterLoading(true);
        try {
            const result = await register({
                name: registerData.name,
                email: registerData.email,
                password: registerData.password,
                role: 'student'
            });

            if (result.success) {
                closeModal();
                if (location.pathname === '/register') {
                    navigate('/');
                }
            } else {
                setRegisterError(result.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            setRegisterError('An error occurred during account creation.');
        } finally {
            setRegisterLoading(false);
        }
    };

    // ==========================================
    // FORGOT PASSWORD HANDLER
    // ==========================================
    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setForgotError('');

        if (!forgotEmail.trim()) {
            setForgotError('Please enter your registered email address.');
            return;
        }

        setForgotLoading(true);
        try {
            await authAPI.forgotPassword({ email: forgotEmail });
            setForgotSubmitted(true);
            toast.success('Password reset link sent!');
        } catch (err) {
            // Enumeration protection
            setForgotSubmitted(true);
        } finally {
            setForgotLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-modal-backdrop"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-modal-title"
        >
            {/* Modal Card */}
            <div
                ref={modalRef}
                tabIndex={-1}
                className="relative w-full max-w-md max-h-[92vh] overflow-y-auto glass-card rounded-3xl border border-indigo-500/20 p-6 sm:p-8 outline-none animate-modal-card shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    type="button"
                    onClick={closeModal}
                    aria-label="Close modal"
                    className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <FiX className="w-5 h-5" />
                </button>

                {/* ========================================== */}
                {/* VIEW 1: LOGIN */}
                {/* ========================================== */}
                {view === 'login' && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                        {/* Header */}
                        <div className="text-center pr-6">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20 text-white">
                                <FiLock className="w-6 h-6" />
                            </div>
                            <h2 id="auth-modal-title" className="text-2xl font-bold text-slate-900 dark:text-white">
                                Welcome Back
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                Sign in to continue your learning journey
                            </p>
                        </div>

                        {/* Error Alert */}
                        {loginError && (
                            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
                                <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span className="flex-1">{loginError}</span>
                            </div>
                        )}

                        {/* Google OAuth Button */}
                        <div className="pt-1">
                            <GoogleAuthButton text="Continue with Google" />
                        </div>

                        <SocialAuthDivider text="Or sign in with email" />

                        {/* Login Form */}
                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={loginData.email}
                                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                        placeholder="you@example.com"
                                        disabled={loginLoading}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-850 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Password
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => switchView('forgot-password')}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={loginShowPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        value={loginData.password}
                                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                        placeholder="••••••••"
                                        disabled={loginLoading}
                                        className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-850 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setLoginShowPassword(!loginShowPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                    >
                                        {loginShowPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loginLoading}
                                className="btn-glow w-full py-2.5 px-4 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loginLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span>Sign In</span>
                                )}
                            </button>
                        </form>

                        {/* Switch to Register */}
                        <div className="pt-2 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => switchView('register')}
                                className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            >
                                Create an account
                            </button>
                        </div>
                    </div>
                )}

                {/* ========================================== */}
                {/* VIEW 2: REGISTER */}
                {/* ========================================== */}
                {view === 'register' && (
                    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
                        {/* Header */}
                        <div className="text-center pr-6">
                            <h2 id="auth-modal-title" className="text-2xl font-bold text-slate-900 dark:text-white">
                                Create your account
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                Join CodeCampus LMS and start your learning journey
                            </p>
                        </div>

                        {/* Error Alert */}
                        {registerError && (
                            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
                                <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span className="flex-1">{registerError}</span>
                            </div>
                        )}

                        {/* Google OAuth Button */}
                        <div>
                            <GoogleAuthButton text="Sign up with Google" />
                        </div>

                        <SocialAuthDivider text="Or register with email" />

                        {/* Register Form */}
                        <form onSubmit={handleRegisterSubmit} className="space-y-3 sm:space-y-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={registerData.name}
                                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                        placeholder="John Doe"
                                        disabled={registerLoading}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-850 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={registerData.email}
                                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                        placeholder="you@example.com"
                                        disabled={registerLoading}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-850 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                                    Password
                                </label>
                                <div className="relative">
                                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={registerShowPassword ? 'text' : 'password'}
                                        required
                                        value={registerData.password}
                                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                        placeholder="•••••••• (min. 8 chars)"
                                        disabled={registerLoading}
                                        className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-850 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setRegisterShowPassword(!registerShowPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                    >
                                        {registerShowPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={registerShowPassword ? 'text' : 'password'}
                                        required
                                        value={registerData.confirmPassword}
                                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                                        placeholder="Re-enter password"
                                        disabled={registerLoading}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-850 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={registerLoading}
                                className="btn-glow w-full mt-2 py-2.5 px-4 text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {registerLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span>Create Account</span>
                                )}
                            </button>
                        </form>

                        {/* Switch to Login */}
                        <div className="pt-2 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => switchView('login')}
                                className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            >
                                Sign in
                            </button>
                        </div>
                    </div>
                )}

                {/* ========================================== */}
                {/* VIEW 3: FORGOT PASSWORD */}
                {/* ========================================== */}
                {view === 'forgot-password' && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                        {/* Header */}
                        <div className="text-center pr-6">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-md">
                                <FiShield className="w-6 h-6" />
                            </div>
                            <h2 id="auth-modal-title" className="text-2xl font-bold text-slate-900 dark:text-white">
                                Forgot your password?
                            </h2>
                            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                                Enter your registered email address to receive reset instructions
                            </p>
                        </div>

                        {forgotSubmitted ? (
                            <div className="space-y-5 text-center animate-in fade-in">
                                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left">
                                    <div className="flex items-start gap-3">
                                        <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" size={18} />
                                        <div className="text-xs text-emerald-900 dark:text-emerald-200">
                                            <p className="font-semibold text-sm mb-1">Check your inbox</p>
                                            <p className="leading-relaxed">
                                                If an account exists for <span className="font-semibold">{forgotEmail}</span>, a secure password reset link has been dispatched.
                                            </p>
                                            <p className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-300">
                                                ⏰ The reset link expires in <strong>15 minutes</strong>.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => switchView('login')}
                                    className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                >
                                    <FiArrowLeft className="w-4 h-4" />
                                    <span>Back to Sign In</span>
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleForgotSubmit} className="space-y-4">
                                {forgotError && (
                                    <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs sm:text-sm flex items-start gap-2.5">
                                        <FiAlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span className="flex-1">{forgotError}</span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="email"
                                            required
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            placeholder="Enter your registered email"
                                            disabled={forgotLoading}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-850 transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={forgotLoading}
                                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {forgotLoading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span>Send Reset Link</span>
                                            <FiArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>

                                <div className="pt-2 text-center">
                                    <button
                                        type="button"
                                        onClick={() => switchView('login')}
                                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                                    >
                                        <FiArrowLeft className="w-3.5 h-3.5" />
                                        <span>Back to Sign In</span>
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

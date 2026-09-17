import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { checkAuth } = useAuth();

    const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
    const [errorMessage, setErrorMessage] = useState('');
    const hasHandled = useRef(false);

    useEffect(() => {
        if (hasHandled.current) return;
        hasHandled.current = true;

        const handleOAuthResult = async () => {
            const error = searchParams.get('error');
            const token = searchParams.get('token');
            const refreshToken = searchParams.get('refreshToken');
            const success = searchParams.get('success');

            if (error) {
                setStatus('error');
                setErrorMessage(decodeURIComponent(error));
                toast.error(`Authentication failed: ${decodeURIComponent(error)}`, { id: 'oauth-error' });
                return;
            }

            if (success === 'true' || token) {
                if (token) {
                    localStorage.setItem('token', token);
                }
                if (refreshToken) {
                    localStorage.setItem('refreshToken', refreshToken);
                }

                try {
                    // Refresh auth context so current user info is loaded from server
                    await checkAuth();
                    setStatus('success');
                    toast.success('Signed in successfully!', { id: 'oauth-success' });
                    navigate('/dashboard', { replace: true });
                } catch (err) {
                    console.error('Failed to load user profile after OAuth:', err);
                    setStatus('error');
                    setErrorMessage('Failed to complete session setup. Please try logging in again.');
                }
            } else {
                setStatus('error');
                setErrorMessage('Unexpected response from identity provider.');
            }
        };

        handleOAuthResult();
    }, [searchParams, checkAuth, navigate]);

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 transition-colors">
            <div className="w-full max-w-md">
                {/* Academic Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 mb-4 ring-4 ring-indigo-50 dark:ring-indigo-950/50">
                        <GraduationCap className="w-7 h-7" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Academic Authentication
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Verifying your identity with institutional provider
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-700/60 p-8 text-center">
                    {status === 'processing' && (
                        <div className="space-y-4 py-4">
                            <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Completing secure sign-in...
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Please wait while we verify your academic credentials and prepare your learning portal.
                            </p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-4 py-4 animate-in fade-in duration-300">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center ring-4 ring-emerald-50 dark:ring-emerald-950/20">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Identity Verified!
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Redirecting to your CodeCampus LMS dashboard...
                            </p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-5 py-2 animate-in fade-in duration-300">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center ring-4 ring-red-50 dark:ring-red-950/20">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                    Authentication Failed
                                </h2>
                                <p className="text-xs text-red-600 dark:text-red-400 mt-2 max-w-sm mx-auto">
                                    {errorMessage || 'An error occurred while verifying your identity.'}
                                </p>
                            </div>
                            <div className="pt-2">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center gap-2 py-2 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20"
                                >
                                    <span>Return to Sign In</span>
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

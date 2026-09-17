import { useState } from 'react';

// Retrieve backend API URL
const getApiBaseUrl = () => {
    const raw = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return raw.replace(/\/+$/, '');
};

export const GoogleAuthButton = ({ text = 'Continue with Google', disabled = false }) => {
    const [loading, setLoading] = useState(false);

    const handleGoogleAuth = () => {
        if (loading || disabled) return;
        setLoading(true);
        // Direct browser navigation to backend initiateGoogleAuth endpoint
        // Backend handles state generation, CSRF cookies, and official Google login redirect
        window.location.href = `${getApiBaseUrl()}/auth/google`;
    };

    return (
        <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={disabled || loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 font-semibold text-sm shadow-sm transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
        >
            {loading ? (
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            ) : (
                /* Official Google "G" brand mark SVG */
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                </svg>
            )}
            <span>{loading ? 'Redirecting to Google...' : text}</span>
        </button>
    );
};

export const SocialAuthDivider = ({ text = 'Or continue with' }) => (
    <div className="relative my-6 flex items-center justify-center">
        <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        <span className="absolute bg-white dark:bg-slate-900 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {text}
        </span>
    </div>
);

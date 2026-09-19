import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiBook, FiTerminal } from 'react-icons/fi';
import ThemeToggle from '../ThemeToggle';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { openModal } = useAuthModal();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = async () => {
        await logout();
        setProfileMenuOpen(false);
        navigate('/');
    };

    return (
        <header className={`sticky top-0 z-50 w-full transition-all duration-300 border-b ${
            isScrolled
                ? 'bg-[#060913]/90 dark:bg-[#060913]/90 bg-white/90 backdrop-blur-xl border-white/[0.08] dark:border-white/[0.08] border-slate-200 shadow-lg'
                : 'bg-[#060913]/75 dark:bg-[#060913]/75 bg-white/75 backdrop-blur-md border-transparent'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                {/* Brand Logo & Slogan */}
                <Link
                    to="/"
                    className="flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
                >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-[1.5px] shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
                        <div className="w-full h-full bg-[#090e1c] rounded-[10px] flex items-center justify-center">
                            {/* Graduation Cap / Code SVG icon */}
                            <svg className="w-5 h-5 text-indigo-400 group-hover:text-cyan-300 transition-colors" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
                                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
                            </svg>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
                            Code<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Campus</span>
                        </span>
                        <span className="text-[9px] font-semibold tracking-widest text-slate-500 dark:text-slate-400 uppercase -mt-0.5">
                            LEARN WITHOUT LIMITS
                        </span>
                    </div>
                </Link>

                {/* Navigation Links */}
                <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-8">
                    <Link
                        to="/courses"
                        className={`text-sm font-medium transition-colors relative py-1 hover:after:w-full after:h-0.5 after:bg-indigo-400 after:absolute after:bottom-0 after:left-0 after:transition-all ${
                            location.pathname === '/courses'
                                ? 'text-indigo-600 dark:text-white after:w-full font-semibold'
                                : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white after:w-0'
                        }`}
                    >
                        Courses
                    </Link>
                    <Link
                        to="/online-compiler"
                        className={`text-sm font-medium transition-colors flex items-center gap-2 group relative py-1 hover:after:w-full after:h-0.5 after:bg-indigo-400 after:absolute after:bottom-0 after:left-0 after:transition-all ${
                            location.pathname === '/online-compiler'
                                ? 'text-indigo-600 dark:text-white after:w-full font-semibold'
                                : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white after:w-0'
                        }`}
                    >
                        <span>Online Compiler</span>
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                    </Link>

                    {isAuthenticated && user?.role === 'student' && (
                        <Link
                            to="/my-courses"
                            className={`text-sm font-medium transition-colors relative py-1 hover:after:w-full after:h-0.5 after:bg-indigo-400 after:absolute after:bottom-0 after:left-0 after:transition-all ${
                                location.pathname === '/my-courses'
                                    ? 'text-indigo-600 dark:text-white after:w-full font-semibold'
                                    : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white after:w-0'
                            }`}
                        >
                            My Courses
                        </Link>
                    )}
                </nav>

                {/* Right Actions: Theme toggle, Login, Get Started / Profile */}
                <div className="flex items-center gap-3.5">
                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/dashboard"
                                className="hidden sm:inline-flex text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white px-3 py-2 transition-colors"
                            >
                                Dashboard
                            </Link>

                            <div className="relative">
                                <button
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    className="flex items-center gap-2.5 bg-slate-100 dark:bg-surface-900 border border-slate-200 dark:border-slate-700/60 p-1.5 pr-3 rounded-full hover:border-indigo-500/40 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {user?.avatar?.url ? (
                                        <img
                                            src={user.avatar.url}
                                            alt={user.name}
                                            className="w-7 h-7 rounded-full object-cover border border-indigo-500"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/CodeCampus.png';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white font-bold text-xs">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs sm:text-sm max-w-[90px] truncate">
                                        {user?.name || 'Account'}
                                    </span>
                                </button>

                                {profileMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setProfileMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-surface-900 rounded-2xl shadow-2xl py-2 border border-slate-200 dark:border-slate-700/80 z-20 animate-fade-in">
                                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                                                <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{user?.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                                                <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                                                    {user?.role}
                                                </span>
                                            </div>

                                            <Link
                                                to="/profile"
                                                className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                onClick={() => setProfileMenuOpen(false)}
                                            >
                                                <FiUser className="text-indigo-500" />
                                                <span className="font-medium text-sm">Profile</span>
                                            </Link>

                                            <Link
                                                to="/dashboard"
                                                className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                onClick={() => setProfileMenuOpen(false)}
                                            >
                                                <FiSettings className="text-indigo-500" />
                                                <span className="font-medium text-sm">Dashboard</span>
                                            </Link>

                                            {user?.role === 'student' && (
                                                <Link
                                                    to="/my-courses"
                                                    className="flex items-center gap-3 px-4 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                    onClick={() => setProfileMenuOpen(false)}
                                                >
                                                    <FiBook className="text-emerald-500" />
                                                    <span className="font-medium text-sm">My Courses</span>
                                                </Link>
                                            )}

                                            <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 px-4 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 w-full text-left transition-colors"
                                                >
                                                    <FiLogOut />
                                                    <span className="font-medium text-sm">Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            {/* Login Button */}
                            <button
                                type="button"
                                onClick={() => openModal('login')}
                                className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white px-3 py-2 transition-colors cursor-pointer"
                            >
                                Login
                            </button>

                            {/* Primary Action Button */}
                            <button
                                type="button"
                                onClick={() => openModal('register')}
                                className="relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
                            >
                                Get Started
                            </button>
                        </div>
                    )}

                    {/* Mobile Hamburger Toggle */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Toggle navigation menu"
                    >
                        {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 top-20 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="relative z-50 md:hidden bg-[#060913] border-b border-white/[0.08] px-5 py-6 space-y-4 shadow-2xl">
                        <nav className="flex flex-col space-y-3">
                            <Link
                                to="/courses"
                                className="text-base font-medium text-slate-200 hover:text-indigo-400 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Courses
                            </Link>
                            <Link
                                to="/online-compiler"
                                className="text-base font-medium text-slate-200 hover:text-indigo-400 transition-colors flex items-center justify-between"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <span>Online Compiler</span>
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                                    LIVE
                                </span>
                            </Link>
                            {isAuthenticated && user?.role === 'student' && (
                                <Link
                                    to="/my-courses"
                                    className="text-base font-medium text-slate-200 hover:text-indigo-400 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    My Courses
                                </Link>
                            )}
                            {isAuthenticated && (
                                <Link
                                    to="/dashboard"
                                    className="text-base font-medium text-slate-200 hover:text-indigo-400 transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                            )}
                        </nav>

                        <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
                            {isAuthenticated ? (
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/40 text-sm flex items-center justify-center gap-2"
                                >
                                    <FiLogOut />
                                    <span>Logout</span>
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            openModal('login');
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full py-2.5 px-4 rounded-xl font-semibold text-slate-200 bg-surface-900 border border-slate-700 text-sm"
                                    >
                                        Login
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            openModal('register');
                                            setMobileMenuOpen(false);
                                        }}
                                        className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 text-sm"
                                    >
                                        Get Started
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </header>
    );
};

export default Navbar;
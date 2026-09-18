import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiBook } from 'react-icons/fi';
import ThemeToggle from '../ThemeToggle';
import OnlineCompiler from '../../pages/OnlineCompiler';

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
            if (window.scrollY > 48) {
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
        <nav className="sticky top-3 sm:top-4 md:top-5 z-50 flex justify-center px-2 sm:px-3 md:px-4">
            {/* Glass Pill Container */}
            <div className={`w-full sm:w-[98%] md:w-[98%] max-w-[95%] rounded-full backdrop-blur-xl border transition-all duration-300 ${
                isScrolled
                    ? 'bg-white/85 dark:bg-slate-950/90 border-slate-200/80 dark:border-indigo-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.35)]'
                    : 'bg-white/70 dark:bg-slate-900/50 border-white/80 dark:border-slate-700/30 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]'
            }`}>

                <div className="flex justify-between items-center h-16 sm:h-18 md:h-20 px-4 sm:px-6 md:px-8">

                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <img
                                src="/CodeCampus.png"
                                alt="CodeCampus"
                                className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 object-contain"
                            />
                        </div>

                        <div>
                            <span className="text-lg sm:text-xl md:text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                CodeCampus
                            </span>
                            <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">Learn Without Limits</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                        <Link
                            to="/courses"
                            className="text-sm lg:text-base text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors relative group"
                        >
                            Courses
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link to="/online-compiler"
                            className="text-sm lg:text-base text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors relative group"
                        >
                            Online Compiler
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                        </Link>

                        {isAuthenticated && user?.role === 'student' && (
                            <Link
                                to="/my-courses"
                                className="text-sm lg:text-base text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors relative group"
                            >
                                My Courses
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        )}
                    </div>

                    {/* Right side items (Auth/Profile + ThemeToggle) */}
                    <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
                        {/* Theme Toggle - Visible on all screen sizes */}
                        <div className="hidden sm:block">
                            <ThemeToggle />
                        </div>

                        {/* Auth / Profile - Desktop */}
                        <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
                            {isAuthenticated ? (
                                <div className="flex items-center space-x-2 xl:space-x-3">
                                    <Link
                                        to="/dashboard"
                                        className="text-sm lg:text-base text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors px-2 py-1"
                                    >
                                        Dashboard
                                    </Link>

                                    <div className="relative">
                                        <button
                                            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                            className="flex items-center space-x-2 lg:space-x-2.5 bg-white dark:bg-slate-900/50 backdrop-blur-md px-3 py-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-slate-900/70 transition-all border border-white/40 dark:border-slate-700/40 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                                        >
                                            {user?.avatar?.url ? (
                                                <img
                                                    src={user.avatar.url}
                                                    alt={user.name}
                                                    className="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover border border-blue-500 shadow"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/CodeCampus.png';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs lg:text-sm">
                                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                            )}
                                            <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm max-w-[100px] truncate">
                                                {user?.name || 'Profile'}
                                            </span>
                                            <svg className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {profileMenuOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setProfileMenuOpen(false)}
                                                />
                                                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl dark:shadow-slate-800 py-2 border border-gray-100 dark:border-slate-700/50 z-20 animate-fade-in">
                                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700/50">
                                                        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm truncate">{user?.name}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                                                        <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                                                            {user?.role}
                                                        </span>
                                                    </div>

                                                    <Link
                                                        to="/profile"
                                                        className="flex items-center space-x-3 px-4 py-2.5 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                                        onClick={() => setProfileMenuOpen(false)}
                                                    >
                                                        <FiUser className="text-base text-blue-500" />
                                                        <span className="font-medium text-sm">Profile</span>
                                                    </Link>

                                                    <Link
                                                        to="/dashboard"
                                                        className="flex items-center space-x-3 px-4 py-2.5 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                                        onClick={() => setProfileMenuOpen(false)}
                                                    >
                                                        <FiSettings className="text-base text-purple-500" />
                                                        <span className="font-medium text-sm">Dashboard</span>
                                                    </Link>

                                                    {user?.role === 'student' && (
                                                        <Link
                                                            to="/my-courses"
                                                            className="flex items-center space-x-3 px-4 py-2.5 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                                                            onClick={() => setProfileMenuOpen(false)}
                                                        >
                                                            <FiBook className="text-base text-green-500" />
                                                            <span className="font-medium text-sm">My Courses</span>
                                                        </Link>
                                                    )}

                                                    <div className="pt-1 mt-1 border-t border-gray-100 dark:border-slate-700/50">
                                                        <button
                                                            onClick={handleLogout}
                                                            className="flex items-center space-x-3 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 w-full text-left transition-colors"
                                                        >
                                                            <FiLogOut className="text-base" />
                                                            <span className="font-medium text-sm">Logout</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="text-sm lg:text-base text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold px-2 py-1 transition-colors flex items-center space-x-1"
                                        title="Logout"
                                    >
                                        <span>Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => openModal('login')}
                                        className="text-sm lg:text-base text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold transition-colors cursor-pointer px-3 py-1.5"
                                    >
                                        Login
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openModal('register')}
                                        className="btn-glow text-sm lg:text-base cursor-pointer py-2 px-5"
                                    >
                                        Get Started
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button - includes ThemeToggle for mobile */}
                        <div className="lg:hidden flex items-center space-x-2">
                            <div className="sm:hidden">
                                <ThemeToggle />
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                {mobileMenuOpen ? (
                                    <FiX className="text-xl sm:text-2xl text-gray-800 dark:text-gray-200" />
                                ) : (
                                    <FiMenu className="text-xl sm:text-2xl text-gray-800 dark:text-gray-200" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu - Appears Below Navbar */}
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop - Excludes Navbar from blur */}
                        <div 
                            className="fixed left-0 right-0 bottom-0 bg-black/40 z-40 lg:hidden"
                            style={{ top: 'calc(100% + 1rem)' }}
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        
                        {/* Dropdown Menu - Below Navbar */}
                        <div className="absolute left-2 right-2 sm:left-3 sm:right-3 top-full mt-3 z-50 lg:hidden">
                            <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700/50 overflow-hidden">
                                {/* Menu Items */}
                                <div className="px-4 sm:px-6 py-4 space-y-2 border-b border-gray-200 dark:border-slate-700/50">
                                    <Link 
                                        to="/courses" 
                                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-all font-semibold"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <FiBook className="text-lg text-blue-400" />
                                        <span>Courses</span>
                                    </Link>

                                    <Link 
                                        to="/online-compiler" 
                                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-all font-semibold"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                        <span>Online Compiler</span>
                                    </Link>

                                    {isAuthenticated && user?.role === 'student' && (
                                        <Link 
                                            to="/my-courses" 
                                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-all font-semibold"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <FiBook className="text-lg text-green-400" />
                                            <span>My Courses</span>
                                        </Link>
                                    )}

                                    {isAuthenticated && (
                                        <Link 
                                            to="/profile" 
                                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-all font-semibold"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <FiUser className="text-lg text-blue-500" />
                                            <span>View Profile</span>
                                        </Link>
                                    )}

                                    {isAuthenticated && (
                                        <Link 
                                            to="/dashboard" 
                                            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-all font-semibold"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            <FiSettings className="text-lg text-orange-400" />
                                            <span>Dashboard</span>
                                        </Link>
                                    )}
                                </div>

                                {/* Auth Section */}
                                <div className="px-4 sm:px-6 py-4">
                                    {isAuthenticated ? (
                                        <div className="space-y-3">
                                            {/* User Info Card */}
                                            <div className="bg-gray-100 dark:bg-slate-800/50 rounded-lg p-3 border border-gray-300 dark:border-slate-700/50">
                                                <div className="flex items-center space-x-3">
                                                    {user?.avatar?.url ? (
                                                        <img
                                                            src={user.avatar.url}
                                                            alt={user.name}
                                                            className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = '/CodeCampus.png';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                            {user?.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{user?.name}</p>
                                                        <p className="text-xs text-gray-600 dark:text-gray-400 capitalize truncate">{user?.role}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Logout Button */}
                                            <button
                                                onClick={() => {
                                                    handleLogout();
                                                    setMobileMenuOpen(false);
                                                }}
                                                className="w-full flex items-center justify-center space-x-2 bg-red-100 dark:bg-red-600/20 text-red-600 dark:text-red-400 font-semibold py-3 rounded-lg hover:bg-red-200 dark:hover:bg-red-600/30 transition-colors border border-red-300 dark:border-red-500/30"
                                            >
                                                <FiLogOut className="text-base" />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    openModal('login');
                                                    setMobileMenuOpen(false);
                                                }}
                                                className="w-full block text-center border-2 border-blue-500/50 text-blue-600 dark:text-blue-400 py-3 font-bold rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors text-sm cursor-pointer"
                                            >
                                                Login
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    openModal('register');
                                                    setMobileMenuOpen(false);
                                                }}
                                                className="w-full block text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 font-bold rounded-lg hover:scale-[1.02] transition-transform shadow-lg shadow-blue-500/20 text-sm cursor-pointer"
                                            >
                                                Get Started
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
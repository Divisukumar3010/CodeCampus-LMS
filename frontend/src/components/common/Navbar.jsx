import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiBook } from 'react-icons/fi';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        setProfileMenuOpen(false);
        navigate('/login');
    };

    return (
        <nav className="sticky top-5 z-50 flex justify-center">
            {/* Glass Pill Container */}
            <div className="w-[98%] max-w-[90%] rounded-full bg-white/30 backdrop-blur-xl border border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">

                <div className="flex justify-between items-center h-20 px-8">

                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <img
                                src="/CodeCampus.png"
                                alt="LearnHub"
                                className="w-10 h-10 object-contain"
                            />
                        </div>

                        <div>
                            <span className="text-2xl font-extrabold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                CodeCampus
                            </span>
                            <p className="text-xs text-gray-600 font-medium">Learn Without Limits</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/courses"
                            className="text-gray-800 hover:text-primary-600 font-semibold transition-colors relative group"
                        >
                            Courses
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 group-hover:w-full transition-all duration-300"></span>
                        </Link>

                        {isAuthenticated && (
                            <Link
                                to="/dashboard"
                                className="text-gray-800 hover:text-primary-600 font-semibold transition-colors relative group"
                            >
                                Dashboard
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-secondary-600 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        )}
                    </div>

                    {/* Auth / Profile */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                    className="flex items-center space-x-3 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full hover:bg-white/60 transition-all border border-white/30 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    {user?.avatar?.url ? (
                                        <img
                                            src={user.avatar.url}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/CodeCampus.png';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="text-left">
                                        <p className="font-bold text-gray-900 text-sm">{user?.name}</p>
                                        <p className="text-xs text-gray-700 capitalize">{user?.role}</p>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {profileMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setProfileMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 mt-4 w-64 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl py-2 border border-white/30 z-20">
                                            <div className="px-4 py-3 border-b border-white/30">
                                                <p className="font-bold text-gray-900">{user?.name}</p>
                                                <p className="text-sm text-gray-700">{user?.email}</p>
                                            </div>

                                            <Link
                                                to="/dashboard"
                                                className="flex items-center space-x-3 px-4 py-3 text-gray-800 hover:bg-primary-50 transition-colors"
                                                onClick={() => setProfileMenuOpen(false)}
                                            >
                                                <FiSettings className="text-lg" />
                                                <span className="font-medium">Dashboard</span>
                                            </Link>

                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left transition-colors"
                                            >
                                                <FiLogOut className="text-lg" />
                                                <span className="font-medium">Logout</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-800 hover:text-primary-600 font-semibold transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-bold px-6 py-3 rounded-full transition-all shadow-lg hover:scale-105"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-full hover:bg-white/40 transition-colors"
                    >
                        {mobileMenuOpen ? (
                            <FiX className="text-2xl text-gray-800" />
                        ) : (
                            <FiMenu className="text-2xl text-gray-800" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white/70 backdrop-blur-xl border-t border-white/30 rounded-b-3xl shadow-lg">
                        <div className="px-8 py-6 space-y-4">
                            <Link to="/courses" className="block font-semibold text-gray-800">
                                Courses
                            </Link>

                            {isAuthenticated ? (
                                <>
                                    <Link to="/dashboard" className="block font-semibold text-gray-800">
                                        Dashboard
                                    </Link>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full bg-red-50 text-red-600 font-semibold py-3 rounded-xl"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="block text-center border border-primary-600 text-primary-600 py-3 rounded-xl">
                                        Login
                                    </Link>
                                    <Link to="/register" className="block text-center bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-3 rounded-xl">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>

    );
};

export default Navbar;
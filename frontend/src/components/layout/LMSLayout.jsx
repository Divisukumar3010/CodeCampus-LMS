import { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import {
    FiHome,
    FiBookOpen,
    FiAward,
    FiCalendar,
    FiTerminal,
    FiUser,
    FiLogOut,
    FiMenu,
    FiX,
    FiChevronLeft,
    FiChevronRight,
    FiPlusCircle,
    FiUsers,
    FiCheckSquare,
    FiPieChart,
    FiGrid,
    FiLayers,
    FiCompass
} from 'react-icons/fi';
import ThemeToggle from '../ThemeToggle';

const LMSLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const { isDarkMode } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // Role-based navigation definition
    const role = user?.role || 'student';

    const studentNav = [
        { label: 'Dashboard', path: '/dashboard', icon: FiHome, exact: true },
        { label: 'My Courses', path: '/my-courses', icon: FiBookOpen },
        { label: 'Course Catalog', path: '/courses', icon: FiCompass },
        { label: 'Grades & Exams', path: '/grades', icon: FiAward },
        { label: 'Academic Calendar', path: '/calendar', icon: FiCalendar },
        { label: 'Code Lab (Compiler)', path: '/online-compiler', icon: FiTerminal },
    ];

    const trainerNav = [
        { label: 'Faculty Dashboard', path: '/dashboard', icon: FiHome, exact: true },
        { label: 'Create Course', path: '/create-course', icon: FiPlusCircle },
        { label: 'Course Catalog', path: '/courses', icon: FiCompass },
        { label: 'Code Lab (Compiler)', path: '/online-compiler', icon: FiTerminal },
    ];

    const adminNav = [
        { label: 'Admin Dashboard', path: '/dashboard', icon: FiPieChart, exact: true },
        { label: 'Course Directory', path: '/courses', icon: FiBookOpen },
        { label: 'Code Lab (Compiler)', path: '/online-compiler', icon: FiTerminal },
    ];

    let navItems = studentNav;
    if (role === 'trainer') navItems = trainerNav;
    if (role === 'admin') navItems = adminNav;

    // Breadcrumb generator based on current path
    const getBreadcrumb = () => {
        const path = location.pathname;
        if (path === '/dashboard') return [{ label: 'LMS Portal', path: '/dashboard' }, { label: 'Overview' }];
        if (path === '/my-courses') return [{ label: 'LMS Portal', path: '/dashboard' }, { label: 'My Courses' }];
        if (path === '/grades') return [{ label: 'LMS Portal', path: '/dashboard' }, { label: 'Grades & Academic Records' }];
        if (path === '/calendar') return [{ label: 'LMS Portal', path: '/dashboard' }, { label: 'Academic Calendar' }];
        if (path === '/courses') return [{ label: 'LMS Portal', path: '/dashboard' }, { label: 'Course Catalog' }];
        if (path === '/create-course') return [{ label: 'Faculty Portal', path: '/dashboard' }, { label: 'Course Curriculum Builder' }];
        if (path === '/online-compiler') return [{ label: 'LMS Portal', path: '/dashboard' }, { label: 'Interactive Code Lab' }];
        if (path === '/profile') return [{ label: 'LMS Portal', path: '/dashboard' }, { label: 'User Profile' }];
        if (path === '/profile/edit') return [{ label: 'LMS Portal', path: '/dashboard' }, { label: 'Edit Profile' }];
        if (path.startsWith('/courses/') && path.endsWith('/edit')) return [{ label: 'Faculty', path: '/dashboard' }, { label: 'Edit Course' }];
        if (path.startsWith('/course/view/')) return [{ label: 'Courses', path: '/my-courses' }, { label: 'Learning Workspace' }];
        if (path.startsWith('/course/') && path.endsWith('/exam')) return [{ label: 'Courses', path: '/my-courses' }, { label: 'Exam Session' }];
        return [{ label: 'LMS Portal', path: '/dashboard' }, { label: 'Page' }];
    };

    const breadcrumbs = getBreadcrumb();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
            {/* Top Academic Header */}
            <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 sm:px-6 transition-colors duration-200">
                <div className="flex items-center gap-3">
                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label="Open navigation menu"
                    >
                        <FiMenu size={20} />
                    </button>

                    {/* Logo & Portal Identity */}
                    <Link to="/dashboard" className="flex items-center gap-2.5 group">
                        <img
                            src="/CodeCampus.png"
                            alt="CodeCampus"
                            className="w-8 h-8 object-contain rounded"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                            }}
                        />
                        <div className="flex flex-col">
                            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                                CodeCampus
                                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">
                                    LMS
                                </span>
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Breadcrumbs */}
                    <div className="hidden md:flex items-center gap-1.5 ml-6 pl-6 border-l border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
                        {breadcrumbs.map((crumb, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                                {idx > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
                                {crumb.path ? (
                                    <Link to={crumb.path} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{crumb.label}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right controls: Theme, Role Pill, User avatar menu */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />

                    <div className="hidden sm:flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 capitalize">
                        {role === 'student' && '🎓 Student'}
                        {role === 'trainer' && '👨‍🏫 Faculty'}
                        {role === 'admin' && '🛡️ Administrator'}
                    </div>

                    <Link
                        to="/profile"
                        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
                    >
                        {user?.avatar?.url ? (
                            <img
                                src={user.avatar.url}
                                alt={user.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        )}
                        <div className="hidden xl:block">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
                                {user?.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize leading-tight">
                                {role}
                            </p>
                        </div>
                    </Link>

                    <button
                        onClick={handleLogout}
                        title="Sign Out"
                        className="p-2 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                        <FiLogOut size={17} />
                    </button>
                </div>
            </header>

            {/* Main Shell Body (Sidebar + Content) */}
            <div className="flex flex-1 relative">
                {/* Desktop Left Sidebar */}
                <aside
                    className={`hidden lg:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'
                        } flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto`}
                >
                    {/* Collapse / Expand toggle button */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800/80">
                        {!isCollapsed && (
                            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                                Academic Navigation
                            </span>
                        )}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 ml-auto transition"
                            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {isCollapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="p-3 space-y-1 flex-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = item.exact
                                ? location.pathname === item.path
                                : location.pathname.startsWith(item.path);

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.exact}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-l-4 border-indigo-600 dark:border-indigo-500 font-semibold'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                                        } ${isCollapsed ? 'justify-center px-2' : ''}`
                                    }
                                    title={isCollapsed ? item.label : undefined}
                                >
                                    <Icon size={18} className="flex-shrink-0" />
                                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* Bottom Quick Card / System Meta */}
                    {!isCollapsed && (
                        <div className="p-4 m-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">CodeCampus Academic</p>
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed mb-2.5">
                                Academic Year 2026-27 • Active Term
                            </p>
                            <Link
                                to="/courses"
                                className="inline-flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:underline text-[11px]"
                            >
                                Explore Catalog →
                            </Link>
                        </div>
                    )}
                </aside>

                {/* Mobile Drawer Navigation */}
                {mobileOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden flex">
                        <div
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                            onClick={() => setMobileOpen(false)}
                        />
                        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <img src="/CodeCampus.png" alt="CodeCampus" className="w-7 h-7 object-contain" />
                                    <span className="font-bold text-sm text-slate-900 dark:text-white">CodeCampus LMS</span>
                                </div>
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            <nav className="mt-4 space-y-1 flex-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            end={item.exact}
                                            onClick={() => setMobileOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold border-l-4 border-indigo-600'
                                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`
                                            }
                                        >
                                            <Icon size={18} />
                                            <span>{item.label}</span>
                                        </NavLink>
                                    );
                                })}
                            </nav>

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100"
                                >
                                    <FiLogOut size={16} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Content Workspace */}
                <main className="flex-1 w-full min-w-0 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default LMSLayout;

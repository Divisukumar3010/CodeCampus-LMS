import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI, adminAPI } from '../../services/api';
import { FiUsers, FiBook, FiDollarSign, FiTrendingUp, FiCheckCircle, FiClock, FiX, FiCheck, FiChevronDown, FiUser, FiEdit, FiSearch, FiMail, FiCalendar, FiShield } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import CoursesTable from './CoursesTable';
import D3RevenueAreaChart from '../d3/D3RevenueAreaChart';
import D3UserDistributionDonut from '../d3/D3UserDistributionDonut';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [pendingCourses, setPendingCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [rejectReason, setRejectReason] = useState({});
    const [showRejectForm, setShowRejectForm] = useState({});
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    // Users Management State
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
    const [userSearchQuery, setUserSearchQuery] = useState('');

    useEffect(() => {
        fetchDashboardStats();
        fetchPendingCourses();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const response = await adminAPI.getDashboard();
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setUsersLoading(true);
            const response = await adminAPI.getUsers({ limit: 100 });
            setUsers(response.data.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users list');
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'users' && users.length === 0) {
            fetchUsers();
        }
    }, [activeTab]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminAPI.updateUserRole(userId, { role: newRole });
            toast.success(`User role updated to ${newRole}`);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
            fetchDashboardStats();
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Failed to update user role');
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        try {
            await adminAPI.updateUserStatus(userId, { isActive: !currentStatus });
            toast.success(`User account ${!currentStatus ? 'activated' : 'deactivated'}`);
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update user status');
        }
    };

    const fetchPendingCourses = async () => {
        try {
            const response = await courseAPI.getPendingCourses();
            setPendingCourses(response.data.courses || []);
        } catch (error) {
            console.error('Error fetching pending courses:', error);
            toast.error('Failed to load pending courses');
        }
    };

    const handleApproveCourse = async (courseId) => {
        try {
            await courseAPI.approveCourse(courseId);
            toast.success('Course approved successfully!');
            setPendingCourses(pendingCourses.filter(c => c._id !== courseId));
            setSelectedCourse(null);
            fetchDashboardStats();
        } catch (error) {
            console.error('Error approving course:', error);
            toast.error('Failed to approve course');
        }
    };

    const handleRejectCourse = async (courseId) => {
        try {
            const reason = rejectReason[courseId] || 'No reason provided';
            await courseAPI.rejectCourse(courseId, { reason });
            toast.success('Course rejected successfully!');
            setPendingCourses(pendingCourses.filter(c => c._id !== courseId));
            setRejectReason(prev => ({ ...prev, [courseId]: '' }));
            setShowRejectForm(prev => ({ ...prev, [courseId]: false }));
            setSelectedCourse(null);
            fetchDashboardStats();
        } catch (error) {
            console.error('Error rejecting course:', error);
            toast.error('Failed to reject course');
        }
    };

    const toggleSection = (sectionIndex) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionIndex]: !prev[sectionIndex]
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="spinner"></div>
            </div>
        );
    }

    // Transform monthly revenue data for chart
    const chartData = stats?.revenue?.monthlyRevenue?.map(item => ({
        month: `${item._id.month}/${item._id.year}`,
        revenue: item.revenue,
        orders: item.orders
    })) || [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
                        <p className="text-gray-600 dark:text-slate-400">Platform overview and management</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link to="/profile" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition font-semibold text-sm">
                            <FiUser size={16} /> View Profile
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8">
                    <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-sm p-6 border-l-4 border-primary-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-slate-300 text-sm font-medium">Total Users</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.users?.total || 0}</p>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                                    {stats?.users?.totalStudents} students, {stats?.users?.totalTrainers} trainers, {stats?.users?.totalAdmins} admins
                                </p>
                            </div>
                            <FiUsers className="text-primary-500 text-4xl" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-sm p-6 border-l-4 border-secondary-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-slate-300 text-sm font-medium">Total Courses</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.courses?.total || 0}</p>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                                    {stats?.courses?.published} published
                                    {stats?.courses?.draft > 0 ? `, ${stats.courses.draft} draft` : ''}
                                    {stats?.courses?.rejected ? `, ${stats.courses.rejected} rejected` : ''}
                                </p>

                            </div>
                            <FiBook className="text-secondary-500 text-4xl" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-slate-300 text-sm font-medium">Total Revenue</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                    ₹{stats?.revenue?.total?.toFixed(2) || '0.00'}

                                </p>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                                    {stats?.revenue?.totalOrders} orders
                                </p>
                            </div>
                            <FiDollarSign className="text-green-500 text-4xl" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-slate-300 text-sm font-medium">Pending Approval</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                    {pendingCourses.length}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Courses awaiting review</p>
                            </div>
                            <FiClock className="text-yellow-500 text-4xl" />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm mb-8">
                    <div className="border-b border-gray-200 dark:border-slate-800">
                        <nav className="flex flex-wrap gap-2 sm:gap-0 sm:space-x-8 px-4 sm:px-6 overflow-x-auto">
                            {['overview', 'approvals', 'courses', 'users', 'recent orders'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition ${activeTab === tab
                                        ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                                        : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-700'
                                        }`}
                                >
                                    {tab}
                                    {tab === 'approvals' && pendingCourses.length > 0 && (
                                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                            {pendingCourses.length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'approvals' && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Pending Course Approvals</h3>
                                {pendingCourses.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FiCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
                                        <p className="text-gray-600 dark:text-slate-400 text-lg">All courses have been reviewed!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {pendingCourses.map(course => (
                                            <div key={course._id} className="border border-gray-200 dark:border-slate-800 rounded-lg p-6 hover:shadow-md dark:hover:shadow-slate-700 transition bg-white dark:bg-slate-800">
                                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                    <div className="flex-grow">
                                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{course.title}</h4>
                                                        <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                                                            By {course.trainer?.name} ({course.trainer?.email})
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 line-clamp-2">{course.description}</p>
                                                        <div className="flex gap-4 mt-3 text-sm text-gray-600 dark:text-slate-400">
                                                            <span>📚 {course.totalLessons || 0} lessons</span>
                                                            <span>💰 ₹{course.price}</span>
                                                            <span>📁 {course.category?.name}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-3 flex-shrink-0">
                                                        <button
                                                            onClick={() => setSelectedCourse(course)}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                                                        >
                                                            View Details
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveCourse(course._id)}
                                                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                                                        >
                                                            <FiCheck size={18} />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => setShowRejectForm(prev => ({ ...prev, [course._id]: !prev[course._id] }))}
                                                            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                                                        >
                                                            <FiX size={18} />
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Reject Form */}
                                                {showRejectForm[course._id] && (
                                                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                                        <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                                                            Rejection Reason
                                                        </label>
                                                        <textarea
                                                            value={rejectReason[course._id] || ''}
                                                            onChange={(e) => setRejectReason(prev => ({ ...prev, [course._id]: e.target.value }))}
                                                            placeholder="Explain why you're rejecting this course..."
                                                            className="w-full p-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                                                            rows={3}
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleRejectCourse(course._id)}
                                                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
                                                            >
                                                                Confirm Rejection
                                                            </button>
                                                            <button
                                                                onClick={() => setShowRejectForm(prev => ({ ...prev, [course._id]: false }))}
                                                                className="bg-gray-300 dark:bg-slate-700 text-gray-700 dark:text-slate-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-600 transition font-semibold"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'overview' && (
                            <div className="space-y-8">
                                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900/50">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                <FiTrendingUp className="text-indigo-600 dark:text-indigo-400" />
                                                Revenue & Transaction Trends
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                                Interactive D3 transaction timeline with hover inspection and volume breakdown
                                            </p>
                                        </div>
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 self-start sm:self-auto">
                                            D3 Smooth Spline
                                        </span>
                                    </div>
                                    {chartData.length > 0 ? (
                                        <D3RevenueAreaChart data={chartData} height={300} />
                                    ) : (
                                        <p className="text-gray-500 dark:text-slate-400 text-center py-8">No revenue data available</p>
                                    )}
                                </div>

                                {/* D3 User Demographics Breakdown */}
                                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 bg-white dark:bg-slate-900/50">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                <FiUsers className="text-primary-600 dark:text-primary-400" />
                                                Community Demographics
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-slate-400">
                                                Role distribution across Students, Trainers, and System Administrators
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('users')}
                                            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                                        >
                                            View User Directory →
                                        </button>
                                    </div>

                                    <D3UserDistributionDonut
                                        students={stats?.users?.totalStudents || 0}
                                        trainers={stats?.users?.totalTrainers || 0}
                                        admins={stats?.users?.totalAdmins || 0}
                                        size={190}
                                        onSelectRole={(role) => {
                                            setSelectedRoleFilter(role);
                                            setActiveTab('users');
                                            fetchUsers();
                                        }}
                                    />
                                </div>
                            </div>
                        )}



                        {activeTab === 'courses' && (
                            <CoursesTable
                                title="Courses"
                                courses={stats?.topCourses || []}
                            />
                        )}




                        {activeTab === 'users' && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Directory & Management</h3>
                                        <p className="text-sm text-gray-500 dark:text-slate-400">View and manage all registered users categorized by their assigned system role.</p>
                                    </div>
                                    <button
                                        onClick={fetchUsers}
                                        disabled={usersLoading}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-lg text-sm font-semibold transition"
                                    >
                                        <FiClock size={15} />
                                        Refresh Users
                                    </button>
                                </div>

                                {/* Role Summary Cards (Clickable filters) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <div
                                        onClick={() => setSelectedRoleFilter('all')}
                                        className={`p-5 rounded-xl border cursor-pointer transition-all ${
                                            selectedRoleFilter === 'all'
                                                ? 'bg-slate-900 text-white dark:bg-indigo-600 border-transparent shadow-md'
                                                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold uppercase tracking-wider">All Users</span>
                                            <FiUsers size={18} />
                                        </div>
                                        <p className="text-3xl font-extrabold">{users.length || stats?.users?.totalUsers || 0}</p>
                                    </div>

                                    <div
                                        onClick={() => setSelectedRoleFilter('student')}
                                        className={`p-5 rounded-xl border cursor-pointer transition-all ${
                                            selectedRoleFilter === 'student'
                                                ? 'bg-blue-600 text-white border-transparent shadow-md'
                                                : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 hover:border-blue-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Students</span>
                                            <FiUser size={18} className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <p className="text-3xl font-extrabold text-blue-700 dark:text-blue-300">
                                            {stats?.users?.totalStudents || users.filter(u => u.role === 'student').length}
                                        </p>
                                    </div>

                                    <div
                                        onClick={() => setSelectedRoleFilter('trainer')}
                                        className={`p-5 rounded-xl border cursor-pointer transition-all ${
                                            selectedRoleFilter === 'trainer'
                                                ? 'bg-purple-600 text-white border-transparent shadow-md'
                                                : 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40 hover:border-purple-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">Trainers</span>
                                            <FiBook size={18} className="text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <p className="text-3xl font-extrabold text-purple-700 dark:text-purple-300">
                                            {stats?.users?.totalTrainers || users.filter(u => u.role === 'trainer').length}
                                        </p>
                                    </div>

                                    <div
                                        onClick={() => setSelectedRoleFilter('admin')}
                                        className={`p-5 rounded-xl border cursor-pointer transition-all ${
                                            selectedRoleFilter === 'admin'
                                                ? 'bg-emerald-600 text-white border-transparent shadow-md'
                                                : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Admins</span>
                                            <FiShield size={18} className="text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300">
                                            {stats?.users?.totalAdmins || users.filter(u => u.role === 'admin').length}
                                        </p>
                                    </div>
                                </div>

                                {/* Filters & Search Toolbar */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-800">
                                    <div className="relative w-full sm:w-80">
                                        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search by name or email..."
                                            value={userSearchQuery}
                                            onChange={(e) => setUserSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {/* Role Pill Filters */}
                                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                                        {['all', 'student', 'trainer', 'admin'].map(role => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => setSelectedRoleFilter(role)}
                                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                                                    selectedRoleFilter === role
                                                        ? 'bg-indigo-600 text-white shadow-sm'
                                                        : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                {role === 'all' ? 'All Roles' : `${role}s`}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Detailed Users Table */}
                                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                    {usersLoading ? (
                                        <div className="py-12 text-center text-gray-500 dark:text-slate-400 flex flex-col items-center justify-center gap-3">
                                            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                            <p className="text-sm font-medium">Loading user directory...</p>
                                        </div>
                                    ) : (() => {
                                        const filtered = users.filter(u => {
                                            const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
                                            const matchesSearch = !userSearchQuery ||
                                                u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                                                u.email?.toLowerCase().includes(userSearchQuery.toLowerCase());
                                            return matchesRole && matchesSearch;
                                        });

                                        if (filtered.length === 0) {
                                            return (
                                                <div className="py-12 text-center text-gray-500 dark:text-slate-400">
                                                    <FiUsers className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                                    <p className="text-base font-semibold">No users found</p>
                                                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search query or role filter</p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/40 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                                                        <th className="py-3.5 px-4 sm:px-6">User Profile</th>
                                                        <th className="py-3.5 px-4 sm:px-6">Email Address</th>
                                                        <th className="py-3.5 px-4 sm:px-6">Role</th>
                                                        <th className="py-3.5 px-4 sm:px-6">Auth Provider</th>
                                                        <th className="py-3.5 px-4 sm:px-6">Status</th>
                                                        <th className="py-3.5 px-4 sm:px-6">Joined Date</th>
                                                        <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 text-sm">
                                                    {filtered.map(userItem => (
                                                        <tr key={userItem._id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/30 transition-colors">
                                                            {/* User Profile */}
                                                            <td className="py-3.5 px-4 sm:px-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-sm flex-shrink-0">
                                                                        {userItem.avatar?.url && !userItem.avatar.url.includes('ui-avatars') ? (
                                                                            <img src={userItem.avatar.url} alt={userItem.name} className="w-full h-full rounded-full object-cover" />
                                                                        ) : (
                                                                            userItem.name?.charAt(0).toUpperCase() || 'U'
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-semibold text-gray-900 dark:text-white leading-snug">{userItem.name}</p>
                                                                        <span className="text-[11px] font-mono text-gray-400 dark:text-slate-500">ID: {userItem._id?.slice(-6).toUpperCase()}</span>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Email */}
                                                            <td className="py-3.5 px-4 sm:px-6">
                                                                <span className="text-gray-700 dark:text-slate-300 font-medium text-xs sm:text-sm">
                                                                    {userItem.email}
                                                                </span>
                                                            </td>

                                                            {/* Role Badge */}
                                                            <td className="py-3.5 px-4 sm:px-6">
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                                                                    userItem.role === 'admin'
                                                                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                                                        : userItem.role === 'trainer'
                                                                        ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                                                                        : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                                                }`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                                        userItem.role === 'admin' ? 'bg-emerald-500' : userItem.role === 'trainer' ? 'bg-purple-500' : 'bg-blue-500'
                                                                    }`} />
                                                                    {userItem.role}
                                                                </span>
                                                            </td>

                                                            {/* Provider */}
                                                            <td className="py-3.5 px-4 sm:px-6">
                                                                <span className="text-xs uppercase font-semibold tracking-wider text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                                                                    {userItem.authProvider || 'local'}
                                                                </span>
                                                            </td>

                                                            {/* Status */}
                                                            <td className="py-3.5 px-4 sm:px-6">
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                    userItem.isActive !== false
                                                                        ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400'
                                                                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'
                                                                }`}>
                                                                    {userItem.isActive !== false ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </td>

                                                            {/* Joined Date */}
                                                            <td className="py-3.5 px-4 sm:px-6 text-xs text-gray-500 dark:text-slate-400">
                                                                {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                }) : 'N/A'}
                                                            </td>

                                                            {/* Role Change & Status Toggle */}
                                                            <td className="py-3.5 px-4 sm:px-6 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <select
                                                                        value={userItem.role}
                                                                        onChange={(e) => handleRoleChange(userItem._id, e.target.value)}
                                                                        className="text-xs py-1 px-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                                    >
                                                                        <option value="student">Student</option>
                                                                        <option value="trainer">Trainer</option>
                                                                        <option value="admin">Admin</option>
                                                                    </select>
                                                                    <button
                                                                        onClick={() => handleStatusToggle(userItem._id, userItem.isActive !== false)}
                                                                        title={userItem.isActive !== false ? 'Deactivate User' : 'Activate User'}
                                                                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                                                                            userItem.isActive !== false
                                                                                ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100'
                                                                                : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                                                                        }`}
                                                                    >
                                                                        {userItem.isActive !== false ? 'Disable' : 'Enable'}
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        {activeTab === 'recent orders' && (
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Orders</h3>

                                {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
                                    <div className="text-center">
                                        <p className="text-gray-500 dark:text-slate-400 text-center py-8">No recent orders</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {stats.recentOrders.map(order => (
                                            <div
                                                key={order._id}
                                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg"
                                            >
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-gray-900 dark:text-white">
                                                        {order.course?.title || 'Unknown Course'}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-slate-400">
                                                        {order.user?.name} • {order.user?.email}
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <p className="font-bold text-green-600 dark:text-green-400">
                                                        ₹{order.amount.toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-slate-400">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>

                {/* Course Details Modal */}
                {selectedCourse && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4">
                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-3xl w-full max-h-screen overflow-y-auto">
                            {/* Modal Header */}
                            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Course Details</h2>
                                <button
                                    onClick={() => setSelectedCourse(null)}
                                    className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                                >
                                    <FiX size={24} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-6 space-y-6">
                                {/* Course Header */}
                                <div>
                                    <div className="flex gap-4 mb-4">
                                        <img
                                            src={selectedCourse.thumbnail?.url}
                                            alt={selectedCourse.title}
                                            className="w-32 h-24 rounded-lg object-cover"
                                        />
                                        <div className="flex-grow">
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCourse.title}</h3>
                                            <p className="text-gray-600 dark:text-slate-400 mt-1">{selectedCourse.subtitle}</p>
                                            <div className="flex gap-4 mt-3 text-sm text-gray-600 dark:text-slate-400">
                                                <span>👤 {selectedCourse.trainer?.name}</span>
                                                <span>📚 {selectedCourse.totalLessons} lessons</span>
                                                <span>⏱️ {Math.round(selectedCourse.totalDuration / 60)} mins</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Description</h4>
                                    <p className="text-gray-600 dark:text-slate-400">{selectedCourse.description}</p>
                                </div>

                                {/* Course Info Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-slate-400">Category</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{selectedCourse.category?.name}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-slate-400">Level</p>
                                        <p className="font-semibold text-gray-900 dark:text-white capitalize">{selectedCourse.level}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-slate-400">Price</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">₹{selectedCourse.price}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 dark:text-slate-400">Language</p>
                                        <p className="font-semibold text-gray-900 dark:text-white">{selectedCourse.language}</p>
                                    </div>
                                </div>

                                {/* What You'll Learn */}
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-3">What You'll Learn</h4>
                                    <ul className="space-y-2">
                                        {selectedCourse.whatYouWillLearn?.map((item, idx) => (
                                            <li key={idx} className="flex gap-2 text-gray-600 dark:text-slate-400">
                                                <span className="text-green-500">✓</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Requirements */}
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-3">Requirements</h4>
                                    <ul className="space-y-2">
                                        {selectedCourse.requirements?.map((item, idx) => (
                                            <li key={idx} className="text-gray-600 dark:text-slate-400">• {item}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Course Sections */}
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-3">Course Curriculum</h4>
                                    <div className="space-y-2">
                                        {selectedCourse.sections?.map((section, idx) => (
                                            <div key={idx} className="border border-gray-200 dark:border-slate-800 rounded-lg">
                                                <button
                                                    onClick={() => toggleSection(idx)}
                                                    className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                                                >
                                                    <div className="text-left">
                                                        <p className="font-semibold text-gray-900 dark:text-white">{section.title}</p>
                                                        <p className="text-sm text-gray-600 dark:text-slate-400">{section.lessons?.length} lessons</p>
                                                    </div>
                                                    <FiChevronDown className={`transition text-gray-600 dark:text-slate-400 ${expandedSections[idx] ? 'rotate-180' : ''}`} />
                                                </button>
                                                {expandedSections[idx] && (
                                                    <div className="p-4 space-y-2 border-t border-gray-200 dark:border-slate-800">
                                                        {section.lessons?.map((lesson, lessonIdx) => (
                                                            <div key={lessonIdx} className="p-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded">
                                                                <p className="font-medium text-gray-900 dark:text-white">{lesson.title}</p>
                                                                <p className="text-sm text-gray-500 dark:text-slate-400">{lesson.videoDuration} seconds</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Modal Actions */}
                                <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-slate-800">
                                    <button
                                        onClick={() => handleApproveCourse(selectedCourse._id)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                                    >
                                        <FiCheck size={20} />
                                        Approve Course
                                    </button>
                                    <button
                                        onClick={() => setSelectedCourse(null)}
                                        className="flex-1 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-200 px-4 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-700 transition font-semibold"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
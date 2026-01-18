import { useState, useEffect } from 'react';
import { courseAPI, adminAPI } from '../../services/api';
import { FiUsers, FiBook, FiDollarSign, FiTrendingUp, FiCheckCircle, FiClock, FiX, FiCheck, FiChevronDown } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import CoursesTable from './CoursesTable'

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [pendingCourses, setPendingCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [rejectReason, setRejectReason] = useState({});
    const [showRejectForm, setShowRejectForm] = useState({});
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
                <p className="text-gray-600 dark:text-slate-400">Platform overview and management</p>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
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
                    <nav className="flex space-x-8 px-6">
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
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Revenue Trend</h3>
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                                        <XAxis dataKey="month" stroke="#9ca3af" />
                                        <YAxis stroke="#9ca3af" />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="revenue" stroke="#3B82F6" name="Revenue (₹)" />
                                        <Line type="monotone" dataKey="orders" stroke="#8B5CF6" name="Orders" />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-gray-500 dark:text-slate-400 text-center py-8">No revenue data available</p>
                            )}
                        </div>
                    )}



                    {activeTab === 'courses' && (
                        <CoursesTable
                            title="Courses"
                            courses={stats?.topCourses || []}
                        />
                    )}




                    {activeTab === 'users' && (
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">User Management</h3>
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-6 border border-primary-200 dark:border-primary-800">
                                    <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-2">Students</p>
                                    <p className="text-3xl font-bold text-primary-700 dark:text-primary-300">{stats?.users?.totalStudents}</p>
                                </div>
                                <div className="bg-secondary-50 dark:bg-secondary-900/20 rounded-lg p-6 border border-secondary-200 dark:border-secondary-800">
                                    <p className="text-sm text-secondary-600 dark:text-secondary-400 font-medium mb-2">Trainers</p>
                                    <p className="text-3xl font-bold text-secondary-700 dark:text-secondary-300">{stats?.users?.totalTrainers}</p>
                                </div>
                                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                                    <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">Admins</p>
                                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats?.users?.totalAdmins}</p>
                                </div>
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
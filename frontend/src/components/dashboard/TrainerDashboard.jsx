import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { FiBook, FiUsers, FiDollarSign, FiStar, FiPlus, FiEdit, FiEye, FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

const TrainerDashboard = () => {
    const location = useLocation();
    const [courses, setCourses] = useState([]);
    const [bestCourse, setBestCourse] = useState(null);
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalEnrollments: 0,
        totalRevenue: 0,
        averageRating: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [location]); // Refetch whenever location changes (navigating back from create/edit)

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getTrainerCourses();
            setCourses(response.data.courses || []);
            setBestCourse(response.data.bestCourse);
            setStats(response.data.stats || {
                totalCourses: 0,
                totalEnrollments: 0,
                totalRevenue: 0,
                averageRating: 0,
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchData();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Trainer Dashboard</h1>
                        <p className="text-gray-600 dark:text-slate-400">Manage your courses and track performance</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link to="/profile" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition font-semibold text-sm">
                            <FiUser size={16} /> View Profile
                        </Link>
                        <Link to="/create-course" className="btn-primary flex items-center gap-2 shadow-lg dark:shadow-slate-700 hover:shadow-xl">
                            <FiPlus size={20} /> Create New Course
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8">
                    <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-sm p-6 border-l-4 border-primary-500 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-slate-300 text-sm font-medium">Total Courses</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalCourses}</p>
                            </div>
                            <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                                <FiBook className="text-primary-600 dark:text-primary-400 text-2xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-sm p-6 border-l-4 border-secondary-500 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-slate-300 text-sm font-medium">Total Students</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalEnrollments}</p>
                            </div>
                            <div className="w-14 h-14 bg-secondary-100 dark:bg-secondary-900/30 rounded-xl flex items-center justify-center">
                                <FiUsers className="text-secondary-600 dark:text-secondary-400 text-2xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-slate-300 text-sm font-medium">Total Revenue</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                    ₹{stats.totalRevenue?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                <FiDollarSign className="text-green-600 dark:text-green-400 text-2xl" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-sm p-6 border-l-4 border-yellow-500 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 dark:text-slate-300 text-sm font-medium">Avg Rating</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                    {stats.averageRating?.toFixed(1) || '0.0'}
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center">
                                <FiStar className="text-yellow-600 dark:text-yellow-400 text-2xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Best Performing Course */}
                {bestCourse && (
                    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl shadow-lg dark:shadow-slate-700 p-8 mb-8 text-white">
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            🏆 Best Performing Course
                        </h2>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
                            <img
                                src={bestCourse.thumbnail?.url || 'https://via.placeholder.com/300x200'}
                                alt={bestCourse.title}
                                className="w-full md:w-48 h-32 rounded-lg object-cover shadow-lg dark:shadow-slate-700"
                            />
                            <div className="flex-grow">
                                <h3 className="text-xl font-semibold mb-3">{bestCourse.title}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
                                    <div>
                                        <p className="text-primary-100 text-sm">Students</p>
                                        <p className="text-2xl font-bold">{bestCourse.enrollmentCount}</p>
                                    </div>
                                    <div>
                                        <p className="text-primary-100 text-sm">Rating</p>
                                        <p className="text-2xl font-bold">{bestCourse.averageRating?.toFixed(1) || '0.0'} ⭐</p>
                                    </div>
                                    <div>
                                        <p className="text-primary-100 text-sm">Revenue</p>
                                        <p className="text-2xl font-bold">₹{bestCourse.revenue?.toFixed(2) || '0.00'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Courses List */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses ({courses.length})</h2>
                        {courses.length === 0 ? (
                            <Link to="/create-course" className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300">
                                Create your first course →
                            </Link>
                        ) : (
                            <button
                                onClick={handleRefresh}
                                className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition"
                            >
                                ↻ Refresh
                            </button>
                        )}
                    </div>

                    {courses.length === 0 ? (
                        <div className="p-12 text-center">
                            <FiBook className="text-6xl text-gray-300 dark:text-slate-700 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 dark:text-slate-200 mb-2">No Courses Yet</h3>
                            <p className="text-gray-500 dark:text-slate-400 mb-6">Start creating courses to share your knowledge</p>
                            <Link to="/create-course" className="btn-primary inline-flex items-center gap-2">
                                <FiPlus /> Create Your First Course
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-slate-800">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                            Course
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                            Students
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                            Rating
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                            Revenue
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                                    {courses.map((course) => (
                                        <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <img
                                                        src={course.thumbnail?.url || 'https://via.placeholder.com/100x60'}
                                                        alt={course.title}
                                                        className="w-16 h-12 rounded-lg object-cover mr-4"
                                                    />
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">{course.title}</p>
                                                        <p className="text-sm text-gray-500 dark:text-slate-400">{course.category?.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-slate-300 font-medium">
                                                {course.enrollmentCount || 0}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <FiStar className="text-yellow-500 fill-current" />
                                                    <span className="font-semibold text-gray-900 dark:text-white">
                                                        {course.averageRating?.toFixed(1) || '0.0'}
                                                    </span>
                                                    <span className="text-gray-500 dark:text-slate-400 text-sm">
                                                        ({course.totalReviews || 0})
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                ₹{course.revenue?.toFixed(2) || '0.00'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${course.status === 'published' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                                                    course.status === 'draft' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                                                        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                                    }`}>
                                                    {course.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        to={`/courses/${course._id}`}
                                                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold flex items-center gap-1"
                                                        title="View Course"
                                                    >
                                                        <FiEye /> View
                                                    </Link>
                                                    <Link
                                                        to={`/courses/${course._id}/edit`}
                                                        className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 font-semibold flex items-center gap-1"
                                                        title="Edit Course"
                                                    >
                                                        <FiEdit /> Edit
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
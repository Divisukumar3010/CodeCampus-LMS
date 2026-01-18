import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, courseAPI } from '../../services/api';
import { FiBook, FiClock, FiTrendingUp, FiAward } from 'react-icons/fi';
import CourseCard from '../course/CourseCard';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalEnrolled: 0,
        inProgress: 0,
        completed: 0,
        learningHours: 0,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [enrolledRes, recommendedRes] = await Promise.all([
                userAPI.getEnrolledCourses(),
                courseAPI.getAll({ limit: 4 })
            ]);

            const enrolled = enrolledRes.data.courses || [];
            setEnrolledCourses(enrolled);

            // Calculate stats
            const totalEnrolled = enrolled.length;
            const inProgress = enrolled.filter(p => p.percentComplete > 0 && p.percentComplete < 100).length;
            const completed = enrolled.filter(p => p.percentComplete === 100).length;

            // Calculate total learning hours from enrolled courses
            const totalSeconds = enrolled.reduce((total, progress) => {
                // Get total duration from course
                const courseDuration = progress.course?.totalDuration || 0;
                return total + courseDuration;
            }, 0);

            // Convert seconds to hours
            const learningHours = Math.round(totalSeconds / 3600);

            setStats({
                totalEnrolled,
                inProgress,
                completed,
                learningHours
            });

            setRecommendedCourses(recommendedRes.data.courses || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Learning Dashboard</h1>
                <p className="text-gray-600 dark:text-slate-400">Track your progress and continue learning</p>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-sm p-6 border-l-4 border-primary-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-slate-300 text-sm font-medium">Total Courses</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalEnrolled}</p>
                        </div>
                        <FiBook className="text-primary-500 text-4xl" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-slate-300 text-sm font-medium">In Progress</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.inProgress}</p>
                        </div>
                        <FiClock className="text-yellow-500 text-4xl" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-slate-300 text-sm font-medium">Completed</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.completed}</p>
                        </div>
                        <FiAward className="text-green-500 text-4xl" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border-l-4 border-secondary-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-slate-300 text-sm font-medium">Learning Hours</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                                {stats.learningHours}
                            </p>
                        </div>
                        <FiTrendingUp className="text-secondary-500 text-4xl" />
                    </div>
                </div>
            </div>

            {/* Continue Learning */}
            <section className="mb-12">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Continue Learning</h2>
                    <Link to="/my-courses" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold">
                        View All →
                    </Link>
                </div>

                {loading ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-gray-200 dark:bg-slate-800 h-64 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : enrolledCourses.length > 0 ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        {enrolledCourses.slice(0, 3).map((progress) => (
                            <Link
                                key={progress._id}
                                to={`/course/view/${progress.course._id}`}
                                className="bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group"
                            >
                                <div className="relative">
                                    <img
                                        src={progress.course.thumbnail?.url || 'https://via.placeholder.com/400x250'}
                                        alt={progress.course.title}
                                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {progress.percentComplete === 100 && (
                                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                            <FiAward size={14} />
                                            Completed
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-gray-900 dark:text-white">
                                        {progress.course.title}
                                    </h3>
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm text-gray-600 dark:text-slate-400 mb-2">
                                            <span className="font-medium">Progress</span>
                                            <span className="font-bold text-primary-600 dark:text-primary-400">
                                                {progress.percentComplete}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5">
                                            <div
                                                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2.5 rounded-full transition-all duration-500"
                                                style={{ width: `${progress.percentComplete}%` }}
                                            />
                                        </div>
                                    </div>
                                    <button className="w-full btn-primary py-2.5 text-sm font-semibold">
                                        {progress.percentComplete === 100 ? 'Review Course' : 'Continue Learning'}
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-12 text-center">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiBook className="text-4xl text-gray-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 dark:text-slate-200 mb-2">
                            No Courses Yet
                        </h3>
                        <p className="text-gray-500 dark:text-slate-400 mb-6">
                            Start your learning journey by enrolling in a course
                        </p>
                        <Link to="/courses" className="btn-primary inline-block">
                            Browse Courses
                        </Link>
                    </div>
                )}
            </section>

            {/* Recommended Courses */}
            <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recommended for You</h2>
                {recommendedCourses.length > 0 ? (
                    <div className="grid md:grid-cols-4 gap-6">
                        {recommendedCourses.map((course) => (
                            <CourseCard key={course._id} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                        No recommendations available
                    </div>
                )}
            </section>
        </div>
        </div>
    );
};

export default StudentDashboard;
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import { FiBook, FiAward, FiClock, FiFilter, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

const MyCourses = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, in-progress, completed
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);

    useEffect(() => {
        filterCourses();
    }, [filter, searchQuery, enrolledCourses]);

    const fetchEnrolledCourses = async () => {
        try {
            const response = await userAPI.getEnrolledCourses();
            setEnrolledCourses(response.data.courses || []);
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
            toast.error('Failed to load your courses');
        } finally {
            setLoading(false);
        }
    };

    const filterCourses = () => {
        let filtered = [...enrolledCourses];

        // Filter by status
        if (filter === 'in-progress') {
            filtered = filtered.filter(p => p.percentComplete > 0 && p.percentComplete < 100);
        } else if (filter === 'completed') {
            filtered = filtered.filter(p => p.percentComplete === 100);
        } else if (filter === 'not-started') {
            filtered = filtered.filter(p => p.percentComplete === 0);
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.course.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredCourses(filtered);
    };

    const stats = {
        total: enrolledCourses.length,
        inProgress: enrolledCourses.filter(p => p.percentComplete > 0 && p.percentComplete < 100).length,
        completed: enrolledCourses.filter(p => p.percentComplete === 100).length,
        notStarted: enrolledCourses.filter(p => p.percentComplete === 0).length,
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
                    <p className="text-gray-600">Manage and continue your learning journey</p>
                </div>

                {/* Stats Overview */}
                <div className="grid md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Enrolled</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <FiBook className="text-primary-500 text-4xl" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">In Progress</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.inProgress}</p>
                            </div>
                            <FiClock className="text-yellow-500 text-4xl" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Completed</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completed}</p>
                            </div>
                            <FiAward className="text-green-500 text-4xl" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-gray-400">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Not Started</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.notStarted}</p>
                            </div>
                            <FiBook className="text-gray-400 text-4xl" />
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 w-full md:w-auto">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search your courses..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'all'
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                All ({stats.total})
                            </button>
                            <button
                                onClick={() => setFilter('in-progress')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'in-progress'
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                In Progress ({stats.inProgress})
                            </button>
                            <button
                                onClick={() => setFilter('completed')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'completed'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Completed ({stats.completed})
                            </button>
                            <button
                                onClick={() => setFilter('not-started')}
                                className={`px-4 py-2 rounded-lg font-medium transition ${filter === 'not-started'
                                        ? 'bg-gray-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                Not Started ({stats.notStarted})
                            </button>
                        </div>
                    </div>
                </div>

                {/* Courses Grid */}
                {filteredCourses.length > 0 ? (
                    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredCourses.map((progress) => (
                            <Link
                                key={progress._id}
                                to={`/course/view/${progress.course._id}`}
                                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden group"
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
                                    {progress.percentComplete === 0 && (
                                        <div className="absolute top-3 right-3 bg-gray-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                            Not Started
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h3 className="font-semibold text-lg mb-3 line-clamp-2 text-gray-900 group-hover:text-primary-600 transition">
                                        {progress.course.title}
                                    </h3>

                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                                            <span className="font-medium">Progress</span>
                                            <span className="font-bold text-primary-600">
                                                {progress.percentComplete}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full transition-all duration-500 ${progress.percentComplete === 100
                                                        ? 'bg-gradient-to-r from-green-400 to-green-600'
                                                        : 'bg-gradient-to-r from-primary-500 to-primary-600'
                                                    }`}
                                                style={{ width: `${progress.percentComplete}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button className="w-full btn-primary py-2.5 text-sm font-semibold">
                                        {progress.percentComplete === 100
                                            ? 'Review Course'
                                            : progress.percentComplete > 0
                                                ? 'Continue Learning'
                                                : 'Start Course'}
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiBook className="text-4xl text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No courses found
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {searchQuery
                                ? `No courses match "${searchQuery}"`
                                : 'You haven\'t enrolled in any courses yet'}
                        </p>
                        {!searchQuery && (
                            <Link to="/courses" className="btn-primary inline-block">
                                Browse Courses
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCourses;
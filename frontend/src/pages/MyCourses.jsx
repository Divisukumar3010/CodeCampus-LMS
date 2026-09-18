import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, certificateAPI } from '../services/api';
import {
    FiBookOpen,
    FiAward,
    FiClock,
    FiSearch,
    FiFilter,
    FiCheckCircle,
    FiPlay,
    FiExternalLink,
    FiDownload
} from 'react-icons/fi';
import CourseCard from '../components/course/CourseCard';
import toast from 'react-hot-toast';
import D3ProgressRing from '../components/d3/D3ProgressRing';

const MyCourses = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' | 'in-progress' | 'completed' | 'certified'
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

    const API_ORIGIN = import.meta.env.VITE_API_URL
        ? new URL(import.meta.env.VITE_API_URL).origin
        : 'http://localhost:5000';

    useEffect(() => {
        fetchEnrolledCourses();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [filter, searchQuery, enrolledCourses]);

    const fetchEnrolledCourses = async () => {
        try {
            setLoading(true);
            const [coursesRes, certRes] = await Promise.all([
                userAPI.getEnrolledCourses(),
                certificateAPI.getMyCertificates().catch(() => ({ data: { certificates: [] } }))
            ]);

            setEnrolledCourses(coursesRes.data.courses || []);
            setCertificates(certRes.data.certificates || []);
        } catch (error) {
            console.error('Error fetching enrolled courses:', error);
            toast.error('Failed to load your enrolled courses');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let list = [...enrolledCourses];

        if (filter === 'in-progress') {
            list = list.filter(p => (p.percentComplete || 0) < 100);
        } else if (filter === 'completed') {
            list = list.filter(p => p.percentComplete === 100 || p.isCompleted);
        } else if (filter === 'certified') {
            list = list.filter(p => p.certificate?.isGenerated || p.exam?.hasPassed);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(p =>
                p.course?.title?.toLowerCase().includes(q) ||
                p.course?.trainer?.name?.toLowerCase().includes(q)
            );
        }

        setFilteredCourses(list);
    };

    const stats = {
        total: enrolledCourses.length,
        inProgress: enrolledCourses.filter(p => (p.percentComplete || 0) < 100).length,
        completed: enrolledCourses.filter(p => p.percentComplete === 100 || p.isCompleted).length,
        certified: enrolledCourses.filter(p => p.certificate?.isGenerated || p.exam?.hasPassed).length,
    };

    if (loading) {
        return (
            <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    ))}
                </div>
                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="animate-fade-up p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" style={{ animationDuration: '0.4s' }}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold gradient-text">
                        My Academic Curriculum
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Track your enrolled courses, lesson completion milestones, and graduation certificates.
                    </p>
                </div>
                <Link to="/courses" className="btn-glow text-xs sm:text-sm py-2 px-4 self-start md:self-auto">
                    <FiBookOpen size={15} />
                    Register New Course
                </Link>
            </div>

            {/* Quick Status Pill Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <button
                    onClick={() => setFilter('all')}
                    className={`card p-4 text-left transition-all ${
                        filter === 'all'
                            ? 'ring-2 ring-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40'
                            : 'hover:border-slate-300'
                    }`}
                >
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Enrolled</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.total}</p>
                </button>

                <button
                    onClick={() => setFilter('in-progress')}
                    className={`card p-4 text-left transition-all ${
                        filter === 'in-progress'
                            ? 'ring-2 ring-amber-500 bg-amber-50/50 dark:bg-amber-950/40'
                            : 'hover:border-slate-300'
                    }`}
                >
                    <p className="text-xs font-medium text-amber-600 dark:text-amber-400">In Progress</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.inProgress}</p>
                </button>

                <button
                    onClick={() => setFilter('completed')}
                    className={`card p-4 text-left transition-all ${
                        filter === 'completed'
                            ? 'ring-2 ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40'
                            : 'hover:border-slate-300'
                    }`}
                >
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Course Completed</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.completed}</p>
                </button>

                <button
                    onClick={() => setFilter('certified')}
                    className={`card p-4 text-left transition-all ${
                        filter === 'certified'
                            ? 'ring-2 ring-sky-500 bg-sky-50/50 dark:bg-sky-950/40'
                            : 'hover:border-slate-300'
                    }`}
                >
                    <p className="text-xs font-medium text-sky-600 dark:text-sky-400">Certificates Earned</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.certified}</p>
                </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search your courses..."
                        className="input-field pl-9 py-2"
                    />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
                    <span className="text-slate-500">View:</span>
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`px-3 py-1.5 rounded-md font-medium transition ${
                            viewMode === 'cards'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                    >
                        Academic Cards
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1.5 rounded-md font-medium transition ${
                            viewMode === 'table'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                    >
                        Detailed Table
                    </button>
                </div>
            </div>

            {/* Course Display */}
            {filteredCourses.length === 0 ? (
                <div className="card p-12 text-center">
                    <FiBookOpen size={42} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base">No courses found</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                        No enrolled courses match your current search or filter criteria.
                    </p>
                    <button
                        onClick={() => { setFilter('all'); setSearchQuery(''); }}
                        className="btn-secondary mt-4 text-xs py-1.5 px-3"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : viewMode === 'cards' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredCourses.map(progress => (
                        <CourseCard
                            key={progress._id || progress.course?._id}
                            course={progress.course}
                            isEnrolled={true}
                            progressPercent={progress.percentComplete}
                        />
                    ))}
                </div>
            ) : (
                /* Academic Data Table View */
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3.5">Course Code & Title</th>
                                    <th className="px-5 py-3.5">Faculty Instructor</th>
                                    <th className="px-5 py-3.5">Progress</th>
                                    <th className="px-5 py-3.5">Exam Status</th>
                                    <th className="px-5 py-3.5">Certificate</th>
                                    <th className="px-5 py-3.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                                {filteredCourses.map(progress => {
                                    const c = progress.course;
                                    const isComplete = progress.percentComplete === 100 || progress.isCompleted;
                                    const hasPassed = progress.exam?.hasPassed;

                                    return (
                                        <tr key={progress._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                                            <td className="px-5 py-4">
                                                <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block">
                                                    {c?._id?.slice(-6).toUpperCase() || 'CRS-101'}
                                                </span>
                                                <Link
                                                    to={`/courses/${c?._id}`}
                                                    className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-sm line-clamp-1"
                                                >
                                                    {c?.title}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                                                {c?.trainer?.name || 'Academic Faculty'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <D3ProgressRing
                                                        percent={progress.percentComplete || 0}
                                                        size={44}
                                                        strokeWidth={4.5}
                                                        color={isComplete ? '#10b981' : '#6366f1'}
                                                        trackColor="rgba(148, 163, 184, 0.2)"
                                                        textColor="currentColor"
                                                    />
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {isComplete ? 'Complete' : 'In Progress'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {hasPassed ? (
                                                    <span className="badge badge-success">Passed ({progress.exam?.bestScore}%)</span>
                                                ) : isComplete ? (
                                                    <Link
                                                        to={`/course/${c?._id}/exam`}
                                                        className="badge badge-warning hover:opacity-80"
                                                    >
                                                        Take Exam
                                                    </Link>
                                                ) : (
                                                    <span className="badge badge-secondary">In Progress</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                {progress.certificate?.isGenerated ? (
                                                    <a
                                                        href={`${API_ORIGIN}${progress.certificate.certificateUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 text-emerald-600 hover:underline font-semibold"
                                                    >
                                                        <FiAward size={13} />
                                                        Verified PDF
                                                    </a>
                                                ) : hasPassed ? (
                                                    <span className="text-slate-400 text-[11px]">Ready to Generate</span>
                                                ) : (
                                                    <span className="text-slate-400 text-[11px]">Exam Required</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    to={`/course/view/${c?._id}`}
                                                    className="btn-primary py-1.5 px-3 text-xs"
                                                >
                                                    <FiPlay size={12} />
                                                    Continue
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyCourses;
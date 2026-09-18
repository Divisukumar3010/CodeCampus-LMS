import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, courseAPI, certificateAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
    FiBookOpen,
    FiClock,
    FiAward,
    FiCheckCircle,
    FiArrowRight,
    FiCalendar,
    FiAlertCircle,
    FiPlay,
    FiTrendingUp,
    FiTerminal,
    FiExternalLink
} from 'react-icons/fi';
import CourseCard from '../course/CourseCard';
import toast from 'react-hot-toast';
import D3ProgressRing from '../d3/D3ProgressRing';
import D3CurriculumDistributionChart from '../d3/D3CurriculumDistributionChart';

const StudentDashboard = () => {
    const { user } = useAuth();
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        totalEnrolled: 0,
        inProgress: 0,
        completed: 0,
        learningHours: 0,
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [enrolledRes, recommendedRes, certRes] = await Promise.all([
                userAPI.getEnrolledCourses().catch(() => ({ data: { courses: [] } })),
                courseAPI.getAll({ limit: 4 }).catch(() => ({ data: { courses: [] } })),
                certificateAPI.getMyCertificates().catch(() => ({ data: { certificates: [] } }))
            ]);

            const enrolled = enrolledRes.data.courses || [];
            setEnrolledCourses(enrolled);
            setRecommendedCourses(recommendedRes.data.courses || []);
            setCertificates(certRes.data.certificates || []);

            const totalEnrolled = enrolled.length;
            const inProgress = enrolled.filter(p => p.percentComplete > 0 && p.percentComplete < 100).length;
            const completed = enrolled.filter(p => p.percentComplete === 100).length;

            const totalSeconds = enrolled.reduce((total, progress) => {
                const courseDuration = progress.course?.totalDuration || 0;
                return total + courseDuration;
            }, 0);
            const learningHours = Math.round(totalSeconds / 3600);

            setStats({
                totalEnrolled,
                inProgress,
                completed,
                learningHours
            });
        } catch (error) {
            console.error('Error loading dashboard:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Determine the most recently accessed course for the "Continue Learning" hero
    const activeCourseProgress = enrolledCourses.find(p => p.percentComplete < 100) || enrolledCourses[0];

    // Upcoming assessments / exams from enrolled courses
    const upcomingAssessments = enrolledCourses.map(p => ({
        courseId: p.course?._id,
        courseTitle: p.course?.title,
        percentComplete: p.percentComplete,
        isCompleted: p.isCompleted,
        hasPassedExam: p.exam?.hasPassed,
        bestScore: p.exam?.bestScore,
    })).filter(a => a.courseId);

    if (loading) {
        return (
            <div className="p-6 sm:p-8 space-y-6 animate-pulse max-w-7xl mx-auto">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    ))}
                </div>
                <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Top Academic Welcome Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Academic Portal • Term Active
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                        Welcome back, {user?.name || 'Scholar'}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Here is an overview of your active curriculum, upcoming assessments, and learning metrics.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <Link
                        to="/calendar"
                        className="btn-secondary text-xs sm:text-sm py-2 px-3.5"
                    >
                        <FiCalendar size={15} />
                        Academic Calendar
                    </Link>
                    <Link
                        to="/courses"
                        className="btn-primary text-xs sm:text-sm py-2 px-3.5"
                    >
                        <FiBookOpen size={15} />
                        Browse Catalog
                    </Link>
                </div>
            </div>

            {/* Academic KPI Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="card p-4 sm:p-5 flex items-center justify-between border-l-4 border-indigo-600">
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Enrolled Courses</p>
                        <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.totalEnrolled}</p>
                    </div>
                    <div className="w-11 h-11 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <FiBookOpen size={22} />
                    </div>
                </div>

                <div className="card p-4 sm:p-5 flex items-center justify-between border-l-4 border-amber-500">
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">In Progress</p>
                        <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.inProgress}</p>
                    </div>
                    <div className="w-11 h-11 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <FiClock size={22} />
                    </div>
                </div>

                <div className="card p-4 sm:p-5 flex items-center justify-between border-l-4 border-emerald-500">
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completed</p>
                        <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.completed}</p>
                    </div>
                    <div className="w-11 h-11 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <FiAward size={22} />
                    </div>
                </div>

                <div className="card p-4 sm:p-5 flex items-center justify-between border-l-4 border-sky-500">
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Curriculum Hours</p>
                        <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">{stats.learningHours} hrs</p>
                    </div>
                    <div className="w-11 h-11 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                        <FiTrendingUp size={22} />
                    </div>
                </div>
            </div>

            {/* "Continue Learning" / "Completed Curriculum" Active Course Workspace */}
            {activeCourseProgress && activeCourseProgress.course && (() => {
                const isCourseComplete = activeCourseProgress.percentComplete === 100 || activeCourseProgress.isCompleted;
                const hasPassedExam = activeCourseProgress.exam?.hasPassed;

                return (
                    <div className="card overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shadow-md border-indigo-800">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5 flex-1">
                                <div className="hidden sm:block flex-shrink-0">
                                    <D3ProgressRing
                                        percent={activeCourseProgress.percentComplete || 0}
                                        size={92}
                                        strokeWidth={8}
                                        color={isCourseComplete ? '#10b981' : '#6366f1'}
                                        trackColor="rgba(255, 255, 255, 0.12)"
                                        textColor="#ffffff"
                                        label="Curriculum"
                                    />
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                                        {isCourseComplete ? (
                                            <>
                                                <FiCheckCircle className="text-emerald-400" size={12} />
                                                <span>Curriculum Completed</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                <span>Active Learning Session</span>
                                            </>
                                        )}
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold leading-tight">
                                        {activeCourseProgress.course.title}
                                    </h2>
                                    <p className="text-xs text-indigo-200/80">
                                        Faculty Instructor: {activeCourseProgress.course.trainer?.name || 'Lead Department Faculty'}
                                    </p>

                                    {/* Progress tracking */}
                                    <div className="pt-2 max-w-md">
                                        <div className="flex justify-between text-xs font-medium text-indigo-200 mb-1.5">
                                            <span>Syllabus Progress</span>
                                            <span>{activeCourseProgress.percentComplete || 0}% Complete</span>
                                        </div>
                                        <div className="w-full bg-indigo-950 rounded-full h-2 overflow-hidden border border-indigo-700/50">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full transition-all duration-500"
                                                style={{ width: `${activeCourseProgress.percentComplete || 0}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3">
                                {isCourseComplete ? (
                                    <>
                                        <Link
                                            to={`/course/view/${activeCourseProgress.course._id}`}
                                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm shadow-lg hover:shadow-emerald-500/20 transition"
                                        >
                                            <FiCheckCircle size={16} />
                                            Review Course
                                        </Link>
                                        {!hasPassedExam ? (
                                            <Link
                                                to={`/course/${activeCourseProgress.course._id}/exam`}
                                                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition"
                                            >
                                                <FiAward size={16} />
                                                Take Exam
                                            </Link>
                                        ) : (
                                            <Link
                                                to="/grades"
                                                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition"
                                            >
                                                <FiAward size={16} />
                                                View Certificate
                                            </Link>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        to={`/course/view/${activeCourseProgress.course._id}`}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm shadow-lg hover:shadow-indigo-500/20 transition"
                                    >
                                        <FiPlay size={16} />
                                        Resume Lesson
                                    </Link>
                                )}
                                <Link
                                    to={`/courses/${activeCourseProgress.course._id}`}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition"
                                >
                                    View Syllabus
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* D3 Curriculum Progression Visualizer */}
            {enrolledCourses.length > 0 && (
                <div className="card p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FiTrendingUp className="text-indigo-600 dark:text-indigo-400" size={18} />
                                Curriculum Progress Breakdown
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Interactive distribution of your active courses across progression stages
                            </p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 self-start sm:self-auto">
                            D3 Live Analytics
                        </span>
                    </div>

                    <D3CurriculumDistributionChart
                        completed={stats.completed}
                        inProgress={stats.inProgress}
                        notStarted={Math.max(0, stats.totalEnrolled - stats.completed - stats.inProgress)}
                        total={stats.totalEnrolled}
                        size={170}
                    />
                </div>
            )}

            {/* Split Grid: Enrolled Courses & Academic Assessments/Announcements */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Columns: Enrolled Curriculum */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active Enrolled Courses</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Courses currently registered in your academic portal</p>
                        </div>
                        <Link
                            to="/my-courses"
                            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                            View All ({enrolledCourses.length})
                            <FiArrowRight size={13} />
                        </Link>
                    </div>

                    {enrolledCourses.length === 0 ? (
                        <div className="card p-8 text-center">
                            <FiBookOpen size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-base">No active enrollments</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                                You are not currently registered in any courses. Explore the curriculum catalog to enroll in university programs.
                            </p>
                            <Link to="/courses" className="btn-primary mt-4 text-xs py-2 px-4 inline-flex">
                                Explore Courses
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {enrolledCourses.slice(0, 4).map(progress => (
                                <CourseCard
                                    key={progress._id || progress.course?._id}
                                    course={progress.course}
                                    isEnrolled={true}
                                    progressPercent={progress.percentComplete}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Column: Academic Assessments & Quick Tools */}
                <div className="space-y-6">
                    {/* Assessments & Exam Status */}
                    <div className="card">
                        <div className="card-header">
                            <div className="flex items-center gap-2">
                                <FiAward className="text-indigo-600 dark:text-indigo-400" size={18} />
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Assessments & Exams</h3>
                            </div>
                            <Link to="/grades" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                                Gradebook →
                            </Link>
                        </div>
                        <div className="card-body p-4 space-y-3">
                            {upcomingAssessments.length === 0 ? (
                                <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">
                                    No pending course assessments.
                                </p>
                            ) : (
                                upcomingAssessments.slice(0, 3).map((item, idx) => (
                                    <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                                                {item.courseTitle}
                                            </p>
                                            <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                                                {item.hasPassedExam
                                                    ? `Passed with ${item.bestScore}%`
                                                    : item.isCompleted
                                                    ? 'Eligible for Examination'
                                                    : `${item.percentComplete}% lessons completed`}
                                            </p>
                                        </div>
                                        <div>
                                            {item.hasPassedExam ? (
                                                <span className="badge badge-success">Passed</span>
                                            ) : item.isCompleted ? (
                                                <Link
                                                    to={`/course/${item.courseId}/exam`}
                                                    className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[11px]"
                                                >
                                                    Take Exam
                                                </Link>
                                            ) : (
                                                <span className="badge badge-secondary">In Progress</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Academic Announcements */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                <FiAlertCircle className="text-amber-500" size={17} />
                                Academic Notices
                            </h3>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Campus Notice</span>
                        </div>
                        <div className="card-body p-4 space-y-3">
                            <div className="p-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50">
                                <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                                    Course Certifications Available
                                </p>
                                <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300 mt-1 leading-relaxed">
                                    Upon scoring 60% or higher on course exams, official university-verifiable PDF certificates are automatically unlocked.
                                </p>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                                    Integrated Code Lab Environment
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                    Practice your algorithms and frontend assignments in the multi-language compiler available directly in the sidebar.
                                </p>
                                <Link
                                    to="/online-compiler"
                                    className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-xs font-medium mt-2 hover:underline"
                                >
                                    <FiTerminal size={13} />
                                    Launch Code Lab
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
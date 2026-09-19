import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, certificateAPI, examAPI } from '../services/api';
import {
    FiAward,
    FiCheckCircle,
    FiAlertCircle,
    FiDownload,
    FiExternalLink,
    FiFileText,
    FiTrendingUp,
    FiBookOpen,
    FiHelpCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import D3GradePerformanceBar from '../components/d3/D3GradePerformanceBar';
import D3ProgressRing from '../components/d3/D3ProgressRing';

const GradesPage = () => {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_ORIGIN = import.meta.env.VITE_API_URL
        ? new URL(import.meta.env.VITE_API_URL).origin
        : 'http://localhost:5000';

    useEffect(() => {
        fetchAcademicRecords();
    }, []);

    const fetchAcademicRecords = async () => {
        try {
            setLoading(true);
            const [coursesRes, certRes] = await Promise.all([
                userAPI.getEnrolledCourses(),
                certificateAPI.getMyCertificates().catch(() => ({ data: { certificates: [] } }))
            ]);

            setEnrolledCourses(coursesRes.data.courses || []);
            setCertificates(certRes.data.certificates || []);
        } catch (error) {
            console.error('Error fetching academic records:', error);
            toast.error('Failed to load academic records');
        } finally {
            setLoading(false);
        }
    };

    // Calculate academic performance summary
    const passedExams = enrolledCourses.filter(p => p.exam?.hasPassed);
    const totalExamsAttempted = enrolledCourses.filter(p => (p.exam?.totalAttempts || 0) > 0);
    const averageScore = passedExams.length > 0
        ? Math.round(passedExams.reduce((acc, p) => acc + (p.exam?.bestScore || 0), 0) / passedExams.length)
        : 0;

    const passRate = totalExamsAttempted.length > 0
        ? Math.round((passedExams.length / totalExamsAttempted.length) * 100)
        : 0;

    if (loading) {
        return (
            <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
                <div className="glass-card animate-shimmer-bg h-12 w-1/3" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(n => (
                        <div key={n} className="glass-card animate-shimmer-bg h-28" />
                    ))}
                </div>
                <div className="glass-card animate-shimmer-bg h-64" />
            </div>
        );
    }

    return (
        <div className="animate-fade-up p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" style={{ animationDuration: '0.4s' }}>
            {/* Header */}
            <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Academic Standing
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold gradient-text mt-0.5">
                        Grades & Examination Records
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Official academic transcript of course assessments, examination attempts, and credentials.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {totalExamsAttempted.length === 0 ? (
                        <span className="badge badge-secondary py-1 px-3 text-xs animate-scale-in">
                            <FiAlertCircle size={13} />
                            Enrolled Scholar
                        </span>
                    ) : passRate >= 70 ? (
                        <span className="badge badge-success py-1 px-3 text-xs animate-scale-in">
                            <FiCheckCircle size={13} />
                            Good Academic Standing ({passRate}% Pass)
                        </span>
                    ) : (
                        <span className="badge badge-warning py-1 px-3 text-xs animate-scale-in">
                            <FiAlertCircle size={13} />
                            Academic Review Needed
                        </span>
                    )}
                </div>
            </div>

            {/* Academic KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-card p-5 border-l-4 border-indigo-600 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Assessment Average
                        </p>
                        <p className="text-3xl font-extrabold gradient-text mt-1">
                            {averageScore > 0 ? `${averageScore}%` : 'N/A'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Across passed qualifying exams</p>
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <FiTrendingUp size={26} />
                    </div>
                </div>

                <div className="glass-card p-5 border-l-4 border-emerald-500 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Credentials Conferred
                        </p>
                        <p className="text-3xl font-extrabold text-emerald-500 mt-1">
                            {certificates.length || passedExams.length}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Verified certificates earned</p>
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <FiAward size={26} />
                    </div>
                </div>

                <div className="glass-card p-5 border-l-4 border-sky-500 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Exams Pass Rate
                        </p>
                        <p className="text-3xl font-extrabold text-sky-500 mt-1">
                            {totalExamsAttempted.length > 0 ? `${passRate}%` : '0%'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            {passedExams.length} passed of {totalExamsAttempted.length} attempted
                        </p>
                    </div>
                    <D3ProgressRing
                        percent={passRate}
                        size={56}
                        strokeWidth={5}
                        color="#38bdf8"
                        trackColor="rgba(56, 189, 248, 0.15)"
                        textColor="#38bdf8"
                    />
                </div>
            </div>

            {/* D3 Assessment Performance Chart */}
            {enrolledCourses.length > 0 && (
                <div className="card p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FiTrendingUp className="text-indigo-600 dark:text-indigo-400" size={18} />
                                Examination Performance Distribution
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Real examination scores benchmarked against the 70% institutional passing threshold
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                                <span className="text-slate-600 dark:text-slate-300">Passed (≥70%)</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                                <span className="text-slate-600 dark:text-slate-300">Under Review</span>
                            </span>
                        </div>
                    </div>

                    <D3GradePerformanceBar
                        records={enrolledCourses}
                        height={240}
                        passingScore={70}
                    />
                </div>
            )}

            {/* Official Gradebook Table */}
            <div className="card overflow-hidden">
                <div className="card-header">
                    <div className="flex items-center gap-2">
                        <FiAward className="text-indigo-600 dark:text-indigo-400" size={18} />
                        <h2 className="font-bold text-base text-slate-900 dark:text-white">
                            Assessment Gradebook
                        </h2>
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        Showing {enrolledCourses.length} enrolled subjects
                    </span>
                </div>

                {enrolledCourses.length === 0 ? (
                    <div className="p-12 text-center">
                        <FiFileText size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                        <p className="text-slate-700 dark:text-slate-300 font-semibold">No academic records available yet.</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Enroll in courses and complete lessons to sit for examinations.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                                <tr>
                                    <th className="px-5 py-3.5">Course Code & Title</th>
                                    <th className="px-5 py-3.5">Coursework Progress</th>
                                    <th className="px-5 py-3.5">Qualifying Exam</th>
                                    <th className="px-5 py-3.5">Score / Standing</th>
                                    <th className="px-5 py-3.5">Certificate Credential</th>
                                    <th className="px-5 py-3.5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                                {enrolledCourses.map(progress => {
                                    const c = progress.course;
                                    const hasPassed = progress.exam?.hasPassed;
                                    const isComplete = progress.percentComplete === 100 || progress.isCompleted;

                                    return (
                                        <tr key={progress._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
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
                                                <span className="text-[11px] text-slate-400">
                                                    Instructor: {c?.trainer?.name || 'Department Faculty'}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="w-28">
                                                    <div className="flex justify-between text-[11px] mb-1">
                                                        <span>{progress.completedLessons?.length || 0} lessons</span>
                                                        <span className="font-semibold">{progress.percentComplete || 0}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${
                                                                isComplete ? 'bg-emerald-500' : 'bg-indigo-600'
                                                            }`}
                                                            style={{ width: `${progress.percentComplete || 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                {hasPassed ? (
                                                    <span className="badge badge-success">Passed</span>
                                                ) : isComplete ? (
                                                    <span className="badge badge-warning">Eligible (Not Taken)</span>
                                                ) : (
                                                    <span className="badge badge-secondary">Locked (Finish Lessons)</span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 font-medium">
                                                {hasPassed ? (
                                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                                                        {progress.exam?.bestScore}%
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">—</span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                {progress.certificate?.isGenerated ? (
                                                    <a
                                                        href={`${API_ORIGIN}${progress.certificate.certificateUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-semibold"
                                                    >
                                                        <FiAward size={13} />
                                                        Download PDF
                                                    </a>
                                                ) : hasPassed ? (
                                                    <Link
                                                        to={`/course/view/${c?._id}`}
                                                        className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                                                    >
                                                        Generate Now
                                                    </Link>
                                                ) : (
                                                    <span className="text-slate-400 text-[11px]">Pending Pass</span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                {isComplete && !hasPassed ? (
                                                    <Link
                                                        to={`/course/${c?._id}/exam`}
                                                        className="btn-primary py-1.5 px-3 text-xs"
                                                    >
                                                        Take Exam
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        to={`/course/view/${c?._id}`}
                                                        className="btn-secondary py-1.5 px-3 text-xs"
                                                    >
                                                        View Course
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GradesPage;

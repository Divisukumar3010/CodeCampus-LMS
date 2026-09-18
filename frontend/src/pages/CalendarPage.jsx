import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import {
    FiCalendar,
    FiClock,
    FiBookOpen,
    FiAward,
    FiChevronLeft,
    FiChevronRight,
    FiCheckCircle,
    FiAlertCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const CalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 16)); // Sept 2026 based on system time
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEnrolled();
    }, []);

    const fetchEnrolled = async () => {
        try {
            setLoading(true);
            const res = await userAPI.getEnrolledCourses();
            setEnrolledCourses(res.data.courses || []);
        } catch (error) {
            console.error('Error fetching courses for calendar:', error);
            toast.error('Failed to load academic schedule');
        } finally {
            setLoading(false);
        }
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    // Synthesize realistic academic schedule events from enrolled courses
    const events = [
        {
            day: 5,
            title: 'Term Start: Academic Curriculum Kickoff',
            type: 'academic',
            course: 'University Term',
        },
        {
            day: 12,
            title: 'Mid-term Lab Evaluation',
            type: 'lab',
            course: enrolledCourses[0]?.course?.title || 'Interactive Programming',
        },
        {
            day: 18,
            title: 'Course Qualifying Examination Window',
            type: 'exam',
            course: enrolledCourses[0]?.course?.title || 'Certification Milestone',
        },
        {
            day: 25,
            title: 'Submission Deadline: Project Milestones',
            type: 'deadline',
            course: enrolledCourses[1]?.course?.title || 'Capstone Submission',
        },
        {
            day: 30,
            title: 'End of Month Academic Review',
            type: 'academic',
            course: 'Department Review',
        }
    ];

    return (
        <div className="animate-fade-up p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6" style={{ animationDuration: '0.4s' }}>
            {/* Header */}
            <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Syllabus Timetable
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold gradient-text mt-0.5">
                        Academic Calendar & Deadlines
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Keep track of examination windows, assignment milestones, and semester schedules.
                    </p>
                </div>

                {/* Month Navigator */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition shadow-sm"
                        title="Previous Month"
                    >
                        <FiChevronLeft size={16} />
                    </button>
                    <span className="px-4 py-2 font-bold text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white min-w-[140px] text-center shadow-sm">
                        {monthNames[month]} {year}
                    </span>
                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition shadow-sm"
                        title="Next Month"
                    >
                        <FiChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Split layout: Calendar Grid + Upcoming Milestone List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendar Grid (2 Cols) */}
                <div className="lg:col-span-2 glass-card p-5 overflow-hidden">
                    <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-200 dark:border-slate-800">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d}>{d}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 pt-3">
                        {/* Empty padding days */}
                        {Array.from({ length: firstDayIndex }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-20 sm:h-24 p-1 text-slate-300 dark:text-slate-700 text-xs bg-slate-50/30 dark:bg-slate-950/20 rounded-xl" />
                        ))}

                        {/* Month Days */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dayNumber = i + 1;
                            const isToday = dayNumber === 16 && month === 8 && year === 2026;
                            const dayEvents = events.filter(e => e.day === dayNumber);

                            return (
                                <div
                                    key={dayNumber}
                                    className={`h-20 sm:h-24 p-2 rounded-xl flex flex-col justify-between transition-all duration-200 ${
                                        isToday
                                            ? 'border-2 border-indigo-500 bg-indigo-500/10 animate-border-glow shadow-md shadow-indigo-500/20'
                                            : 'border border-slate-200/60 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`text-xs font-semibold ${
                                                isToday
                                                    ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]'
                                                    : 'text-slate-700 dark:text-slate-300'
                                            }`}
                                        >
                                            {dayNumber}
                                        </span>
                                    </div>

                                    <div className="space-y-1 overflow-hidden">
                                        {dayEvents.map((evt, idx) => (
                                            <div
                                                key={idx}
                                                className={`text-[9px] sm:text-[10px] truncate px-1 py-0.5 rounded font-medium ${
                                                    evt.type === 'exam'
                                                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                                                        : evt.type === 'deadline'
                                                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                                                        : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                                                }`}
                                                title={`${evt.title} (${evt.course})`}
                                            >
                                                {evt.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming Schedule Sidebar List */}
                <div className="space-y-4">
                    <div className="card p-5 space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <FiClock className="text-indigo-600 dark:text-indigo-400" size={18} />
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                Key Academic Dates
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {events.map((evt, idx) => (
                                <div
                                    key={idx}
                                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1 text-xs"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            {monthNames[month]} {evt.day}
                                        </span>
                                        <span
                                            className={`badge ${
                                                evt.type === 'exam'
                                                    ? 'badge-error'
                                                    : evt.type === 'deadline'
                                                    ? 'badge-warning'
                                                    : 'badge-primary'
                                            }`}
                                        >
                                            {evt.type.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">
                                        {evt.title}
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        Course: {evt.course}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card p-4 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/40 text-xs">
                        <p className="font-semibold text-indigo-900 dark:text-indigo-200 mb-1">Self-Paced Learning Note</p>
                        <p className="text-indigo-800/80 dark:text-indigo-300 leading-relaxed text-[11px]">
                            All courses on CodeCampus feature on-demand lesson access. Exam milestones can be triggered anytime once 100% of syllabus lessons are completed.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;

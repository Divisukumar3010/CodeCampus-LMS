import { Link } from 'react-router-dom';
import { FiStar, FiUsers, FiTrash2, FiClock, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import { useState } from 'react';

const CourseCard = ({ course, onDelete, currentUser, isEnrolled, progressPercent }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const displayPrice = course.discountPrice || course.price;
    const courseDurationHours = course.totalDuration
        ? (course.totalDuration / 3600).toFixed(1)
        : '3.5';

    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await courseService.deleteCourse(course._id);
            if (response.success) {
                toast.success('Course deleted successfully');
                if (onDelete) {
                    onDelete(course._id);
                }
            }
        } catch (error) {
            console.error('Error deleting course:', error);
            toast.error(error.response?.data?.message || 'Failed to delete course');
        } finally {
            setIsDeleting(false);
        }
    };

    // Level badge color styling
    const level = (course.level || 'BEGINNER').toUpperCase();
    let levelBadgeClass = 'bg-red-500/20 text-red-300 border-red-500/30';
    if (level === 'INTERMEDIATE') levelBadgeClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (level === 'ADVANCED') levelBadgeClass = 'bg-purple-500/20 text-purple-300 border-purple-500/30';

    const courseCode = `#${course._id?.slice(-6).toUpperCase() || '088508'}`;

    return (
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800/80 hover:border-indigo-500/40 group transition-all duration-300 shadow-sm hover:shadow-md">
            {/* Thumbnail Header with simulated IDE / preview header */}
            <div className="h-44 bg-[#090e1c] p-4 relative border-b border-white/[0.06] flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${levelBadgeClass}`}>
                        {level}
                    </span>
                </div>

                {/* Course Thumbnail Image or Code Snippet Mock */}
                {course.thumbnail?.url ? (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={course.thumbnail.url}
                            alt={course.title}
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#090e1c] via-[#090e1c]/40 to-transparent" />
                    </div>
                ) : (
                    <div className="rounded-lg bg-surface-950/90 p-3 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 shadow-inner relative z-0">
                        <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
                            <span>main.js</span>
                            <span className="text-[9px] text-slate-500">ES2024</span>
                        </div>
                        <div className="text-slate-400">const hero = async () =&gt; &#123;</div>
                        <div className="text-emerald-400 pl-3">await learn('{course.title?.slice(0, 16)}');</div>
                        <div className="text-slate-400">&#125;;</div>
                    </div>
                )}

                {/* Delete Button for Admin */}
                {currentUser?.role?.toLowerCase() === 'admin' && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="absolute top-3 right-3 z-20 p-1.5 rounded-md bg-slate-900/90 hover:bg-rose-950/70 text-rose-400 border border-rose-500/30 transition"
                        title="Delete Course"
                    >
                        <FiTrash2 size={14} />
                    </button>
                )}
            </div>

            {/* Enrolled Progress Bar */}
            {typeof progressPercent === 'number' && (
                <div className="w-full bg-slate-800 h-1.5">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            )}

            {/* Content Body */}
            <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{courseCode}</span>
                        <span className="flex items-center gap-1">
                            <FiClock className="w-3.5 h-3.5 text-slate-400" />
                            {courseDurationHours} hrs
                        </span>
                    </div>

                    <Link to={`/courses/${course._id}`}>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors">
                            {course.title}
                        </h3>
                    </Link>

                    {/* Instructor Tag */}
                    <div className="flex items-center gap-2 mt-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                            {course.trainer?.name?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate max-w-[120px]">
                            {course.trainer?.name || 'Faculty Mentor'}
                        </span>
                        <span className="text-[10px] text-cyan-600 dark:text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                            Verified
                        </span>
                    </div>
                </div>

                {/* Rating & Price */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                        <span className="font-bold text-amber-500 dark:text-amber-400 flex items-center">
                            ★ {course.averageRating ? course.averageRating.toFixed(1) : '5.0'}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500">
                            ({course.ratingsCount || course.reviews?.length || 1})
                        </span>
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 pl-1 text-[11px]">
                            <FiUsers className="w-3 h-3 text-slate-400" />
                            {course.enrolledCount || 124}
                        </span>
                    </div>

                    <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {displayPrice > 0 ? `₹${displayPrice}` : 'Free'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
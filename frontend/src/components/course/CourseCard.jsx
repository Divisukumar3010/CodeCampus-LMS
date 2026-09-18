import { Link } from 'react-router-dom';
import { FiStar, FiUsers, FiTrash2, FiClock, FiBook, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import { useState } from 'react';

const CourseCard = ({ course, onDelete, currentUser, isEnrolled, progressPercent }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const displayPrice = course.discountPrice || course.price;
    const hasDiscount = course.discountPrice && course.discountPrice < course.price;
    const discountPercentage = hasDiscount
        ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
        : 0;

    const courseDurationHours = course.totalDuration
        ? (course.totalDuration / 3600).toFixed(1)
        : null;

    const handleDelete = async () => {
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

    return (
        <div className="glass-card hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col h-full group">
            {/* Thumbnail Header */}
            <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-video">
                <Link to={`/courses/${course._id}`} className="block w-full h-full relative">
                    <img
                        src={course.thumbnail?.url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80';
                        }}
                    />
                    {/* Thumbnail overlay on hover */}
                    <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-indigo-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                            {isEnrolled ? 'Continue Learning →' : 'View Course →'}
                        </span>
                    </div>
                </Link>

                {/* Level / Category Tag */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {course.category?.name && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur shadow-sm border border-slate-200/50 dark:border-slate-700/50">
                            {course.category.name}
                        </span>
                    )}
                    {course.level && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider bg-slate-900/80 text-white backdrop-blur">
                            {course.level}
                        </span>
                    )}
                </div>

                {/* Admin Delete Action */}
                {currentUser?.role?.toLowerCase() === 'admin' && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-white/90 dark:bg-slate-900/90 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-rose-600 dark:text-rose-400 shadow-sm border border-rose-200 dark:border-rose-900/40 transition"
                        title="Delete Course"
                    >
                        <FiTrash2 size={15} />
                    </button>
                )}

                {/* Enrolled Progress Pill overlay if enrolled */}
                {typeof progressPercent === 'number' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-sm px-3 py-1.5 flex items-center justify-between text-xs text-white">
                        <span className="flex items-center gap-1">
                            <FiCheckCircle className="text-emerald-400" size={13} />
                            <span>Progress</span>
                        </span>
                        <span className="font-bold">{progressPercent}%</span>
                    </div>
                )}
            </div>

            {/* Enrolled Progress Bar */}
            {typeof progressPercent === 'number' && (
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            )}

            {/* Content Body */}
            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    {/* Course Code / Subtitle */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                        <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">
                            {course._id?.slice(-6).toUpperCase() || 'CRS-101'}
                        </span>
                        {courseDurationHours && (
                            <span className="flex items-center gap-1 text-[11px]">
                                <FiClock size={12} />
                                {courseDurationHours} hrs
                            </span>
                        )}
                    </div>

                    {/* Course Title */}
                    <Link to={`/courses/${course._id}`}>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-base line-clamp-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-2">
                            {course.title}
                        </h3>
                    </Link>

                    {/* Instructor Info */}
                    {course.trainer && (
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center text-xs font-semibold">
                                {course.trainer.name?.charAt(0).toUpperCase() || 'T'}
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-300 truncate">
                                {course.trainer.name}
                            </span>
                        </div>
                    )}
                </div>

                {/* Bottom Meta & Action */}
                <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {/* Rating & Enrollment metrics */}
                    <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 text-amber-500 font-semibold">
                            <FiStar size={13} className="fill-current" />
                            <span>{(course.averageRating || 0).toFixed(1)}</span>
                            <span className="text-slate-400 font-normal">({course.totalReviews || 0})</span>
                        </div>
                        {course.enrollmentCount !== undefined && (
                            <div className="hidden sm:flex items-center gap-1 text-slate-400">
                                <FiUsers size={12} />
                                <span>{course.enrollmentCount}</span>
                            </div>
                        )}
                    </div>

                    {/* Price or Resume Button */}
                    <div>
                        {isEnrolled ? (
                            <Link
                                to={`/course/view/${course._id}`}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition inline-flex items-center gap-1"
                            >
                                Continue
                            </Link>
                        ) : (
                            <Link
                                to={`/courses/${course._id}`}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition"
                            >
                                {displayPrice === 0 ? 'Free' : `₹${displayPrice}`}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
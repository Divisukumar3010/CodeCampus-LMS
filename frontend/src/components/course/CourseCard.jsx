import { Link } from 'react-router-dom';
import { FiStar, FiUsers, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import courseService from '../../services/courseService';
import { useState } from 'react';

const CourseCard = ({ course, onDelete, currentUser }) => {
    // console.log('Current User:', currentUser); // 👈 HERE
    const [isDeleting, setIsDeleting] = useState(false);

    const displayPrice = course.discountPrice || course.price;
    const hasDiscount = course.discountPrice && course.discountPrice < course.price;
    const discountPercentage = hasDiscount
        ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
        : 0;

    const handleDelete = async () => {
        // Confirm deletion
        if (!window.confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            const response = await courseService.deleteCourse(course._id);

            if (response.success) {
                toast.success('Course deleted successfully');
                // Call parent callback to refresh the list
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-300 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-400 relative">
            {/* Image Container */}
            <Link to={`/courses/${course._id}`} className="block relative overflow-hidden bg-gray-100 h-48">
                <img
                    src={course.thumbnail?.url || 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Course'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Course';
                    }}
                />

                {/* Discount Badge */}
                {hasDiscount && (
                    <div className="absolute top-3 left-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg dark:shadow-slate-700">
                        {discountPercentage}% OFF
                    </div>
                )}

                {/* Delete Button - Only for Admin */}
                {(currentUser?.role?.toLowerCase() === 'admin') && (
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white p-2 rounded-full shadow-lg dark:shadow-slate-700 transition-colors"
                        title="Delete course"
                    >
                        <FiTrash2 size={18} />
                    </button>
                )}
            </Link>

            {/* Content */}
            <div className="p-5">
                {/* Category */}
                {course.category?.name && (
                    <p className="text-primary-600 text-sm font-semibold mb-2">
                        {course.category.name}
                    </p>
                )}

                {/* Title */}
                <Link to={`/courses/${course._id}`}>
                    <h3 className="font-bold text-xl mb-4 line-clamp-2 text-gray-900 dark:text-gray-100 hover:text-primary-600 transition-colors">
                        {course.title}
                    </h3>
                </Link>

                {/* Trainer with Avatar */}
                {course.trainer && (
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-sm">
                            {course.trainer.name?.charAt(0).toUpperCase() || 'T'}
                        </div>
                        <p className="text-gray-700 text-sm font-medium">{course.trainer.name}</p>
                    </div>
                )}

                {/* Rating & Students */}
                <div className="flex items-center gap-6 mb-5 text-sm">
                    {course.averageRating >= 0 && (
                        <div className="flex items-center gap-1">
                            <FiStar className="text-yellow-400 fill-current" size={16} />
                            <span className="font-bold text-gray-900 dark:text-gray-100">{course.averageRating.toFixed(1)}</span>
                            <span className="text-gray-500">({course.totalReviews || 0})</span>
                        </div>
                    )}

                    {course.enrollmentCount >= 0 && (
                        <div className="flex items-center gap-1 text-gray-600">
                            <FiUsers size={16} />
                            <span>{course.enrollmentCount}</span>
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 mb-4"></div>

                {/* Price & Button */}
                <div className="flex items-center justify-between">
                    <div>
                        {hasDiscount ? (
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-primary-600">
                                    ₹{displayPrice}
                                </span>
                                <span className="text-xs text-gray-400 line-through">
                                    ₹{course.price}
                                </span>
                            </div>
                        ) : (
                            <span className="text-2xl font-bold text-primary-600">
                                ₹{displayPrice}
                            </span>
                        )}
                    </div>

                    {/* View Details Button */}
                    <Link
                        to={`/courses/${course._id}`}
                        className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold text-sm transition-colors shadow-md hover:shadow-lg dark:shadow-slate-700"
                    >
                        View
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
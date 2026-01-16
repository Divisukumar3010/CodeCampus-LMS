import { useState, useEffect } from 'react';
import { FiStar } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const RatingForm = ({ courseId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [existingReview, setExistingReview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchMyReview();
    }, [courseId]);

    const fetchMyReview = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5000/api/reviews/my-review/${courseId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.review) {
                setExistingReview(response.data.review);
                setRating(response.data.review.rating);
                setComment(response.data.review.comment || '');
            }
        } catch (error) {
            // No existing review
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const url = existingReview
                ? `http://localhost:5000/api/reviews/${existingReview._id}`
                : 'http://localhost:5000/api/reviews';

            const method = existingReview ? 'put' : 'post';

            const response = await axios[method](
                url,
                { courseId, rating, comment },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success(existingReview ? 'Review updated!' : 'Review submitted!');
            setExistingReview(response.data.review);
            setIsEditing(false);
            if (onReviewSubmitted) onReviewSubmitted();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete your review?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:5000/api/reviews/${existingReview._id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            toast.success('Review deleted');
            setExistingReview(null);
            setRating(0);
            setComment('');
            if (onReviewSubmitted) onReviewSubmitted();
        } catch (error) {
            toast.error('Failed to delete review');
        }
    };

    if (existingReview && !isEditing) {
        return (
            <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Review</h3>
                <div className="flex items-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                            key={star}
                            className={`${
                                star <= existingReview.rating
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                            }`}
                            size={24}
                        />
                    ))}
                </div>
                {existingReview.comment && (
                    <p className="text-gray-700 mb-4">{existingReview.comment}</p>
                )}
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="btn-outline text-sm"
                    >
                        Edit Review
                    </button>
                    <button
                        onClick={handleDelete}
                        className="btn-outline text-sm text-red-600 border-red-600 hover:bg-red-50"
                    >
                        Delete Review
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
                {existingReview ? 'Edit Your Review' : 'Rate This Course'}
            </h3>
            <form onSubmit={handleSubmit}>
                {/* Star Rating */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Rating *
                    </label>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <FiStar
                                    className={`${
                                        star <= (hoverRating || rating)
                                            ? 'text-yellow-500 fill-current'
                                            : 'text-gray-300'
                                    }`}
                                    size={32}
                                />
                            </button>
                        ))}
                        {rating > 0 && (
                            <span className="ml-2 text-gray-600">
                                {rating === 1 && 'Poor'}
                                {rating === 2 && 'Fair'}
                                {rating === 3 && 'Good'}
                                {rating === 4 && 'Very Good'}
                                {rating === 5 && 'Excellent'}
                            </span>
                        )}
                    </div>
                </div>

                {/* Comment */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review (Optional)
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        className="input-field"
                        placeholder="Share your experience with this course..."
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading || rating === 0}
                        className="btn-primary"
                    >
                        {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
                    </button>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditing(false);
                                setRating(existingReview.rating);
                                setComment(existingReview.comment || '');
                            }}
                            className="btn-outline"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default RatingForm;
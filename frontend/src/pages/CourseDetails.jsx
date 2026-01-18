import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseAPI, orderAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiStar, FiUsers, FiClock, FiBook, FiCheckCircle, FiPlay, FiLock, FiAward, FiGlobe } from 'react-icons/fi';
import { loadStripe } from '@stripe/stripe-js';
import CourseDetails from '../components/course/CourseDetails';
import toast from 'react-hot-toast';



const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CourseDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [course, setCourse] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isPurchased, setIsPurchased] = useState(false);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            fetchCourseDetails();
            if (isAuthenticated) {
                checkPurchaseStatus();
            }
        }
    }, [id, isAuthenticated]);

    const fetchCourseDetails = async () => {
        try {
            setLoading(true);
            setError(null);

            const [courseRes, reviewsRes] = await Promise.all([
                courseAPI.getById(id),
                reviewAPI.getByCourse(id, { limit: 10 }).catch(() => ({ data: { reviews: [] } }))
            ]);

            if (courseRes.data.course) {
                setCourse(courseRes.data.course);
                setReviews(reviewsRes.data.reviews || []);
            } else {
                setError('Course not found');
            }
        } catch (error) {
            console.error('Error fetching course:', error);
            setError('Failed to load course details');
            toast.error('Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    const checkPurchaseStatus = async () => {
        try {
            const response = await orderAPI.checkPurchase(id);
            setIsPurchased(response.data.isPurchased);
        } catch (error) {
            console.error('Error checking purchase:', error);
        }
    };

    const handleEnroll = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to enroll');
            navigate('/login');
            return;
        }

        if (user.role !== 'student') {
            toast.error('Only students can enroll in courses');
            return;
        }

        setPurchasing(true);
        try {
            const response = await orderAPI.createSession({ courseId: id });
            const stripe = await stripePromise;

            const { error } = await stripe.redirectToCheckout({
                sessionId: response.data.sessionId
            });

            if (error) {
                toast.error(error.message);
            }
        } catch (error) {
            console.error('Error creating checkout:', error);
            toast.error('Failed to initiate checkout. Please try again.');
        } finally {
            setPurchasing(false);
        }
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading course details...</p>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">😞</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Course Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The course you are looking for does not exist.'}</p>
                    <Link to="/courses" className="btn-primary inline-block">
                        Browse All Courses
                    </Link>
                </div>
            </div>
        );
    }

    const displayPrice = course.discountPrice || course.price;
    const hasDiscount = course.discountPrice && course.discountPrice < course.price;
    const discountPercentage = hasDiscount
        ? Math.round(((course.price - course.discountPrice) / course.price) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="
  bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900
  text-white
  w-[90%] mx-auto
  rounded-[2rem]
  px-8 py-4 mt-6 md:mt-10 lg:mt-12
  shadow-lg dark:shadow-slate-700
">
                <div className="container-custom py-12 md:py-16">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column - Course Info */}
                        <div className="lg:col-span-2">
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                                <Link to="/" className="hover:text-white transition">Home</Link>
                                <span>/</span>
                                <Link to="/courses" className="hover:text-white transition">Courses</Link>
                                <span>/</span>
                                <span className="text-white">{course.category?.name}</span>
                            </div>

                            {/* Category Badge */}
                            <div className="inline-block px-3 py-1 bg-primary-500 bg-opacity-20 backdrop-blur-sm rounded-full text-primary-300 text-sm font-semibold mb-4">
                                {course.category?.name}
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                                {course.title}
                            </h1>

                            {/* Subtitle */}
                            {course.subtitle && (
                                <p className="text-xl text-gray-300 mb-6">{course.subtitle}</p>
                            )}

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-6 mb-6">
                                {course.averageRating > 0 && (
                                    <div className="flex items-center gap-2">
                                        <FiStar className="text-yellow-400 fill-current" />
                                        <span className="font-bold text-lg">{course.averageRating.toFixed(1)}</span>
                                        <span className="text-gray-400">({course.totalReviews} reviews)</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <FiUsers className="text-gray-400" />
                                    <span>{course.enrollmentCount} students</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FiGlobe className="text-gray-400" />
                                    <span>{course.language}</span>
                                </div>
                            </div>

                            {/* Trainer Info */}
                            <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-950 dark:bg-slate-900 bg-opacity-10 backdrop-blur-sm rounded-xl">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-xl">
                                    {course.trainer?.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Created by</p>
                                    <p className="font-bold text-lg">{course.trainer?.name}</p>
                                    {course.trainer?.expertise && (
                                        <p className="text-sm text-gray-400">{course.trainer.expertise.join(', ')}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Course Card (Desktop) */}
                        <div className="hidden lg:block">
                            <div className="sticky top-24">
                                <div className="bg-white dark:bg-slate-950 dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
                                    <div className="relative">
                                        <img
                                            src={course.thumbnail?.url || 'https://via.placeholder.com/400x250'}
                                            alt={course.title}
                                            className="w-full h-56 object-cover"
                                        />
                                        {hasDiscount && (
                                            <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg dark:shadow-slate-700">
                                                {discountPercentage}% OFF
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6">
                                        {/* Price */}
                                        <div className="mb-6">
                                            {hasDiscount ? (
                                                <div className="flex items-center gap-3">
                                                    <span className="text-4xl font-bold text-primary-600">
                                                        ₹{displayPrice}
                                                    </span>
                                                    <span className="text-2xl text-gray-400 line-through">
                                                        ₹{course.price}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-4xl font-bold text-primary-600">
                                                    ₹{displayPrice}
                                                </span>
                                            )}
                                        </div>

                                        {/* Enroll Button */}
                                        {isPurchased ? (
                                            <Link
                                                to={`/course/view/${course._id}`}
                                                className="btn-primary w-full text-center mb-4 block"
                                            >
                                                Continue Learning
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={handleEnroll}
                                                disabled={purchasing}
                                                className="btn-primary w-full mb-4"
                                            >
                                                {purchasing ? 'Processing...' : 'Enroll Now'}
                                            </button>
                                        )}

                                        {/* Course Includes */}
                                        <div className="space-y-3 text-sm text-gray-700">
                                            <div className="flex items-center gap-3">
                                                <FiCheckCircle className="text-green-500 flex-shrink-0" />
                                                <span>Lifetime access</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <FiCheckCircle className="text-green-500 flex-shrink-0" />
                                                <span>{course.totalLessons} lessons</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <FiCheckCircle className="text-green-500 flex-shrink-0" />
                                                <span>{formatDuration(course.totalDuration)} on-demand video</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <FiCheckCircle className="text-green-500 flex-shrink-0" />
                                                <span>Certificate of completion</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <FiCheckCircle className="text-green-500 flex-shrink-0" />
                                                <span>30-day money-back guarantee</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container-custom py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Course Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* What You'll Learn */}
                        {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                            <div className="card">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">What you'll learn</h2>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {course.whatYouWillLearn.map((item, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                            <span className="text-gray-700">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div className="card">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Description</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{course.description}</p>
                        </div>

                        {/* Course Content */}
                        <div className="card">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Course Content</h2>
                            <CourseDetails course={course} />
                        </div>

                        {/* Requirements */}
                        {course.requirements && course.requirements.length > 0 && (
                            <div className="card">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Requirements</h2>
                                <ul className="list-disc list-inside space-y-2">
                                    {course.requirements.map((req, index) => (
                                        <li key={index} className="text-gray-700">{req}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Target Audience */}
                        {course.targetAudience && course.targetAudience.length > 0 && (
                            <div className="card">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Who this course is for</h2>
                                <ul className="list-disc list-inside space-y-2">
                                    {course.targetAudience.map((audience, index) => (
                                        <li key={index} className="text-gray-700">{audience}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Reviews */}
                        {reviews.length > 0 && (
                            <div className="card">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Student Reviews</h2>
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{review.user?.name || 'Anonymous'}</h4>
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <FiStar
                                                                    key={i}
                                                                    className={i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                                                                    size={16}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {review.comment && (
                                                        <p className="text-gray-700">{review.comment}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Mobile Course Card */}
                    <div className="lg:hidden">
                        <div className="bg-white dark:bg-slate-950 dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden sticky top-24">
                            <div className="relative">
                                <img
                                    src={course.thumbnail?.url || 'https://via.placeholder.com/400x250'}
                                    alt={course.title}
                                    className="w-full h-48 object-cover"
                                />
                                {hasDiscount && (
                                    <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full font-bold shadow-lg dark:shadow-slate-700">
                                        {discountPercentage}% OFF
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <div className="mb-6">
                                    {hasDiscount ? (
                                        <div className="flex items-center gap-3">
                                            <span className="text-4xl font-bold text-primary-600">
                                                ₹{displayPrice}
                                            </span>
                                            <span className="text-2xl text-gray-400 line-through">
                                                ₹{course.price}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-4xl font-bold text-primary-600">
                                            ₹{displayPrice}
                                        </span>
                                    )}
                                </div>

                                {isPurchased ? (
                                    <Link
                                        to={`/course/view/${course._id}`}
                                        className="btn-primary w-full text-center mb-4 block"
                                    >
                                        Continue Learning
                                    </Link>
                                ) : (
                                    <button
                                        onClick={handleEnroll}
                                        disabled={purchasing}
                                        className="btn-primary w-full mb-4"
                                    >
                                        {purchasing ? 'Processing...' : 'Enroll Now'}
                                    </button>
                                )}

                                <div className="space-y-3 text-sm text-gray-700">
                                    <div className="flex items-center gap-3">
                                        <FiCheckCircle className="text-green-500 flex-shrink-0" />
                                        <span>Lifetime access</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FiCheckCircle className="text-green-500 flex-shrink-0" />
                                        <span>Certificate of completion</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FiCheckCircle className="text-green-500 flex-shrink-0" />
                                        <span>30-day money-back guarantee</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailsPage;
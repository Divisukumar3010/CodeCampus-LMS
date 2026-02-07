import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseAPI, orderAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme'; // Import useTheme hook
import { FiStar, FiUsers, FiClock, FiBook, FiCheckCircle, FiPlay, FiLock, FiAward, FiGlobe, FiX } from 'react-icons/fi';
import { loadStripe } from '@stripe/stripe-js';
import CourseDetails from '../components/course/CourseDetails';
import VideoPlayer from '../components/course/VideoPlayer';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CourseDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const { isDarkMode } = useTheme(); // Get theme state
    const [course, setCourse] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [isPurchased, setIsPurchased] = useState(false);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [error, setError] = useState(null);
    const [previewLesson, setPreviewLesson] = useState(null);

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
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <div className={`w-12 h-12 border-4 ${isDarkMode ? 'border-gray-300' : 'border-blue-600'} border-t-transparent rounded-full animate-spin mx-auto mb-4`}></div>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Loading course details...</p>
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">😞</div>
                    <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Course Not Found</h2>
                    <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{error || 'The course you are looking for does not exist.'}</p>
                    <Link to="/courses" className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transition inline-block`}>
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
        <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Hero Section */}
            <div className={`
                bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900
                text-white
                w-full px-4 sm:w-[95%] md:w-[90%] mx-auto
                rounded-xl sm:rounded-2xl md:rounded-[2rem]
                sm:px-6 md:px-8 py-4 mt-4 sm:mt-6 md:mt-10 lg:mt-12
                ${isDarkMode ? 'shadow-slate-800' : 'shadow-lg'}
            `}>
                <div className="py-6 sm:py-8 md:py-12 lg:py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                            {/* Left Column - Course Info */}
                            <div className="lg:col-span-2">
                                {/* Breadcrumb */}
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">
                                    <Link to="/" className="hover:text-white transition">Home</Link>
                                    <span>/</span>
                                    <Link to="/courses" className="hover:text-white transition">Courses</Link>
                                    <span>/</span>
                                    <span className="text-white">{course.category?.name}</span>
                                </div>

                                {/* Category Badge */}
                                <div className="inline-block px-3 py-1 bg-blue-500 bg-opacity-20 backdrop-blur-sm rounded-full text-blue-300 text-sm font-semibold mb-4">
                                    {course.category?.name}
                                </div>

                                {/* Title */}
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
                                    {course.title}
                                </h1>

                                {/* Subtitle */}
                                {course.subtitle && (
                                    <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-4 sm:mb-6">{course.subtitle}</p>
                                )}

                                {/* Meta Info */}
                                <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 text-sm sm:text-base">
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
                                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl">
                                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-base sm:text-xl">
                                        {course.trainer?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Created by</p>
                                        <p className="font-bold text-base sm:text-lg">{course.trainer?.name}</p>
                                        {course.trainer?.expertise && (
                                            <p className="text-sm text-gray-400">{course.trainer.expertise.join(', ')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Course Card (Desktop) */}
                            <div className="hidden lg:block">
                                <div className="sticky top-24">
                                    <div className={`rounded-2xl shadow-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                        <div className="relative">
                                            <img
                                                src={course.thumbnail?.url || 'https://via.placeholder.com/400x250'}
                                                alt={course.title}
                                                className="w-full h-48 sm:h-56 object-cover"
                                            />
                                            {hasDiscount && (
                                                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-sm sm:text-base shadow-lg">
                                                    {discountPercentage}% OFF
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 sm:p-6">
                                            <div className="mb-6">
                                                {hasDiscount ? (
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-4xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                            ₹{displayPrice}
                                                        </span>
                                                        <span className={`text-2xl ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} line-through`}>
                                                            ₹{course.price}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className={`text-4xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                        ₹{displayPrice}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Enroll Button */}
                                            {isPurchased ? (
                                                <Link
                                                    to={`/course/view/${course._id}`}
                                                    className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transition mb-4 w-full"
                                                >
                                                    Continue Learning
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={handleEnroll}
                                                    disabled={purchasing}
                                                    className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transition mb-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {purchasing ? 'Processing...' : 'Enroll Now'}
                                                </button>
                                            )}

                                            {/* Course Includes */}
                                            <div className={`space-y-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
            </div>

            {/* Main Content */}
            <div className="py-6 sm:py-8 md:py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {/* Left Column - Course Details */}
                        <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
                            {/* What You'll Learn */}
                            {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
                                <div className={`rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                    <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>What you'll learn</h2>
                                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                                        {course.whatYouWillLearn.map((item, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <FiCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                                                <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Description */}
                            <div className={`rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <h2 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Description</h2>
                                <p className={`leading-relaxed whitespace-pre-line ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{course.description}</p>
                            </div>

                            {/* Course Content */}
                            <div className={`rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Course Content</h2>
                                <CourseDetails course={course} onPreviewClick={(lesson) => setPreviewLesson(lesson)} />
                            </div>

                            {/* Requirements */}
                            {course.requirements && course.requirements.length > 0 && (
                                <div className={`rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                    <h2 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Requirements</h2>
                                    <ul className="list-disc list-inside space-y-2">
                                        {course.requirements.map((req, index) => (
                                            <li key={index} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{req}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Target Audience */}
                            {course.targetAudience && course.targetAudience.length > 0 && (
                                <div className={`rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                    <h2 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Who this course is for</h2>
                                    <ul className="list-disc list-inside space-y-2">
                                        {course.targetAudience.map((audience, index) => (
                                            <li key={index} className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{audience}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Reviews */}
                            {reviews.length > 0 && (
                                <div className={`rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                    <h2 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Student Reviews</h2>
                                    <div className="space-y-4 sm:space-y-6">
                                        {reviews.map((review) => (
                                            <div key={review._id} className={`border-b pb-4 sm:pb-6 last:border-0 last:pb-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                                <div className="flex items-start gap-3 sm:gap-4">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                                                        {review.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{review.user?.name || 'Anonymous'}</h4>
                                                            <div className="flex items-center gap-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <FiStar
                                                                        key={i}
                                                                        className={i < review.rating ? 'text-yellow-500 fill-current' : isDarkMode ? 'text-gray-600' : 'text-gray-300'}
                                                                        size={16}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {review.comment && (
                                                            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{review.comment}</p>
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
                            <div className={`rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden sticky top-24 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                                <div className="relative">
                                    <img
                                        src={course.thumbnail?.url || 'https://via.placeholder.com/400x250'}
                                        alt={course.title}
                                        className="w-full h-40 sm:h-48 object-cover"
                                    />
                                    {hasDiscount && (
                                        <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full font-bold text-sm shadow-lg">
                                            {discountPercentage}% OFF
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 sm:p-6">
                                    <div className="mb-4 sm:mb-6">
                                        {hasDiscount ? (
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <span className={`text-3xl sm:text-4xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                    ₹{displayPrice}
                                                </span>
                                                <span className={`text-xl sm:text-2xl ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} line-through`}>
                                                    ₹{course.price}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className={`text-3xl sm:text-4xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                ₹{displayPrice}
                                            </span>
                                        )}
                                    </div>

                                    {isPurchased ? (
                                        <Link
                                            to={`/course/view/${course._id}`}
                                            className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transition mb-4 w-full"
                                        >
                                            Continue Learning
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={handleEnroll}
                                            disabled={purchasing}
                                            className="flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-xl transition mb-4 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {purchasing ? 'Processing...' : 'Enroll Now'}
                                        </button>
                                    )}

                                    <div className={`space-y-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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

            {/* Video Preview Modal */}
            {previewLesson && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                    onClick={() => setPreviewLesson(null)}
                >
                    <div
                        className={`relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`flex items-center justify-between px-4 sm:px-6 py-3 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                            <div className="flex items-center gap-2 min-w-0">
                                <FiPlay className="text-primary-600 flex-shrink-0" />
                                <h3 className={`font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {previewLesson.title}
                                </h3>
                                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full flex-shrink-0">
                                    Free Preview
                                </span>
                            </div>
                            <button
                                onClick={() => setPreviewLesson(null)}
                                className={`p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition flex-shrink-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        {/* Video Player */}
                        <div className="aspect-video bg-black">
                            <VideoPlayer url={previewLesson.videoUrl} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseDetailsPage;
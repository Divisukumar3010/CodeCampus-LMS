import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI, adminAPI } from '../services/api';
import { FiPlay, FiUsers, FiStar, FiArrowRight, FiBook, FiAward, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import CourseCard from '../components/course/CourseCard';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { useTheme } from '../hooks/useTheme';

const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const { openModal } = useAuthModal();
    const { isDarkMode } = useTheme();
    const [featuredCourses, setFeaturedCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch courses and categories
            const [coursesRes, categoriesRes] = await Promise.all([
                courseAPI.getAll({ sort: 'popular', limit: 8 }).catch(err => {
                    console.error('Courses API error:', err);
                    return { data: { courses: [] } };
                }),
                adminAPI.getCategories().catch(err => {
                    console.error('Categories API error:', err);
                    return { data: { categories: [] } };
                })
            ]);

            const courses = coursesRes.data.courses || [];
            const cats = categoriesRes.data.categories || [];

            setFeaturedCourses(courses);
            setCategories(cats.slice(0, 8));

            if (courses.length === 0) {
                console.log('ℹ️ No courses found. Please seed the database.');
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load content. Please check if the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`transition-colors duration-300 ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
            {/* Hero Section */}
            <section className={`relative overflow-hidden
                ${isDarkMode
                    ? 'bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border-slate-800/80 shadow-[0_30px_80px_rgba(0,0,0,0.6)]'
                    : 'bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 border-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.25)]'}
                rounded-2xl sm:rounded-3xl md:rounded-[3rem]
                mt-4 sm:mt-6 md:mt-10 mx-auto w-[95%] sm:w-[92%] md:w-[90%] lg:w-[96%]
                pt-16 sm:pt-20 md:pt-24 lg:pt-12 pb-20 sm:pb-24 md:pb-32
                border
                flex justify-center transition-colors duration-300`}>

                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className={`absolute top-0 right-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 ${isDarkMode ? 'bg-indigo-500' : 'bg-white'} rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2`}></div>
                    <div className={`absolute bottom-0 left-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 ${isDarkMode ? 'bg-purple-600' : 'bg-purple-300'} rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2`}></div>
                </div>

                <div className="relative container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10 lg:py-5">
                    <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 md:gap-10 lg:gap-12 items-center">
                        {/* Left Column - Content */}
                        <div className="text-white animate-fade-in">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 sm:mb-5 md:mb-6 leading-tight">
                                Empower Your Future with
                                <span className="block mt-1 sm:mt-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                                    World-Class Learning
                                </span>
                            </h1>
                            <p className={`text-base sm:text-lg md:text-xl lg:text-2xl ${isDarkMode ? 'text-slate-300' : 'text-blue-100'} mb-6 sm:mb-7 md:mb-8 leading-relaxed`}>
                                Join thousands of learners worldwide. Access expert-led courses, earn certificates, and transform your career today.
                            </p>

                            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-12">
                                <Link to="/courses" className="group inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105">
                                    Explore Courses
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                {isAuthenticated ? (
                                    <Link to="/dashboard" className={`inline-flex items-center justify-center gap-2 ${isDarkMode ? 'bg-indigo-950/60 hover:bg-indigo-900/60 border-indigo-700/50' : 'bg-blue-500 bg-opacity-20 hover:bg-opacity-30 border-white border-opacity-30'} backdrop-blur-sm text-white px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-xl font-bold text-base sm:text-lg border-2 transition-all`}>
                                        My Dashboard
                                    </Link>
                                ) : (
                                    <button 
                                        type="button"
                                        onClick={() => openModal('register')}
                                        className={`inline-flex items-center justify-center gap-2 ${isDarkMode ? 'bg-indigo-950/60 hover:bg-indigo-900/60 border-indigo-700/50' : 'bg-blue-500 bg-opacity-20 hover:bg-opacity-30 border-white border-opacity-30'} backdrop-blur-sm text-white px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 rounded-xl font-bold text-base sm:text-lg border-2 transition-all cursor-pointer`}
                                    >
                                        Start Free Trial
                                    </button>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                                <div className="text-center">
                                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">50K+</div>
                                    <div className="text-blue-100 text-xs sm:text-sm">Active Learners</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">15+</div>
                                    <div className="text-blue-100 text-xs sm:text-sm">Expert Courses</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">4.8★</div>
                                    <div className="text-blue-100 text-xs sm:text-sm">Avg Rating</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Feature Card */}
                        <div className="hidden lg:block animate-slide-up">
                            <div className={`${isDarkMode ? 'bg-gray-900/40' : 'bg-gray-100/80'} backdrop-blur-xl rounded-3xl p-8 border ${isDarkMode ? 'border-gray-700/40' : 'border-gray-300/60'} shadow-2xl`}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    {[
                                        { icon: FiBook, label: 'Online Courses', value: '15+', gradient: 'from-blue-500 to-blue-600' },
                                        { icon: FiUsers, label: 'Expert Instructors', value: '20+', gradient: 'from-purple-500 to-purple-600' },
                                        { icon: FiAward, label: 'Certificates Issued', value: '10K+', gradient: 'from-green-500 to-green-600' },
                                        { icon: FiStar, label: 'Average Rating', value: '4.8', gradient: 'from-yellow-500 to-orange-500' }
                                    ].map((item, index) => (
                                        <div key={index} className={`rounded-2xl p-6 text-center transform hover:scale-105 transition-transform shadow-lg ${isDarkMode
                                            ? 'bg-gray-800 text-gray-100'
                                            : 'bg-white text-gray-900'
                                            }`}>
                                            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-4`}>
                                                <item.icon className="text-white text-2xl" />
                                            </div>
                                            <div className="text-3xl font-bold mb-1">{item.value}</div>
                                            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className={`py-12 sm:py-16 md:py-20 px-4 sm:px-6 mx-auto w-[95%] sm:w-[92%] md:w-[98%] max-w-[96%] mt-4 sm:mt-5 rounded-2xl sm:rounded-3xl md:rounded-[3rem] transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/30' : 'bg-white/40'} backdrop-blur-xl border border-white/60 dark:border-slate-700/30 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-[#CED4DA] dark:hover:border-[#495057]`}>
                <div className="container mx-auto px-4">
                    <div className="text-center mb-8 sm:mb-12 md:mb-16">
                        <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            Why Choose <span className="text-blue-600">CodeCampus</span>?
                        </h2>
                        <p className={`text-base sm:text-lg md:text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto px-4`}>
                            We provide the best learning experience with industry-leading features
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                        {[
                            {
                                icon: FiBook,
                                title: 'Expert-Led Courses',
                                description: 'Learn from industry professionals with years of real-world experience',
                                gradient: 'from-blue-500 to-blue-600'
                            },
                            {
                                icon: FiPlay,
                                title: 'Lifetime Access',
                                description: 'Learn at your own pace with unlimited access to course materials',
                                gradient: 'from-purple-500 to-purple-600'
                            },
                            {
                                icon: FiAward,
                                title: 'Earn Certificates',
                                description: 'Get recognized with industry-recognized certificates upon completion',
                                gradient: 'from-green-500 to-green-600'
                            }
                        ].map((feature, index) => (
                            <div key={index} className={`p-6 sm:p-7 md:p-8 rounded-2xl hover:shadow-xl transition-all duration-300 text-center ${isDarkMode
                                ? 'bg-slate-900 hover:bg-slate-800'
                                : 'bg-gray-50 hover:bg-gray-100'
                                }`}>
                                <div className={`w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-4 sm:mb-5 md:mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <feature.icon className="text-white text-2xl sm:text-3xl" />
                                </div>
                                <h3 className={`text-xl sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{feature.title}</h3>
                                <p className={`leading-relaxed text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            {categories.length > 0 && (
                <section className={`py-12 sm:py-16 md:py-20 px-4 sm:px-6 mx-auto w-[95%] sm:w-[92%] md:w-[98%] max-w-[96%] mt-4 sm:mt-5 rounded-2xl sm:rounded-3xl md:rounded-[3rem] transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/30' : 'bg-white/40'} backdrop-blur-xl border border-white/60 dark:border-slate-700/30 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-[#CED4DA] dark:hover:border-[#495057]`}>
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-8 sm:mb-12 md:mb-16">
                            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                Explore Top <span className="text-blue-600">Categories</span>
                            </h2>
                            <p className={`text-base sm:text-lg md:text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Browse courses by category and find your passion</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                            {categories.map((category) => (
                                <Link
                                    key={category._id}
                                    to={`/courses?category=${category._id}`}
                                    className={`p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl hover:shadow-xl transition-all duration-300 text-center hover:-translate-y-2 ${isDarkMode
                                        ? 'bg-gray-900 hover:bg-gray-800'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{category.icon || '📚'}</div>
                                    <h3 className={`font-bold text-base sm:text-lg mb-1 sm:mb-2 group-hover:text-blue-600 transition-colors ${isDarkMode ? 'text-gray-100' : 'text-gray-900'
                                        }`}>
                                        {category.name}
                                    </h3>
                                    <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{category.courseCount || 0} courses</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Courses */}
            <section className={`py-8 sm:py-10 md:py-12 px-4 sm:px-6 mx-auto w-[95%] sm:w-[92%] md:w-[98%] max-w-[96%] mt-4 sm:mt-5 rounded-2xl sm:rounded-3xl md:rounded-[3rem] transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/30' : 'bg-white/40'} backdrop-blur-xl border border-white/60 dark:border-slate-700/30 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-[#CED4DA] dark:hover:border-[#495057]`}>
                <div className="container mx-auto px-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-10 md:mb-12 gap-4">
                        <div>
                            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                Featured <span className="text-blue-600">Courses</span>
                            </h2>
                            <p className={`text-base sm:text-lg md:text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Handpicked courses loved by our students</p>
                        </div>
                        <Link to="/courses" className="hidden md:flex items-center gap-2 text-blue-600 font-semibold text-base sm:text-lg hover:gap-4 transition-all group">
                            View All Courses
                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className={`h-80 sm:h-88 md:h-96 rounded-xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`} />
                            ))}
                        </div>
                    ) : error ? (
                        <div className={`text-center py-12 sm:py-14 md:py-16 rounded-xl px-4 ${isDarkMode ? 'bg-red-900 bg-opacity-20' : 'bg-red-50'}`}>
                            <p className={`text-base sm:text-lg mb-3 sm:mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                            <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Make sure your backend server is running on port 5000</p>
                            <button onClick={fetchData} className="px-5 sm:px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-sm sm:text-base">
                                Try Again
                            </button>
                        </div>
                    ) : featuredCourses.length === 0 ? (
                        <div className={`text-center py-12 sm:py-14 md:py-16 rounded-xl px-4 ${isDarkMode ? 'bg-yellow-900 bg-opacity-20' : 'bg-yellow-50'}`}>
                            <FiBook className={`text-5xl sm:text-6xl mx-auto mb-3 sm:mb-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                            <h3 className={`text-xl sm:text-2xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>No Courses Available Yet</h3>
                            <p className={`mb-4 sm:mb-6 text-sm sm:text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Please run the seed script to add sample courses:</p>
                            <code className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg inline-block mb-3 sm:mb-4 text-xs sm:text-sm ${isDarkMode ? 'bg-slate-800 text-green-400' : 'bg-gray-800 text-green-400'} break-all`}>
                                cd backend && node seed.js
                            </code>
                            <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Then refresh this page</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                                {featuredCourses.map((course) => (
                                    <CourseCard key={course._id} course={course} currentUser={user} />
                                ))}
                            </div>
                            <div className="text-center mt-8 sm:mt-10 md:mt-12 md:hidden">
                                <Link to="/courses" className="inline-flex items-center gap-2 px-5 sm:px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 text-sm sm:text-base">
                                    View All Courses <FiArrowRight />
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className={`relative overflow-hidden
                ${isDarkMode
                    ? 'bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border-slate-800/80 shadow-[0_30px_80px_rgba(0,0,0,0.6)]'
                    : 'bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 border-white/20 shadow-[0_30px_80px_rgba(0,0,0,0.25)]'}
                rounded-2xl sm:rounded-3xl md:rounded-[3rem] lg:rounded-[4rem]
                mt-4 sm:mt-5 md:mt-7 mb-2
                w-[95%] sm:w-[92%] md:w-[98%] mx-auto
                pt-16 sm:pt-20 md:pt-24 lg:pt-12 pb-8 sm:pb-10 md:pb-12
                border
                flex justify-center transition-colors duration-300`}>
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className={`absolute top-0 left-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 ${isDarkMode ? 'bg-indigo-500' : 'bg-white'} rounded-full blur-3xl`}></div>
                    <div className={`absolute bottom-0 right-1/4 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 ${isDarkMode ? 'bg-purple-600' : 'bg-purple-300'} rounded-full blur-3xl`}></div>
                </div>

                <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10 text-center text-white">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-5 md:mb-6 px-2">
                        Ready to Start Your Learning Journey?
                    </h2>
                    <p className={`text-base sm:text-lg md:text-xl lg:text-2xl ${isDarkMode ? 'text-slate-300' : 'text-blue-100'} mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto px-4`}>
                        Join thousands of students learning new skills and advancing their careers with CodeCampus
                    </p>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center px-4">
                        {isAuthenticated ? (
                            <Link to="/courses" className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-7 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 rounded-xl font-bold text-base sm:text-lg hover:bg-blue-50 transition-all shadow-2xl hover:scale-105">
                                Go to My Courses
                                <FiArrowRight />
                            </Link>
                        ) : (
                            <button 
                                type="button"
                                onClick={() => openModal('register')}
                                className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-7 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 rounded-xl font-bold text-base sm:text-lg hover:bg-blue-50 transition-all shadow-2xl hover:scale-105 cursor-pointer"
                            >
                                Get Started Free
                                <FiArrowRight />
                            </button>
                        )}
                        <Link to="/courses" className={`inline-flex items-center justify-center gap-2 ${isDarkMode ? 'bg-indigo-950/60 hover:bg-indigo-900/60 border-indigo-700/50' : 'bg-blue-500 bg-opacity-20 hover:bg-opacity-30 border-white border-opacity-30'} backdrop-blur-sm text-white px-7 sm:px-8 md:px-10 py-3.5 sm:py-4 md:py-5 rounded-xl font-bold text-base sm:text-lg border-2 transition-all`}>
                            Browse Courses
                        </Link>
                    </div>

                    <div className="mt-8 sm:mt-10 md:mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 px-4">
                        {[
                            { icon: FiCheckCircle, text: '30-Day Money Back Guarantee' },
                            { icon: FiCheckCircle, text: 'Lifetime Access to Courses' },
                            { icon: FiCheckCircle, text: 'Expert Instructor Support' },
                            { icon: FiCheckCircle, text: 'Learn at Your Own Pace' }
                        ].map((item, index) => (
                            <div key={index} className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-center">
                                <item.icon className="text-green-300 text-lg sm:text-xl flex-shrink-0" />
                                <span className={`${isDarkMode ? 'text-slate-300' : 'text-blue-100'} text-sm sm:text-base`}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
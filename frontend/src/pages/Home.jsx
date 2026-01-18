import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI, adminAPI } from '../services/api';
import { FiPlay, FiUsers, FiStar, FiArrowRight, FiBook, FiAward, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import CourseCard from '../components/course/CourseCard';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme'; // ADD THIS IMPORT

const Home = () => {
    const { user } = useAuth();
    const { isDarkMode } = useTheme(); // ADD THIS
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
            <section className="relative overflow-hidden
    bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700
    rounded-[3rem] md:rounded-[3rem]
    mt-10 mx-auto w-[90%] md:w-[50%] lg:w-[96%]
    pt-24 md:pt-12 pb-32
    border border-white/20
    shadow-[0_30px_80px_rgba(0,0,0,0.25)]
    flex justify-center">

                {/* Decorative Elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
                </div>

                <div className="relative container mx-2 px-4 py-10 md:py-5">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Column - Content */}
                        <div className="text-white animate-fade-in">
                            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                                Empower Your Future with
                                <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                                    World-Class Learning
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                                Join thousands of learners worldwide. Access expert-led courses, earn certificates, and transform your career today.
                            </p>

                            <div className="flex flex-wrap gap-4 mb-12">
                                <Link to="/courses" className="group inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105">
                                    Explore Courses
                                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/register" className="inline-flex items-center gap-2 bg-blue-500 bg-opacity-20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg border-2 border-white border-opacity-30 hover:bg-blue-500 hover:bg-opacity-30 transition-all">
                                    Start Free Trial
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold mb-1">50K+</div>
                                    <div className="text-blue-100 text-sm">Active Learners</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold mb-1">15+</div>
                                    <div className="text-blue-100 text-sm">Expert Courses</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold mb-1">4.8★</div>
                                    <div className="text-blue-100 text-sm">Avg Rating</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Feature Card */}
                        <div className="hidden lg:block animate-slide-up">
                            <div className={`${isDarkMode ? 'bg-gray-900/40' : 'bg-gray-100/80'} backdrop-blur-xl rounded-3xl p-8 border ${isDarkMode ? 'border-gray-700/40' : 'border-gray-300/60'} shadow-2xl`}>
                                <div className="grid grid-cols-2 gap-6">
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
            <section className={`py-20 px-4 mx-auto w-[98%] max-w-[96%] mt-5 rounded-[3rem] md:rounded-[3rem] transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/30' : 'bg-white/40'} backdrop-blur-xl border border-white/60 dark:border-slate-700/30 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-[#CED4DA] dark:hover:border-[#495057]`}>
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            Why Choose <span className="text-blue-600">CodeCampus</span>?
                        </h2>
                        <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-2xl mx-auto`}>
                            We provide the best learning experience with industry-leading features
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
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
                            <div key={index} className={`p-8 rounded-2xl hover:shadow-xl transition-all duration-300 text-center ${isDarkMode
                                ? 'bg-slate-900 hover:bg-slate-800'
                                : 'bg-gray-50 hover:bg-gray-100'
                                }`}>
                                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                                    <feature.icon className="text-white text-3xl" />
                                </div>
                                <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{feature.title}</h3>
                                <p className={`leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            {categories.length > 0 && (
                <section className={`py-20 px-4 mx-auto w-[98%] max-w-[96%] mt-5 rounded-[3rem] md:rounded-[3rem] transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/30' : 'bg-white/40'} backdrop-blur-xl border border-white/60 dark:border-slate-700/30 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-[#CED4DA] dark:hover:border-[#495057]`}>
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-16">
                            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                Explore Top <span className="text-blue-600">Categories</span>
                            </h2>
                            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Browse courses by category and find your passion</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {categories.map((category) => (
                                <Link
                                    key={category._id}
                                    to={`/courses?category=${category._id}`}
                                    className={`p-6 rounded-2xl hover:shadow-xl transition-all duration-300 text-center hover:-translate-y-2 ${isDarkMode
                                        ? 'bg-gray-900 hover:bg-gray-800'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="text-5xl mb-4">{category.icon || '📚'}</div>
                                    <h3 className={`font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors ${isDarkMode ? 'text-gray-100' : 'text-gray-900'
                                        }`}>
                                        {category.name}
                                    </h3>
                                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{category.courseCount || 0} courses</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Courses */}
            <section className={`py-12 px-4 mx-auto w-[98%] max-w-[96%] mt-5 rounded-[3rem] md:rounded-[3rem] transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/30' : 'bg-white/40'} backdrop-blur-xl border border-white/60 dark:border-slate-700/30 shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] hover:border-[#CED4DA] dark:hover:border-[#495057]`}>
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h2 className={`text-4xl md:text-5xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                Featured <span className="text-blue-600">Courses</span>
                            </h2>
                            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Handpicked courses loved by our students</p>
                        </div>
                        <Link to="/courses" className="hidden md:flex items-center gap-2 text-blue-600 font-semibold text-lg hover:gap-4 transition-all group">
                            View All Courses
                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid md:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className={`h-96 rounded-xl animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-gray-200'}`} />
                            ))}
                        </div>
                    ) : error ? (
                        <div className={`text-center py-16 rounded-xl ${isDarkMode ? 'bg-red-900 bg-opacity-20' : 'bg-red-50'}`}>
                            <p className={`text-lg mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
                            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Make sure your backend server is running on port 5000</p>
                            <button onClick={fetchData} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                                Try Again
                            </button>
                        </div>
                    ) : featuredCourses.length === 0 ? (
                        <div className={`text-center py-16 rounded-xl ${isDarkMode ? 'bg-yellow-900 bg-opacity-20' : 'bg-yellow-50'}`}>
                            <FiBook className={`text-6xl mx-auto mb-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                            <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>No Courses Available Yet</h3>
                            <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Please run the seed script to add sample courses:</p>
                            <code className={`px-6 py-3 rounded-lg inline-block mb-4 ${isDarkMode ? 'bg-slate-800 text-green-400' : 'bg-gray-800 text-green-400'}`}>
                                cd backend && node seed.js
                            </code>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Then refresh this page</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid md:grid-cols-4 gap-6">
                                {featuredCourses.map((course) => (
                                    <CourseCard key={course._id} course={course} currentUser={user} />
                                ))}
                            </div>
                            <div className="text-center mt-12 md:hidden">
                                <Link to="/courses" className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                                    View All Courses <FiArrowRight />
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden
                bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700
                rounded-[3rem] md:rounded-[4rem]
                mt-7 mb-2
                w-[98%] mx-auto
                pt-24 md:pt-12 pb-12
                border border-white/20
                shadow-[0_30px_80px_rgba(0,0,0,0.25)]
                flex justify-center">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center text-white">
                    <h2 className="text-4xl md:text-6xl font-bold mb-6">
                        Ready to Start Your Learning Journey?
                    </h2>
                    <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
                        Join thousands of students learning new skills and advancing their careers with CodeCampus
                    </p>

                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link to="/register" className="inline-flex items-center gap-2 bg-white text-blue-600 px-10 py-5 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl hover:scale-105">
                            Get Started Free
                            <FiArrowRight />
                        </Link>
                        <Link to="/courses" className="inline-flex items-center gap-2 bg-blue-500 bg-opacity-20 backdrop-blur-sm text-white px-10 py-5 rounded-xl font-bold text-lg border-2 border-white border-opacity-30 hover:bg-blue-500 hover:bg-opacity-30 transition-all">
                            Browse Courses
                        </Link>
                    </div>

                    <div className="mt-16 grid md:grid-cols-4 gap-8">
                        {[
                            { icon: FiCheckCircle, text: '30-Day Money Back Guarantee' },
                            { icon: FiCheckCircle, text: 'Lifetime Access to Courses' },
                            { icon: FiCheckCircle, text: 'Expert Instructor Support' },
                            { icon: FiCheckCircle, text: 'Learn at Your Own Pace' }
                        ].map((item, index) => (
                            <div key={index} className="flex items-center gap-3 justify-center">
                                <item.icon className="text-green-300 text-xl flex-shrink-0" />
                                <span className="text-blue-100">{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
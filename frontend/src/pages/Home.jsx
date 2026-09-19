import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI, adminAPI } from '../services/api';
import { FiArrowRight, FiBook, FiCode, FiLayers, FiDatabase, FiTrendingUp, FiCpu, FiSmartphone, FiCamera, FiLayout } from 'react-icons/fi';
import CourseCard from '../components/course/CourseCard';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { useTheme } from '../hooks/useTheme';
import ThreeHeroCanvas from '../components/common/ThreeHeroCanvas';
import ThreeBackgroundCanvas from '../components/common/ThreeBackgroundCanvas';

const Home = () => {
    const { user, isAuthenticated } = useAuth();
    const { openModal } = useAuthModal();
    const { isDarkMode } = useTheme();

    const [featuredCourses, setFeaturedCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [platformStats, setPlatformStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch real-time courses, categories, and platform statistics from existing APIs
            const [coursesRes, categoriesRes, statsRes] = await Promise.all([
                courseAPI.getAll({ sort: 'popular', limit: 8 }).catch(err => {
                    console.error('Courses API error:', err);
                    return { data: { courses: [] } };
                }),
                adminAPI.getCategories().catch(err => {
                    console.error('Categories API error:', err);
                    return { data: { categories: [] } };
                }),
                adminAPI.getPublicPlatformStats().catch(err => {
                    console.error('Platform stats API error:', err);
                    return { data: { stats: null } };
                })
            ]);

            const courses = coursesRes.data?.courses || [];
            const cats = categoriesRes.data?.categories || [];
            const stats = statsRes.data?.stats;

            setFeaturedCourses(courses);
            setCategories(cats.slice(0, 8));
            setPlatformStats(stats);
        } catch (err) {
            console.error('Error fetching landing page data:', err);
            setError('Failed to load live curriculum content.');
        } finally {
            setLoading(false);
        }
    };

    // Fallback categories list with rich domain data if database categories is empty or sparse
    const domainCategories = [
        {
            name: 'Business Strategy',
            tag: 'NEW',
            tagColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            borderColor: 'border-amber-500/20 hover:border-amber-500/40',
            iconColor: 'text-amber-400',
            iconBg: 'bg-amber-500/10 border-amber-500/20 group-hover:bg-amber-500/20',
            countText: '8 modules',
            icon: FiLayers
        },
        {
            name: 'Data Science',
            tag: 'TRENDING',
            tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            borderColor: 'border-emerald-500/30 hover:border-emerald-500/50',
            iconColor: 'text-emerald-400',
            iconBg: 'bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/20',
            countText: `${platformStats?.totalCourses ? Math.max(3, Math.floor(platformStats.totalCourses / 4)) : 3} courses active`,
            icon: FiTrendingUp,
            isPulsing: true
        },
        {
            name: 'Databases & SQL',
            tag: 'CORE',
            tagColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
            borderColor: 'border-purple-500/20 hover:border-purple-500/40',
            iconColor: 'text-purple-400',
            iconBg: 'bg-purple-500/10 border-purple-500/20 group-hover:bg-purple-500/20',
            countText: 'Database tracks active',
            icon: FiDatabase
        },
        {
            name: 'Digital Marketing',
            tag: 'GROWTH',
            tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            borderColor: 'border-blue-500/20 hover:border-blue-500/40',
            iconColor: 'text-blue-400',
            iconBg: 'bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500/20',
            countText: '4 tracks',
            icon: FiTrendingUp
        },
        {
            name: 'Machine Learning',
            tag: 'HOT',
            tagColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
            borderColor: 'border-rose-500/20 hover:border-rose-500/40',
            iconColor: 'text-rose-400',
            iconBg: 'bg-rose-500/10 border-rose-500/20 group-hover:bg-rose-500/20',
            countText: '2 tracks live',
            icon: FiCpu,
            isPulsing: true
        },
        {
            name: 'Mobile & Flutter',
            tag: 'NATIVE',
            tagColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
            borderColor: 'border-cyan-500/30 hover:border-cyan-500/50',
            iconColor: 'text-cyan-400',
            iconBg: 'bg-cyan-500/10 border-cyan-500/20 group-hover:bg-cyan-500/20',
            countText: 'Cross-platform dev',
            icon: FiSmartphone
        },
        {
            name: 'Visual Media',
            tag: 'CREATIVE',
            tagColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
            borderColor: 'border-orange-500/20 hover:border-orange-500/40',
            iconColor: 'text-orange-400',
            iconBg: 'bg-orange-500/10 border-orange-500/20 group-hover:bg-orange-500/20',
            countText: '3 workshops',
            icon: FiCamera
        },
        {
            name: 'UI/UX Systems',
            tag: 'DESIGN',
            tagColor: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
            borderColor: 'border-pink-500/20 hover:border-pink-500/40',
            iconColor: 'text-pink-400',
            iconBg: 'bg-pink-500/10 border-pink-500/20 group-hover:bg-pink-500/20',
            countText: '5 masterclasses',
            icon: FiLayout
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#060913] text-slate-800 dark:text-slate-100 antialiased selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden transition-colors duration-300">
            {/* Subtle Ambient Glow Background */}
            <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/15 blur-[140px] rounded-full" />
                <div className="absolute top-[35%] -left-32 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute top-[65%] -right-32 w-[550px] h-[550px] bg-indigo-500/10 dark:bg-indigo-500/10 blur-[130px] rounded-full" />
            </div>

            {/* MAIN CONTENT */}
            <main className="relative z-10">
                {/* 1. HERO SECTION WITH THREE.JS 3D CONSTELLATION & TECH CORE */}
                <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-36 bg-grid-pattern" data-purpose="hero-section">
                    {/* Three.js Interactive 3D Background */}
                    <ThreeHeroCanvas />

                    {/* Smooth Bottom Fade-Out Blend to eliminate sharp cut */}
                    <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-slate-50 via-slate-50/70 to-transparent dark:from-[#060913] dark:via-[#060913]/70 dark:to-transparent pointer-events-none z-10" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                            {/* Left Column: Copy & Actions */}
                            <div className="lg:col-span-7 flex flex-col items-start space-y-6">
                                {/* Cohort Status Pill */}
                                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full glow-pill text-indigo-700 dark:text-indigo-200 text-xs font-semibold backdrop-blur-md">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500 dark:bg-cyan-400" />
                                    </span>
                                    <span>Next Cohort Open for Enrollment</span>
                                </div>

                                {/* Primary Headline */}
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.12] text-slate-900 dark:text-white">
                                    Empower Your Future with <br className="hidden sm:inline" />
                                    <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 dark:from-amber-300 dark:via-yellow-400 dark:to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                                        World-Class Learning
                                    </span>
                                </h1>

                                {/* Subtitle */}
                                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl font-normal leading-relaxed">
                                    Join thousands of learners worldwide. Access expert-led courses, earn certificates, and transform your career today.
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
                                    <Link
                                        to="/courses"
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] border border-indigo-400/30"
                                    >
                                        <span>Explore Courses</span>
                                        <FiArrowRight className="w-4 h-4 text-white translate-x-0 group-hover:translate-x-1 transition-transform" />
                                    </Link>

                                    {isAuthenticated ? (
                                        <Link
                                            to="/dashboard"
                                            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-surface-900/80 hover:bg-slate-50 dark:hover:bg-surface-800/90 border border-slate-300 dark:border-slate-700/80 backdrop-blur-md transition-all hover:border-slate-400 dark:hover:border-slate-500 shadow-md shadow-slate-200/50 dark:shadow-black/20"
                                        >
                                            My Dashboard
                                        </Link>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => openModal('register')}
                                            className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-surface-900/80 hover:bg-slate-50 dark:hover:bg-surface-800/90 border border-slate-300 dark:border-slate-700/80 backdrop-blur-md transition-all hover:border-slate-400 dark:hover:border-slate-500 shadow-md shadow-slate-200/50 dark:shadow-black/20 cursor-pointer"
                                        >
                                            Start Free Trial
                                        </button>
                                    )}
                                </div>

                                {/* Stats Bar (Live DB Metrics) */}
                                <div className="grid grid-cols-3 gap-3 sm:gap-8 pt-6 sm:pt-8 mt-2 border-t border-slate-200 dark:border-slate-800/80 w-full max-w-lg">
                                    <div className="pr-1 sm:pr-0">
                                        <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                            {platformStats?.totalLearners
                                                ? platformStats.totalLearners >= 1000
                                                    ? `${(platformStats.totalLearners / 1000).toFixed(1)}K+`
                                                    : `${platformStats.totalLearners}+`
                                                : '50+'}
                                        </div>
                                        <div className="text-[11px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-tight">Active Learners</div>
                                    </div>
                                    <div className="border-l border-slate-200 dark:border-slate-800 pl-3 sm:pl-8 pr-1 sm:pr-0">
                                        <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                            {platformStats?.totalCourses ? `${platformStats.totalCourses}+` : '10+'}
                                        </div>
                                        <div className="text-[11px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-tight">Courses Live</div>
                                    </div>
                                    <div className="border-l border-slate-200 dark:border-slate-800 pl-3 sm:pl-8">
                                        <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-amber-500 dark:text-amber-400 tracking-tight flex items-center gap-1">
                                            {platformStats?.averageRating ? platformStats.averageRating.toFixed(1) : '4.8'}
                                            <span className="text-base sm:text-xl">★</span>
                                        </div>
                                        <div className="text-[11px] sm:text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 leading-tight">Avg Rating</div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Institutional Hero Dashboard Card */}
                            <div className="lg:col-span-5 w-full max-w-full" data-purpose="institutional-dashboard-card">
                                <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-7 bg-white/85 dark:bg-slate-900/35 backdrop-blur-md border border-slate-200/80 dark:border-indigo-500/20 shadow-xl dark:shadow-2xl shadow-slate-300/40 dark:shadow-indigo-950/40 transition-all duration-300 hover:border-indigo-500/40 w-full overflow-hidden">
                                    {/* Corner ambient glow */}
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                                    <div className="flex items-center justify-between pb-4 sm:pb-5 mb-4 sm:mb-5 border-b border-slate-200 dark:border-white/[0.08]">
                                        <div>
                                            <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase">
                                                Institutional Dashboard
                                            </span>
                                            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
                                                Academic Cohort Performance
                                            </h3>
                                        </div>
                                        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 backdrop-blur-md">
                                            2024–2026
                                        </span>
                                    </div>

                                    {/* Top Visual: Radial Gauge + Live Mini Stats */}
                                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pb-4 sm:pb-5 mb-4 sm:mb-5 border-b border-slate-200 dark:border-white/[0.08]">
                                        {/* Circular Radial Gauge */}
                                        <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 flex items-center justify-center">
                                            <svg className="w-full h-full" viewBox="0 0 200 200">
                                                <circle cx="100" cy="100" fill="none" r="85" stroke="currentColor" className="text-slate-200 dark:text-slate-800/80" strokeWidth="14" />
                                                <circle
                                                    className="gauge-progress"
                                                    cx="100"
                                                    cy="100"
                                                    fill="none"
                                                    r="85"
                                                    stroke="url(#blue-cyan-gradient)"
                                                    strokeLinecap="round"
                                                    strokeWidth="14"
                                                />
                                                <defs>
                                                    <linearGradient id="blue-cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="#38bdf8" />
                                                        <stop offset="50%" stopColor="#6366f1" />
                                                        <stop offset="100%" stopColor="#a855f7" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight drop-shadow-sm">
                                                    {platformStats?.totalCourses ? `${platformStats.totalCourses}+` : '15+'}
                                                </span>
                                                <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-indigo-600 dark:text-indigo-300 uppercase mt-0.5">
                                                    CURRICULUM COURSES
                                                </span>
                                                <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-300/80 mt-0.5 sm:mt-1">75% Capacity</span>
                                            </div>
                                        </div>

                                        {/* Details Rows */}
                                        <div className="space-y-2 w-full">
                                            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/35 border border-slate-200 dark:border-white/[0.08] backdrop-blur-sm flex items-center justify-between">
                                                <span className="text-xs text-slate-700 dark:text-slate-200 font-medium">Enrolled Intake</span>
                                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">+34% vs last yr</span>
                                            </div>
                                            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/35 border border-slate-200 dark:border-white/[0.08] backdrop-blur-sm flex items-center justify-between">
                                                <span className="text-xs text-slate-700 dark:text-slate-200 font-medium">Completion Rate</span>
                                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-300">92.4%</span>
                                            </div>
                                            <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/35 border border-slate-200 dark:border-white/[0.08] backdrop-blur-sm flex items-center justify-between">
                                                <span className="text-xs text-slate-700 dark:text-slate-200 font-medium">Accreditation</span>
                                                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-300">ISO 9001:2020</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metric Rows */}
                                    <div className="space-y-2.5" data-purpose="dashboard-metrics-list">
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/35 border border-slate-200 dark:border-white/[0.08] backdrop-blur-sm flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:border-slate-300 dark:hover:border-white/20 transition-all">
                                            <div className="flex items-center gap-3">
                                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-sm shadow-blue-400" />
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Curriculum Courses</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-300/80">Industry-standard programs</div>
                                                </div>
                                            </div>
                                            <div className="text-base font-bold text-indigo-600 dark:text-indigo-300">
                                                {platformStats?.totalCourses ? `${platformStats.totalCourses}+` : '15+'}
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/35 border border-slate-200 dark:border-white/[0.08] backdrop-blur-sm flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:border-slate-300 dark:hover:border-white/20 transition-all">
                                            <div className="flex items-center gap-3">
                                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-400" />
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Faculty Instructors</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-300/80">Experienced professionals</div>
                                                </div>
                                            </div>
                                            <div className="text-base font-bold text-indigo-600 dark:text-indigo-300">
                                                {platformStats?.totalInstructors ? `${platformStats.totalInstructors}+` : '20+'}
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/35 border border-slate-200 dark:border-white/[0.08] backdrop-blur-sm flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:border-slate-300 dark:hover:border-white/20 transition-all">
                                            <div className="flex items-center gap-3">
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400" />
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Certificates Conferred</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-300/80">Verified credentials</div>
                                                </div>
                                            </div>
                                            <div className="text-base font-bold text-indigo-600 dark:text-indigo-300">
                                                {platformStats?.totalCertificates ? `${platformStats.totalCertificates}+` : '10+'}
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/35 border border-slate-200 dark:border-white/[0.08] backdrop-blur-sm flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:border-slate-300 dark:hover:border-white/20 transition-all">
                                            <div className="flex items-center gap-3">
                                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-400" />
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Student Rating</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-300/80">Institutional excellence</div>
                                                </div>
                                            </div>
                                            <div className="text-base font-bold text-amber-500 dark:text-amber-400 flex items-center gap-1">
                                                {platformStats?.averageRating ? platformStats.averageRating.toFixed(1) : '4.8'}
                                                <span className="text-xs">★</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. WHY CHOOSE CODECAMPUS SECTION */}
                <section className="py-24 bg-slate-100/50 dark:bg-surface-950/40 relative transition-colors duration-300 overflow-hidden" data-purpose="why-choose-us">
                    {/* Top smooth blending gradient */}
                    <div aria-hidden="true" className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-slate-50 to-transparent dark:from-[#060913] dark:to-transparent pointer-events-none z-10" />

                    {/* Interactive 3D Background effect */}
                    <ThreeBackgroundCanvas />

                    {/* Bottom smooth blending gradient */}
                    <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-slate-50 to-transparent dark:from-[#060913] dark:to-transparent pointer-events-none z-10" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glow-pill text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-4 backdrop-blur-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400" />
                                <span>ENGINEERED FOR EXCELLENCE</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 dark:from-blue-400 dark:via-indigo-400 dark:to-cyan-400">CodeCampus</span>?
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mt-3 text-base leading-relaxed">
                                Industry-leading infrastructure built specifically for immersive software engineering and computer science mastery.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Card 1 */}
                            <div className="glass-card rounded-3xl p-8 flex flex-col justify-between group border border-blue-500/20 hover:border-blue-500/40 relative overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
                                <div className="absolute -top-10 -right-10 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />
                                <div>
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-all">
                                        <FiBook className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Expert-Led Courses</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                        Curated syllabi designed by staff architects from Fortune 500 tech companies with live code telemetry.
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs">
                                    <span className="text-slate-500 dark:text-slate-400">Mentorship ratio</span>
                                    <span className="font-bold font-mono text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-500/20">
                                        1:8 Live
                                    </span>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="glass-card rounded-3xl p-8 flex flex-col justify-between group border border-purple-500/20 hover:border-purple-500/40 relative overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
                                <div className="absolute -top-10 -right-10 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />
                                <div>
                                    <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all">
                                        <FiCode className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Lifetime Cloud Access</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                        Perpetual access to all future course revisions, cloud workspace clusters, recorded sessions, and cheat sheets.
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs">
                                    <span className="text-slate-500 dark:text-slate-400">Workspace uptime</span>
                                    <span className="font-bold font-mono text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-500/20">
                                        99.98% SLA
                                    </span>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="glass-card rounded-3xl p-8 flex flex-col justify-between group border border-emerald-500/20 hover:border-emerald-500/40 relative overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
                                <div className="absolute -top-10 -right-10 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
                                <div>
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all">
                                        <FiLayers className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Accredited Credentials</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                                        Cryptographically signed digital credentials with automated one-click LinkedIn and GitHub profile integration.
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between text-xs">
                                    <span className="text-slate-500 dark:text-slate-400">Verification rate</span>
                                    <span className="font-bold font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">
                                        Instant CID
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. EXPLORE TOP CATEGORIES SECTION */}
                <section className="py-24 relative overflow-hidden" data-purpose="categories-section">
                    {/* Top smooth blending gradient */}
                    <div aria-hidden="true" className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-slate-50 via-slate-50/50 to-transparent dark:from-[#060913] dark:via-[#060913]/50 dark:to-transparent pointer-events-none z-10" />

                    {/* Interactive 3D Background effect */}
                    <ThreeBackgroundCanvas />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                        <div className="text-center max-w-2xl mx-auto mb-14">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glow-pill text-cyan-700 dark:text-cyan-300 text-xs font-semibold mb-4 backdrop-blur-md">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                                <span>DISCOVER DOMAINS</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Explore Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-cyan-300">Categories</span>
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mt-3 text-base">
                                Browse modern engineering disciplines verified by industry hiring pipelines
                            </p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {domainCategories.map((cat, idx) => {
                                const IconComponent = cat.icon;
                                return (
                                    <Link
                                        key={idx}
                                        to="/courses"
                                        className={`glass-card rounded-2xl p-6 flex flex-col items-center justify-between text-center group cursor-pointer border ${cat.borderColor} relative overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md`}
                                    >
                                        <div className="w-full flex items-center justify-between mb-4">
                                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${cat.tagColor}`}>
                                                {cat.tag}
                                            </span>
                                            {cat.isPulsing ? (
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                                </span>
                                            ) : (
                                                <span className="flex h-2 w-2 rounded-full bg-amber-400 opacity-80" />
                                            )}
                                        </div>

                                        <div className={`w-14 h-14 rounded-xl border flex items-center justify-center mb-3 group-hover:scale-110 transition-all ${cat.iconBg}`}>
                                            <IconComponent className={`w-7 h-7 ${cat.iconColor}`} />
                                        </div>

                                        <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors">
                                            {cat.name}
                                        </h4>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                                            {cat.countText}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom smooth blending gradient */}
                    <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-slate-50 to-transparent dark:from-[#060913] dark:to-transparent pointer-events-none z-10" />
                </section>

                {/* 4. FEATURED COURSES SECTION */}
                <section className="py-24 bg-slate-100/40 dark:bg-surface-950/40 relative transition-colors duration-300 overflow-hidden" data-purpose="featured-courses" id="courses">
                    {/* Top smooth blending gradient */}
                    <div aria-hidden="true" className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-slate-50 to-transparent dark:from-[#060913] dark:to-transparent pointer-events-none z-10" />

                    {/* Interactive 3D Background effect */}
                    <ThreeBackgroundCanvas />

                    {/* Bottom smooth blending gradient */}
                    <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-slate-50 to-transparent dark:from-[#060913] dark:to-transparent pointer-events-none z-10" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glow-pill text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-3 backdrop-blur-md">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400" />
                                    <span>PRODUCTION CURRICULUM</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    Featured <span className="text-indigo-600 dark:text-indigo-400">Courses</span>
                                </h2>
                                <p className="text-slate-600 dark:text-slate-400 mt-2 text-base">
                                    Handpicked cohorts with interactive cloud sandbox environments
                                </p>
                            </div>

                            <Link
                                to="/courses"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-600/15 hover:bg-indigo-100 dark:hover:bg-indigo-600/25 border border-indigo-200 dark:border-indigo-500/30 transition-all group shadow-sm"
                            >
                                <span>View All Courses</span>
                                <FiArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-72 rounded-2xl bg-white dark:bg-surface-900/60 animate-pulse border border-slate-200 dark:border-slate-800 shadow-sm" />
                                ))}
                            </div>
                        ) : featuredCourses.length === 0 ? (
                            <div className="glass-card rounded-3xl p-12 text-center max-w-lg mx-auto border border-slate-200 dark:border-slate-800">
                                <FiBook className="text-4xl text-indigo-500 dark:text-indigo-400 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Courses Published Yet</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                    Run the seed command in the backend to populate production cohorts.
                                </p>
                                <Link
                                    to="/courses"
                                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white text-sm"
                                >
                                    Browse Directory
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {featuredCourses.map((course) => (
                                    <CourseCard key={course._id} course={course} currentUser={user} />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* 5. ONLINE CLOUD COMPILER BANNER */}
                <section className="py-24 relative overflow-hidden" data-purpose="compiler-cta" id="compiler">
                    {/* Top smooth blending gradient */}
                    <div aria-hidden="true" className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-slate-50 to-transparent dark:from-[#060913] dark:to-transparent pointer-events-none z-10" />

                    {/* Interactive 3D Background effect */}
                    <ThreeBackgroundCanvas />

                    {/* Bottom smooth blending gradient into Footer */}
                    <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-slate-100 to-transparent dark:from-[#060913] dark:to-transparent pointer-events-none z-10" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
                        <div className="rounded-3xl p-6 sm:p-10 relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 border border-slate-700/60 dark:border-indigo-500/30 shadow-2xl text-white">
                            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                                {/* Left copy */}
                                <div className="lg:col-span-5 space-y-5">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glow-pill text-cyan-300 text-xs font-semibold backdrop-blur-md">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                                        </span>
                                        <span>ZERO-LATENCY CLOUD RUNTIME</span>
                                    </div>

                                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                                        Practice Live in our Built-in Cloud Compiler
                                    </h2>

                                    <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                                        Run Python, JavaScript, C++, Rust, and Go with instant execution telemetry, container isolation, and zero environment setup needed.
                                    </p>

                                    <div className="flex flex-wrap items-center gap-3 pt-2">
                                        <Link
                                            to="/online-compiler"
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 border border-indigo-400/30"
                                        >
                                            <FiCode className="w-5 h-5 text-cyan-300" />
                                            <span>Launch Cloud Compiler</span>
                                        </Link>
                                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                            WebAssembly Engine v3.2
                                        </span>
                                    </div>
                                </div>

                                {/* Right compiler simulated console card */}
                                <div className="lg:col-span-7">
                                    <div className="rounded-2xl border border-slate-700/80 bg-[#060913] shadow-2xl overflow-hidden">
                                        <div className="px-3 sm:px-4 py-2.5 bg-[#090e1c] border-b border-slate-800 flex items-center justify-between overflow-x-auto">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="flex items-center gap-1.5 mr-2 flex-shrink-0">
                                                    <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-red-500/80" />
                                                    <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-amber-500/80" />
                                                    <span className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-emerald-500/80" />
                                                </div>
                                                <div className="flex items-center gap-1 text-xs">
                                                    <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-indigo-600/20 text-indigo-300 font-mono font-medium border border-indigo-500/30 whitespace-nowrap">
                                                        script.py
                                                    </span>
                                                    <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-slate-400 hover:text-slate-200 font-mono whitespace-nowrap">
                                                        app.js
                                                    </span>
                                                    <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-slate-400 hover:text-slate-200 font-mono whitespace-nowrap">
                                                        main.cpp
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 flex-shrink-0 ml-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                CPU: 1.2%
                                            </span>
                                        </div>

                                        <div className="p-3 sm:p-4 font-mono text-[11px] sm:text-xs text-slate-300 leading-relaxed bg-[#060913] space-y-1 overflow-x-auto">
                                            <div className="text-slate-500"># Cloud Compiler Session :: Python 3.12</div>
                                            <div>
                                                <span className="text-purple-400">import</span>{' '}
                                                <span className="text-cyan-300">numpy</span>{' '}
                                                <span className="text-purple-400">as</span>{' '}
                                                <span className="text-indigo-300">np</span>
                                            </div>
                                            <div>
                                                <span className="text-purple-400">def</span>{' '}
                                                <span className="text-blue-400">solve_matrix</span>(size=128):
                                            </div>
                                            <div className="pl-4">
                                                <span className="text-slate-400">grid = np.random.randn(size, size)</span>
                                            </div>
                                            <div className="pl-4">
                                                <span className="text-purple-400">return</span>{' '}
                                                <span className="text-cyan-300">np.linalg.norm</span>(grid)
                                            </div>
                                            <div>
                                                <span className="text-amber-400">print</span>(
                                                <span className="text-emerald-300">f"[OK] Tensor evaluated: &#123;solve_matrix():.4f&#125;"</span>)
                                            </div>
                                        </div>

                                        <div className="px-4 py-2 bg-[#090e1c] border-t border-slate-800/80 font-mono text-[11px] flex items-center justify-between text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <span className="text-emerald-400 font-bold">&gt;</span>
                                                <span className="text-emerald-300">[OK] Tensor evaluated: 16.0291 (runtime: 14ms)</span>
                                            </div>
                                            <span className="text-slate-500 text-[10px]">Memory: 24MB</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;
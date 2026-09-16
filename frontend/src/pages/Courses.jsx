import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { courseAPI, adminAPI } from '../services/api';
import CourseCard from '../components/course/CourseCard';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Courses = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const searchTimeoutRef = useRef(null);
    const fetchAbortRef = useRef(null);

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        level: searchParams.get('level') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        minRating: searchParams.get('minRating') || '',
        sort: searchParams.get('sort') || 'newest',
    });

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0,
    });

    // Load categories only once
    useEffect(() => {
        loadCategories();
    }, []);

    // Load courses when filters or page changes
    useEffect(() => {
        loadCourses();
    }, [filters, pagination.currentPage]);

    const loadCategories = async () => {
        try {
            const response = await adminAPI.getCategories();
            setCategories(response.data.categories || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadCourses = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', pagination.currentPage);
            params.append('limit', 12);

            if (filters.search) params.append('search', filters.search);
            if (filters.category) params.append('category', filters.category);
            if (filters.level && filters.level !== 'all') params.append('level', filters.level);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.minRating) params.append('minRating', filters.minRating);
            params.append('sort', filters.sort);

            const response = await courseAPI.getAll(Object.fromEntries(params));

            setCourses(response.data.courses || []);
            setPagination({
                currentPage: response.data.currentPage,
                totalPages: response.data.totalPages,
                total: response.data.total,
            });
        } catch (error) {
            console.error('Error loading courses:', error);
            if (error.response?.status !== 429) {
                toast.error('Failed to load courses');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (value) => {
        setFilters(prev => ({ ...prev, search: value }));

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setPagination(prev => ({ ...prev, currentPage: 1 }));
        }, 1200);
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({ ...prev, [name]: value }));
        // Reset to page 1 only for filters, not for sort
        if (name !== 'sort') {
            setPagination(prev => ({ ...prev, currentPage: 1 }));
        }
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            category: '',
            level: '',
            minPrice: '',
            maxPrice: '',
            minRating: '',
            sort: 'newest',
        });
        setSearchParams({});
        setPagination(prev => ({ ...prev, currentPage: 1 }));
    };

    const hasActiveFilters = Object.values(filters).some(val => val && val !== 'newest');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="card p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Academic Course Catalog</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{pagination.total} university accredited courses available</p>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="md:hidden inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filters
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={filters.search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                </div>
            </div>

            <div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                    {/* Sidebar Filters */}
                    <aside className={`${showFilters ? 'block' : 'hidden md:block'} w-full md:w-64 flex-shrink-0`}>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 md:sticky md:top-[31%]">
                            <div className="flex items-center justify-between mb-6 ">
                                <h2 className="font-bold text-lg text-slate-900 dark:text-white">Filters</h2>
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            <div className="space-y-5">
                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Category</label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Level */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Level</label>
                                    <select
                                        value={filters.level}
                                        onChange={(e) => handleFilterChange('level', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    >
                                        <option value="">All Levels</option>
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Price Range</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.minPrice}
                                            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.maxPrice}
                                            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                        />
                                    </div>
                                </div>

                                {/* Rating */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Rating</label>
                                    <select
                                        value={filters.minRating}
                                        onChange={(e) => handleFilterChange('minRating', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    >
                                        <option value="">Any Rating</option>
                                        <option value="4.5">4.5+ ⭐</option>
                                        <option value="4.0">4.0+ ⭐</option>
                                        <option value="3.5">3.5+ ⭐</option>
                                        <option value="3.0">3.0+ ⭐</option>
                                    </select>
                                </div>

                                {/* Sort */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Sort By</label>
                                    <select
                                        value={filters.sort}
                                        onChange={(e) => handleFilterChange('sort', e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="popular">Most Popular</option>
                                        <option value="rating">Highest Rated</option>
                                        <option value="price-low">Price: Low to High</option>
                                        <option value="price-high">Price: High to Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-grow">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse h-80"></div>
                                ))}
                            </div>
                        ) : courses.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                                    {courses.map(course => (
                                        <CourseCard key={course._id} course={course} currentUser={user} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="flex flex-wrap justify-center items-center gap-2 mt-8 sm:mt-12">
                                        <button
                                            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                            disabled={pagination.currentPage === 1}
                                            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg disabled:opacity-50 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                        >
                                            Previous
                                        </button>
                                        {[...Array(pagination.totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPagination(prev => ({ ...prev, currentPage: i + 1 }))}
                                                className={`px-3 py-2 rounded-lg ${pagination.currentPage === i + 1
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition'
                                                    }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                            disabled={pagination.currentPage === pagination.totalPages}
                                            className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg disabled:opacity-50 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 sm:py-20">
                                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">No Courses Found</h3>
                                <p className="text-slate-600 dark:text-slate-400 mb-6">Try adjusting your filters</p>
                                <button onClick={clearFilters} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Courses;
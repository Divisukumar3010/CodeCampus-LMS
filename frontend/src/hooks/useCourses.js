import { useState, useEffect } from 'react';
import { courseAPI } from '../services/api';
import toast from 'react-hot-toast';

export const useCourses = (filters = {}) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0,
    });

    useEffect(() => {
        fetchCourses();
    }, [JSON.stringify(filters)]);

    const fetchCourses = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await courseAPI.getAll(filters);
            setCourses(response.data.courses || []);
            setPagination({
                currentPage: response.data.currentPage,
                totalPages: response.data.totalPages,
                total: response.data.total,
            });
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to load courses';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const refreshCourses = () => {
        fetchCourses();
    };

    return {
        courses,
        loading,
        error,
        pagination,
        refreshCourses,
    };
};

import { createContext, useState, useContext } from 'react';

const CourseContext = createContext();

export const useCourseContext = () => {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error('useCourseContext must be used within CourseProvider');
    }
    return context;
};

export const CourseProvider = ({ children }) => {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        level: '',
        sort: 'newest',
    });

    const updateFilters = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            category: '',
            level: '',
            sort: 'newest',
        });
    };

    const value = {
        selectedCourse,
        setSelectedCourse,
        filters,
        updateFilters,
        clearFilters,
    };

    return (
        <CourseContext.Provider value={value}>
            {children}
        </CourseContext.Provider>
    );
};
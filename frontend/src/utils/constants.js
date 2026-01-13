export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const COURSE_LEVELS = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
    ALL: 'all',
};

export const USER_ROLES = {
    STUDENT: 'student',
    TRAINER: 'trainer',
    ADMIN: 'admin',
};

export const ORDER_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
};

export const COURSE_STATUS = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    SUSPENDED: 'suspended',
};

export const PAYMENT_METHODS = {
    STRIPE: 'stripe',
    RAZORPAY: 'razorpay',
};

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    COURSES: '/courses',
    COURSE_DETAILS: '/courses/:id',
    COURSE_VIEW: '/course/view/:id',
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    SETTINGS: '/settings',
};
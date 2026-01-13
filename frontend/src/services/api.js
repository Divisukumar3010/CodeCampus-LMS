import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If token expired, try to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await axios.post(`${API_URL}/auth/refresh-token`, {
                    refreshToken,
                });

                const { accessToken } = response.data;
                localStorage.setItem('token', accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/update-profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
};

// Course APIs
export const courseAPI = {
    getAll: (params) => api.get('/courses', { params }),
    getById: (id) => api.get(`/courses/${id}`),
    create: (data) => api.post('/courses', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    update: (id, data) => api.put(`/courses/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    delete: (id) => api.delete(`/courses/${id}`),
    addSection: (id, data) => api.post(`/courses/${id}/sections`, data),
    addLesson: (id, sectionId, data) =>
        api.post(`/courses/${id}/sections/${sectionId}/lessons`, data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    getEnrolledStudents: (id) => api.get(`/courses/${id}/students`),
    // Approval endpoints
    getPendingCourses: () => api.get('/courses/admin/pending'),
    approveCourse: (id) => api.put(`/courses/${id}/approve`),
    rejectCourse: (id, data) => api.put(`/courses/${id}/reject`, data),
    getApprovalStatus: (id) => api.get(`/courses/${id}/approval-status`),
};

// Order APIs
export const orderAPI = {
    createSession: (data) => api.post('/orders/create-session', data),
    verifyPayment: (data) => api.post('/orders/verify-payment', data),
    getMyOrders: () => api.get('/orders/my-orders'),
    getById: (id) => api.get(`/orders/${id}`),
    checkPurchase: (courseId) => api.get(`/orders/check/${courseId}`),
};

// Review APIs
export const reviewAPI = {
    create: (data) => api.post('/reviews', data),
    getByCourse: (courseId, params) =>
        api.get(`/reviews/course/${courseId}`, { params }),
    update: (id, data) => api.put(`/reviews/${id}`, data),
    delete: (id) => api.delete(`/reviews/${id}`),
};

// User APIs
export const userAPI = {
    getEnrolledCourses: () => api.get('/enrolled-courses'),
    getProgress: (courseId) => api.get(`/progress/${courseId}`),
    completeLesson: (courseId, data) =>
        api.post(`/progress/${courseId}/complete-lesson`, data),
    getTrainerCourses: () => api.get('/users/trainer/my-courses'),
};

// Admin APIs
export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUserRole: (id, data) => api.put(`/admin/users/${id}/role`, data),
    updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getCourses: (params) => api.get('/admin/courses', { params }),
    approveCourse: (id, data) => api.put(`/admin/courses/${id}/approve`, data),
    suspendCourse: (id) => api.put(`/admin/courses/${id}/suspend`),
    getRevenueByCourse: () => api.get('/admin/revenue/courses'),
    getRevenueByTrainer: () => api.get('/admin/revenue/trainers'),
    createCategory: (data) => api.post('/admin/categories', data),
    getCategories: () => api.get('/admin/categories'),
};

export default api;
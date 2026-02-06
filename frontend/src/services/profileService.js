import api from './api';

const profileService = {
    // Get current user's profile
    getProfile: () => api.get('/users/profile'),

    // Update profile (with optional avatar file)
    updateProfile: (formData) =>
        api.put('/users/profile/update', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    // Delete avatar
    deleteAvatar: () => api.delete('/users/profile/avatar'),

    // Get another user's public profile
    getPublicProfile: (userId) => api.get(`/users/${userId}/profile`),

    // Search users
    searchUsers: (query) => api.get('/users/search', { params: { q: query } }),
};

export default profileService;

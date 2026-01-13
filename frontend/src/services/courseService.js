import api from './api';

class CourseService {
    async getAllCourses(params = {}) {
        const response = await api.get('/courses', { params });
        return response.data;
    }

    async getCourseById(id) {
        const response = await api.get(`/courses/${id}`);
        return response.data;
    }

    async createCourse(courseData) {
        const response = await api.post('/courses', courseData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async updateCourse(id, courseData) {
        const response = await api.put(`/courses/${id}`, courseData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async deleteCourse(id) {
        const response = await api.delete(`/courses/${id}`);
        return response.data;
    }

    async searchCourses(query) {
        const response = await api.get('/courses', {
            params: { search: query },
        });
        return response.data;
    }

    async getCoursesByCategory(categoryId) {
        const response = await api.get('/courses', {
            params: { category: categoryId },
        });
        return response.data;
    }

    async enrollInCourse(courseId) {
        const response = await api.post(`/courses/${courseId}/enroll`);
        return response.data;
    }
}

export default new CourseService();
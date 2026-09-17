import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuth = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await authAPI.getMe();
                setUser(response.data.user);
                setIsAuthenticated(true);
            }
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    }, []);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);
            const { accessToken, refreshToken, user } = response.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(user);
            setIsAuthenticated(true);

            toast.success('Registration successful!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const login = async (credentials) => {
        try {
            const response = await authAPI.login(credentials);
            const { accessToken, refreshToken, user } = response.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(user);
            setIsAuthenticated(true);

            toast.success('Login successful!');
            return { success: true, user };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setIsAuthenticated(false);
            toast.success('Logged out successfully');
        }
    };

    const updateUser = async (userData) => {
        try {
            const response = await authAPI.updateProfile(userData);
            setUser(response.data.user);
            toast.success('Profile updated successfully');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Update failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const loginWithGoogle = async (tokenData) => {
        try {
            const response = await authAPI.googleAuth(tokenData);
            const { accessToken, refreshToken, user } = response.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            setUser(user);
            setIsAuthenticated(true);

            toast.success(`Welcome to CodeCampus, ${user.name}!`);
            return { success: true, user };
        } catch (error) {
            const message = error.response?.data?.message || 'Google authentication failed';
            toast.error(message);
            return { success: false, message };
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        register,
        login,
        loginWithGoogle,
        logout,
        updateUser,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
import { createContext, useContext, useState, useCallback } from 'react';

const AuthModalContext = createContext();

export const useAuthModal = () => {
    const context = useContext(AuthModalContext);
    if (!context) {
        throw new Error('useAuthModal must be used within an AuthModalProvider');
    }
    return context;
};

export const AuthModalProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot-password'

    const openModal = useCallback((initialView = 'login') => {
        setView(initialView);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
    }, []);

    const switchView = useCallback((nextView) => {
        setView(nextView);
    }, []);

    const value = {
        isOpen,
        view,
        openModal,
        closeModal,
        switchView,
    };

    return (
        <AuthModalContext.Provider value={value}>
            {children}
        </AuthModalContext.Provider>
    );
};

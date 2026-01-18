import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Load saved theme from localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setIsDarkMode(savedTheme === 'dark');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDark);
        }
    }, []);

    // Update HTML element and localStorage
    useEffect(() => {
        const theme = isDarkMode ? 'dark' : 'light';
        localStorage.setItem('theme', theme);

        // Update HTML element
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            document.documentElement.style.backgroundColor = '#0f172a';
            document.body.style.backgroundColor = '#0f172a';
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.backgroundColor = '#ffffff';
            document.body.style.backgroundColor = '#ffffff';
        }
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
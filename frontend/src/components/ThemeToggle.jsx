import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-16 h-8 rounded-full p-1 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 border border-gray-300 dark:border-gray-600 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 group"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
            aria-label="Toggle theme"
        >
            {/* Track background */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-purple-900 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
            </div>
            
            {/* Icons */}
            <div className="relative w-full h-full flex items-center justify-between px-1">
                {/* Sun */}
                <svg className={`w-4 h-4 text-yellow-500 transition-all duration-300 ${isDarkMode ? 'opacity-40 scale-75' : 'opacity-100 scale-100'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a1 1 0 11-1.414 1.414l2.12 2.12a1 1 0 001.414-1.414zM2.05 6.464l2.12 2.12a1 1 0 11-1.414 1.414L.636 7.878a1 1 0 111.414-1.414zm11.313-1.414l2.12-2.12a1 1 0 111.414 1.414l-2.12 2.12a1 1 0 11-1.414-1.414zM2.05 13.536l2.12-2.12a1 1 0 111.414 1.414l-2.12 2.12a1 1 0 11-1.414-1.414z" clipRule="evenodd" />
                </svg>
                
                {/* Moon */}
                <svg className={`w-4 h-4 text-blue-400 transition-all duration-300 ${isDarkMode ? 'opacity-100 scale-100' : 'opacity-40 scale-75'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
            </div>
            
            {/* Slider knob */}
            <div className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 flex items-center justify-center ${isDarkMode ? 'translate-x-8' : 'translate-x-0'}`}>
                {isDarkMode ? (
                    <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                ) : (
                    <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l-2.12-2.12a1 1 0 11-1.414 1.414l2.12 2.12a1 1 0 001.414-1.414zM2.05 6.464l2.12 2.12a1 1 0 11-1.414 1.414L.636 7.878a1 1 0 111.414-1.414zm11.313-1.414l2.12-2.12a1 1 0 111.414 1.414l-2.12 2.12a1 1 0 11-1.414-1.414zM2.05 13.536l2.12-2.12a1 1 0 111.414 1.414l-2.12 2.12a1 1 0 11-1.414-1.414z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
        </button>
    );
};
export default ThemeToggle;
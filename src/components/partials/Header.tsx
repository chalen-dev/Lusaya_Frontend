import { useTheme } from '../../contexts/ThemeContext';
import {Icon} from "./Icon.tsx";

export const Header = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 px-6 sm:px-8 py-3 flex justify-between items-center h-[70px] sticky top-0 z-10 shadow-sm">
            {/* Logo / App Name */}
            <div className="flex items-center space-x-2">
                <Icon
                    text="D"
                    size={1}
                />
                <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
            </div>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="relative w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                aria-label="Toggle theme"
            >
            <span
                className={`absolute top-1 left-1 w-4 h-4  rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                    theme === 'dark' ? 'translate-x-6' : ''
                }`}
            >
                <span className="text-xs text-gray-600 dark:text-gray-300">
                    {theme === 'light' ? '🌙' : '☀️'}
                </span>
            </span>
            </button>
        </header>
    );
};
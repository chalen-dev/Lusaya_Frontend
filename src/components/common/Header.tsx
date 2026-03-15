// components/common/Header.tsx
import { useTheme } from '../../contexts/ThemeContext';
import { useHeaderTitle } from '../../contexts/HeaderTitleContext';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from "./Icon.tsx";
import { APP_INITIALS } from "../../utils/constants.ts";
import { NotificationButton } from './NotificationButton';

type Props = {
    includeIcon?: boolean;
    iconText?: string;
    showBackButton?: boolean;
    onBack?: () => void;
};

export const Header = ({
                           includeIcon = false,
                           iconText = APP_INITIALS,
                           showBackButton = false,
                           onBack,
                       }: Props) => {
    const { theme, toggleTheme } = useTheme();
    const { title } = useHeaderTitle();
    const { user } = useAuth();

    return (
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-800 px-6 sm:px-8 py-3 flex justify-between items-center h-[70px] sticky top-0 z-30 shadow-sm">
            <div className={`flex items-center ${includeIcon ? 'space-x-2' : ''}`}>
                {showBackButton && (
                    <button
                        onClick={onBack}
                        className="mr-3 p-1.5 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Go back"
                    >
                        <i className="fas fa-arrow-left text-lg" />
                    </button>
                )}
                {includeIcon && <Icon text={iconText} size={1} />}
                <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
                {user && <NotificationButton />}
                <button
                    onClick={toggleTheme}
                    className="relative w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    aria-label="Toggle theme"
                >
                    <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                            theme === 'dark' ? 'translate-x-6' : ''
                        }`}
                    >
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                            {theme === 'light' ? '☀️' : '🌙'}
                        </span>
                    </span>
                </button>
            </div>
        </header>
    );
};
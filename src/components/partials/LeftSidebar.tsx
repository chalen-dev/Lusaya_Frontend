import { Link, useNavigate } from "react-router-dom";
import { APP_NAME } from "../../config/constants";
import {showConfirmation, showToast} from "../../config/swalHelpers.ts";

type LeftSidebarProps = {} & React.HTMLAttributes<HTMLElement>;

export function LeftSidebar({ ...rest }: LeftSidebarProps) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const confirmed = await showConfirmation(
          'Log out',
          'Are you sure you\'re going to log out?',
            'info',
            'Yes'
        );

        if (confirmed){
            showToast('Logged out.', 'info');
            navigate('/');
        }
    }
    return (
        <aside
            {...rest}
            className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col h-screen"
        >
            <div className="flex items-center space-x-2 mb-8">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {APP_NAME.charAt(0)}
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                    {APP_NAME}
                </h1>
            </div>

            <nav className="flex flex-col space-y-1 flex-1">
                <Link
                    to="/dashboard"
                    className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                    Dashboard
                </Link>
                <Link
                    to="/dashboard"
                    className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                    Users
                </Link>
                <Link
                    to="/dashboard"
                    className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                    Orders
                </Link>
                <Link
                    to="/dashboard"
                    className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary dark:hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                >
                    Settings
                </Link>
            </nav>

            <button
                onClick={handleLogout}
                className="w-full px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary dark:hover:text-primary hover:border-primary transition-all duration-200 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            >
                <span>Logout</span>
                <span className="text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors">→</span>
            </button>
        </aside>
    );
}
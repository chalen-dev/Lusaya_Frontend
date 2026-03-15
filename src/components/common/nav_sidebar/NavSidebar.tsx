import { useNavigate } from "react-router-dom";
import { APP_NAME } from "../../../utils/constants.ts";
import { showConfirmation, showToast } from "../../../utils/swalHelpers.ts";
import {useAuth} from "../../../contexts/AuthContext.tsx";
import {NavLink} from "./NavLink.tsx";
import profileIcon from "../../../assets/profile-icon.jpg";

type LeftSidebarProps = {} & React.HTMLAttributes<HTMLElement>;

export function NavSidebar({ ...rest }: LeftSidebarProps) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const isAdmin = user?.role === 'admin';
    const isCashier = user?.role === 'cashier';
    const isCustomer = user?.role === 'customer';
    const isCashierAndAdmin = user?.role === 'admin' || user?.role === 'cashier';

    const displayName = user?.name || user?.email || 'User';



    const handleLogout = async () => {
        const confirmed = await showConfirmation(
            'Log out',
            'Are you sure you want to log out?',
            'info',
            'Yes'
        );
        if (confirmed) {
            showToast('Logged out.', 'info');
            await logout();
            navigate('/', { replace: true });
        }
    };

    return (
        <aside
            {...rest}
            className="fixed top-0 left-0 w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col shadow-sm overflow-y-auto"
        >
            {/* Logo / App name */}
            <div className="flex items-center space-x-2 mb-8">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {APP_NAME.charAt(0)}
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                    {APP_NAME}
                </h1>
            </div>

            <nav className="flex flex-col flex-1">
                <div className="space-y-1 pb-4 border-b border-gray-100 dark:border-gray-800">

                    {isAdmin && (
                        <>
                            <NavLink to="/dashboard" icon="fa-chart-line">
                                Dashboard
                            </NavLink>
                        </>
                    )}

                    {( isCustomer &&
                        <>
                            <NavLink to="/menuOrder" icon="fa-cart-shopping">
                                Place Order
                            </NavLink>
                            <NavLink to="/myOrders" icon="fa-clock-rotate-left">
                                My Orders
                            </NavLink>
                        </>
                    )}

                    {isCashierAndAdmin && (
                        <>
                            <NavLink to="/ordersList" icon="fa-cart-shopping">
                                Orders
                            </NavLink>
                            <NavLink to="/inventory" icon="fa-boxes">
                                Inventory
                            </NavLink>
                            <NavLink to="/menuList" icon="fa-utensils">
                                Menu Items
                            </NavLink>
                        </>
                    )}

                    {(isCashier && (
                        <NavLink
                            to="/pos"
                            icon="fa-cash-register"
                            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                e.preventDefault(); // Stop default navigation
                                showConfirmation(
                                    'Go to POS',
                                    'Are you sure you want to access the Point of Sale?',
                                    'question'
                                ).then((confirmed) => {
                                    if (confirmed) {
                                        navigate('/pos'); // Navigate after confirmation
                                    }
                                });
                            }}
                        >
                            Point of Sale
                        </NavLink>
                    ))}

                    {isAdmin && (
                        <>
                            <NavLink to="/userManagement" icon="fa-users">
                                Users
                            </NavLink>
                        </>
                    )}
                </div>
            </nav>

            {/* User details */}
            {user && (
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <img
                            src={profileIcon}
                            alt="Profile"
                            className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                {displayName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                {user.role}
                            </p>
                        </div>
                    </div>
                </div>
            )}


            {/* Logout button */}
            <button
                onClick={handleLogout}
                className="mt-4 w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary dark:hover:text-primary hover:border-primary transition-all duration-200 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900 group"
            >
                <span className="flex items-center gap-2">Logout</span>
                <i className="fas fa-sign-out-alt" aria-hidden="true" />
            </button>
        </aside>
    );
}
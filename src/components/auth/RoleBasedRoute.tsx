import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {LoadingSpinner} from "../common/loading/LoadingSpinner.tsx";

interface RoleBasedRouteProps {
    allowedRoles: string | string[]; // e.g., 'admin' or ['admin', 'cashier']
    fallbackPath?: string;            // where to redirect if role check fails
}

export const RoleBasedRoute = ({ allowedRoles, fallbackPath = '/unauthorized' }: RoleBasedRouteProps) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading)
        return <LoadingSpinner size={20} />;


    if (!user) {
        // Not logged in -> redirect to unauthorized (or login)
        return <Navigate to={fallbackPath} state={{ from: location }} replace />;
    }

    const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!rolesArray.includes(user.role)) {
        // Role not allowed -> redirect to unauthorized, optionally pass reason
        return <Navigate to={fallbackPath} state={{ from: location, reason: 'role' }} replace />;
    }

    // Authenticated and role allowed → render child routes
    return <Outlet />;
};
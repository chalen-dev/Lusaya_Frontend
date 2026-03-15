// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type {LoginCredentials, User} from '../components/auth/authTypes.ts';
import { getCurrentUser, logout as logoutService } from '../components/auth/authService.ts';
import api from '../services/api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: { name: string; password: string }) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Set default header (api interceptor already does this, but ensure it's set)
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const userData = await getCurrentUser();
                    setUser(userData);
                } catch (error) {
                    console.error('Failed to fetch user', error);
                    localStorage.removeItem('token');
                    delete api.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        const response = await api.post<{ access_token: string; user: User }>('/login', credentials);
        localStorage.setItem('token', response.data.access_token);
        setUser(response.data.user);
    };

    const logout = async () => {
        try {
            await logoutService();
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
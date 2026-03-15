import { useEffect, useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Text } from '../common/input/Text';
import { Icon } from '../common/Icon';
import { Password } from '../common/input/Password';
import { useHeaderTitle } from '../../contexts/HeaderTitleContext';
import { showToast } from '../../utils/swalHelpers';
import axios from 'axios';
import { LoadingSpinner } from '../common/loading/LoadingSpinner';

interface LoginFormProps {
    headerTitle: string;           // Title shown in the header
    allowedRoles: string[];        // e.g., ['admin', 'cashier'] or ['customer']
    redirectPath: string | ((role: string) => string); // e.g., '/dashboard' or role => role === 'admin' ? '/dashboard' : '/ordersList'
    blockedMessage: string;        // Toast message when user role is not allowed
    invalidCredentialsMessage?: string;
}

export function LoginForm({
                              headerTitle,
                              allowedRoles,
                              redirectPath,
                              blockedMessage,
                              invalidCredentialsMessage = 'Invalid credentials'
                          }: LoginFormProps) {
    const navigate = useNavigate();
    const { user, login, logout } = useAuth();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [nameError, setNameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setTitle } = useHeaderTitle();

    useEffect(() => {
        setTitle(headerTitle);
    }, [headerTitle, setTitle]);

    const handleApiError = (error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.data?.errors) {
            const errors = error.response.data.errors;
            setNameError(errors.name?.[0] ?? '');
            setPasswordError(errors.password?.[0] ?? '');
        } else {
            setNameError(invalidCredentialsMessage);
        }
    };

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setNameError('');
        setPasswordError('');

        if (!name.trim()) {
            setNameError('Name is required.');
            return;
        }
        if (!password.trim()) {
            setPasswordError('Password is required.');
            return;
        }

        setLoading(true);
        try {
            await login({ name, password });
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            if (allowedRoles.includes(user.role) && !(user.role === 'customer' && user.is_POS)) {
                const path = typeof redirectPath === 'function'
                    ? redirectPath(user.role)
                    : redirectPath;
                navigate(path, { replace: true });
            } else {
                logout();
                showToast(blockedMessage, 'error');
            }
        }
    }, [user, allowedRoles, redirectPath, blockedMessage, navigate, logout]);

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-70px)] p-4 bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-md shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col items-center mb-6">
                    <Icon size={2} />
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Welcome Back</h1>
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <Text
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        label="Name or Email"
                        placeholder="johndoe"
                        error={nameError}
                        disabled={loading}
                    />
                    <Password
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        label="Password"
                        placeholder="*******"
                        error={passwordError}
                        disabled={loading}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all active:scale-[0.98] shadow-sm hover:shadow-md mt-4"
                    >
                        {loading ? (
                            <div className="flex justify-center items-center gap-3">
                                <LoadingSpinner size={20} />
                                <span>Signing in...</span>
                            </div>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
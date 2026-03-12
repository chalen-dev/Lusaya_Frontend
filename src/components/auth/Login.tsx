// components/auth/Login.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Text } from '../common/input/Text';
import { Icon } from '../common/Icon.tsx';
import { Password } from '../common/input/Password';
import { useHeaderTitle } from '../../contexts/HeaderTitleContext';
import { APP_NAME } from '../../utils/constants';
import { showToast } from '../../utils/swalHelpers';
import axios from 'axios';
import { useState, type SyntheticEvent } from 'react';
import {LoadingSpinner} from "../common/loading/LoadingSpinner.tsx";

export function Login() {
    const navigate = useNavigate();
    const { user, login } = useAuth();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [nameError, setNameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setTitle } = useHeaderTitle();

    useEffect(() => {
        setTitle(APP_NAME);
    }, [setTitle]);

    // Redirect to dashboard once user is logged in
    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                navigate('/dashboard', { replace: true });
            } else if (user.role === 'cashier') {
                navigate('/pos', { replace: true });
            } else if (user.role === 'customer') {
                navigate('/order', { replace: true });
            }
        }
    }, [user, navigate]);

    const handleApiError = (error: unknown) => {
        if (axios.isAxiosError(error) && error.response?.data?.errors) {
            const errors = error.response.data.errors;
            setNameError(errors.name?.[0] ?? '');
            setPasswordError(errors.password?.[0] ?? '');
        } else {
            alert('Login failed. Please try again.');
        }
    };

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Reset errors
        setNameError('');
        setPasswordError('');

        // Validation
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
            showToast(`Welcome, ${name}!`);
            // Navigation happens in the useEffect above
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[calc(100vh-70px)] p-4 bg-gray-50 dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-md shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col items-center mb-6">
                    <Icon size={2} />
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Welcome Back</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} noValidate>
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

                    <div className="flex justify-end mb-6">
                        <button
                            type="button"
                            className="text-sm text-primary hover:text-primary-hover transition-colors"
                            onClick={() => navigate('/forgot-password')}
                        >
                            Forgot password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-primary hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
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
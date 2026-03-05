import { useNavigate } from "react-router-dom";
import {useEffect, useState} from "react";
import { Header } from "../components/partials/Header";
import { Text } from "../components/input/Text";
import {Icon} from "../components/partials/Icon.tsx";
import {Password} from "../components/input/Password.tsx";
import {useHeaderTitle} from "../contexts/HeaderTitleContext.tsx";
import {APP_NAME} from "../config/constants.ts";

export function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setTitle } = useHeaderTitle();

    useEffect(() => {
        setTitle(APP_NAME);
    }, [setTitle]);
    return (
        <>
            <Header />
            <div className="flex justify-center items-center min-h-[calc(100vh-70px)] p-4 bg-gray-50 dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 w-full max-w-md shadow-lg border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col items-center mb-6">
                        <Icon size={2}/>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Welcome Back</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
                    </div>

                    <Text
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        label="Username or Email"
                        placeholder="johndoe"
                    />
                    <Password
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        label="Password"
                        placeholder="*******"
                    />

                    <div className="flex justify-end mb-6">
                        <button className="text-sm text-primary hover:text-primary-hover transition-colors">
                            Forgot password?
                        </button>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
                    >
                        Sign In
                    </button>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                        Don't have an account?{" "}
                        <button className="text-primary hover:text-primary-hover font-medium">
                            Sign up
                        </button>
                    </p>
                </div>
            </div>
        </>
    );
}
import { useNavigate } from "react-router-dom";
import "./Login.css";

export function Login() {
    const navigate = useNavigate();

    return (
        <div className="login-page">
            {/* Left side - Branding / Illustration */}
            <div className="login-brand">
                <div className="brand-content">
                    <h1 className="brand-title">Welcome Back</h1>
                    <p className="brand-subtitle">
                        Sign in to access your dashboard, manage your account, and more.
                    </p>
                    <div className="brand-features">
                        <div className="feature">
                            <span className="feature-icon">🚀</span>
                            <span>Fast and secure</span>
                        </div>
                        <div className="feature">
                            <span className="feature-icon">📊</span>
                            <span>Real-time analytics</span>
                        </div>
                        <div className="feature">
                            <span className="feature-icon">🔒</span>
                            <span>Enterprise-grade security</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div className="login-form-container">
                <div className="form-card">
                    <h2 className="form-title">Sign In</h2>
                    <p className="form-subtitle">Enter your credentials to continue</p>

                    <form className="login-form">
                        <div className="input-group">
                            <label htmlFor="email">Email address</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="name@example.com"
                                className="input-field"
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                className="input-field"
                            />
                        </div>

                        <div className="form-options">
                            <label className="checkbox">
                                <input type="checkbox" /> Remember me
                            </label>
                            <a href="#" className="forgot-link">Forgot password?</a>
                        </div>

                        <button
                            type="button"
                            className="login-button"
                            onClick={() => navigate('/dashboard')}
                        >
                            Sign In
                        </button>

                        <p className="signup-prompt">
                            Don't have an account? <a href="#">Create one</a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
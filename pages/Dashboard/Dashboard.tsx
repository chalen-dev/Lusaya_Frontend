import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

export function Dashboard() {
    const navigate = useNavigate();

    return (
        <div className="dashboard">
            {/* Top Navigation */}
            <nav className="dashboard-nav">
                <div className="nav-left">
                    <h1 className="nav-logo">MyApp</h1>
                </div>
                <div className="nav-right">
                    <div className="user-menu">
                        <span className="user-name">John Doe</span>
                        <div className="user-avatar">JD</div>
                    </div>
                    <button className="logout-btn" onClick={() => navigate('/')}>
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Welcome Section */}
                <section className="welcome-section">
                    <h2 className="welcome-title">Welcome back, John! 👋</h2>
                    <p className="welcome-text">
                        Here's what's happening with your account today.
                    </p>
                </section>

                {/* Stats Grid */}
                <section className="stats-section">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon">📊</div>
                            <div className="stat-content">
                                <h3 className="stat-label">Total Revenue</h3>
                                <p className="stat-value">$54,239</p>
                                <span className="stat-trend positive">↑ 12%</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">👥</div>
                            <div className="stat-content">
                                <h3 className="stat-label">Active Users</h3>
                                <p className="stat-value">2,345</p>
                                <span className="stat-trend positive">↑ 8%</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">📝</div>
                            <div className="stat-content">
                                <h3 className="stat-label">Open Tasks</h3>
                                <p className="stat-value">23</p>
                                <span className="stat-trend negative">↓ 3%</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon">⏳</div>
                            <div className="stat-content">
                                <h3 className="stat-label">Avg. Session</h3>
                                <p className="stat-value">4m 32s</p>
                                <span className="stat-trend positive">↑ 5%</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Two Column Layout */}
                <section className="content-grid">
                    {/* Recent Activity */}
                    <div className="card activity-card">
                        <h3 className="card-title">Recent Activity</h3>
                        <ul className="activity-list">
                            <li className="activity-item">
                                <span className="activity-dot blue"></span>
                                <div className="activity-details">
                                    <p className="activity-text">New user registered</p>
                                    <span className="activity-time">2 minutes ago</span>
                                </div>
                            </li>
                            <li className="activity-item">
                                <span className="activity-dot green"></span>
                                <div className="activity-details">
                                    <p className="activity-text">Payment received from Jane</p>
                                    <span className="activity-time">1 hour ago</span>
                                </div>
                            </li>
                            <li className="activity-item">
                                <span className="activity-dot orange"></span>
                                <div className="activity-details">
                                    <p className="activity-text">Server backup completed</p>
                                    <span className="activity-time">3 hours ago</span>
                                </div>
                            </li>
                            <li className="activity-item">
                                <span className="activity-dot purple"></span>
                                <div className="activity-details">
                                    <p className="activity-text">New comment on post</p>
                                    <span className="activity-time">5 hours ago</span>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Actions / Chart Placeholder */}
                    <div className="card quick-actions-card">
                        <h3 className="card-title">Quick Actions</h3>
                        <div className="actions-grid">
                            <button className="action-btn">
                                <span className="action-icon">📤</span>
                                Export Data
                            </button>
                            <button className="action-btn">
                                <span className="action-icon">📋</span>
                                Create Report
                            </button>
                            <button className="action-btn">
                                <span className="action-icon">⚙️</span>
                                Settings
                            </button>
                            <button className="action-btn">
                                <span className="action-icon">👤</span>
                                Manage Users
                            </button>
                        </div>
                        <div className="chart-placeholder">
                            <p>📈 Chart placeholder</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
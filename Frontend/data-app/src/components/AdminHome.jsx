import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/AdminHome.css';
import { FaSignOutAlt, FaBell, FaSync } from "react-icons/fa";
import Sidebar from './Sidebar';

const AdminHome = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemMasterOpen, setSystemMasterOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    dataEntries: 0,
    loading: true
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showActivitiesDropdown, setShowActivitiesDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/admin');
  };

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      // Fetch stats from your backend
      const statsResponse = await fetch('http://127.0.0.1:5000/admin-stats');
      const statsData = await statsResponse.json();
      
      // Fetch recent activities
      const activitiesResponse = await fetch('http://127.0.0.1:5000/recent-activities');
      const activitiesData = await activitiesResponse.json();

      setStats({
        totalUsers: statsData.data.totalUsers || 0,
        activeToday: statsData.data.activeToday || 0,
        dataEntries: statsData.data.dataEntries || 0,
        loading: false
      });

      setRecentActivities(activitiesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setStats(prev => ({ ...prev, loading: false }));
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
  };

  const toggleActivitiesDropdown = () => {
    setShowActivitiesDropdown(!showActivitiesDropdown);
  };

  useEffect(() => {
    fetchStats();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date) => date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="admin-home">
      <Sidebar 
        currentTime={currentTime}
        systemMasterOpen={systemMasterOpen}
        setSystemMasterOpen={setSystemMasterOpen}
        reportsOpen={reportsOpen}
        setReportsOpen={setReportsOpen}
      />

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-date">
            {formatDate(currentTime)}
          </div>
          <div className="topbar-actions">
            <div className="notification-dropdown">
              <button 
                className="admin-notification-btn"
                onClick={toggleActivitiesDropdown}
              >
                <FaBell />
                {recentActivities.length > 0 && (
                  <span className="admin-notification-badge">
                    {recentActivities.length}
                  </span>
                )}
              </button>
              {showActivitiesDropdown && (
                <div className="notification-dropdown-content">
                  <div className="notification-dropdown-header">
                    <h4>Recent Activities</h4>
                    <small>{recentActivities.length} new activities</small>
                  </div>
                  <div className="notification-dropdown-body">
                    {recentActivities.length > 0 ? (
                      recentActivities.slice(0, 5).map((activity, index) => (
                        <div className="notification-item" key={index}>
                          <div className={`notification-icon ${activity.type}`}>
                            {activity.type === 'success' ? '✓' : 
                             activity.type === 'warning' ? '!' : 'i'}
                          </div>
                          <div className="notification-content">
                            <p>{activity.message}</p>
                            <small>
                              {formatTime(new Date(activity.timestamp))} • {activity.timeAgo}
                            </small>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="notification-empty">
                        No recent activities
                      </div>
                    )}
                  </div>
                  <div className="notification-dropdown-footer">
                    <button 
                      className="view-all-btn"
                      onClick={() => {
                        setShowActivitiesDropdown(false);
                        // Scroll to activities section
                        document.querySelector('.recent-activity')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      View All Activities
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="user-info">
              <div className="user-avatar">AD</div>
              <span className="user-name">Admin User</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt className="logout-icon" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <div className="content-area">
          <div className="welcome-card">
            <div className="welcome-header">
              <h1>Welcome to MediRay Admin Dashboard</h1>
              <div className="live-status">
                <span className="live-dot"></span>
                <span>LIVE</span>
                <button 
                  className="refresh-btn" 
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <FaSync className={refreshing ? "spinning" : ""} />
                  Refresh
                </button>
              </div>
            </div>
            <p>Real-time system monitoring and management</p>
            <div className="welcome-stats">
              <div className="welcome-stat">
                <span>Last Login:</span>
                <strong>Today, {formatTime(currentTime)}</strong>
              </div>
              <div className="welcome-stat">
                <span>System Uptime:</span>
                <strong className="status-active">99.98%</strong>
              </div>
              <div className="welcome-stat">
                <span>Current Time:</span>
                <strong>{currentTime.toLocaleTimeString()}</strong>
              </div>
            </div>
          </div>

          {stats.loading ? (
            <div className="loading-indicator">Loading statistics...</div>
          ) : (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Users</h3>
                  <p>{stats.totalUsers.toLocaleString()}</p>
                  <div className="stat-update">Updated: {formatTime(currentTime)}</div>
                </div>
                <div className="stat-card">
                  <h3>Active Today</h3>
                  <p>{stats.activeToday.toLocaleString()}</p>
                  <div className="stat-update">Updated: {formatTime(currentTime)}</div>
                </div>
                <div className="stat-card">
                  <h3>Data Entries</h3>
                  <p>{stats.dataEntries.toLocaleString()}</p>
                  <div className="stat-update">Updated: {formatTime(currentTime)}</div>
                </div>
              </div>

              <div className="recent-activity">
                <h2>Recent Activity Log</h2>
                <div className="activity-list">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div className="activity-item" key={index}>
                        <div className={`activity-icon ${activity.type}`}>
                          {activity.type === 'success' ? '✓' : 
                           activity.type === 'warning' ? '!' : 'i'}
                        </div>
                        <div className="activity-content">
                          <p>{activity.message}</p>
                          <small>
                            {formatTime(new Date(activity.timestamp))} • {activity.timeAgo}
                          </small>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-activities">No recent activities found</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
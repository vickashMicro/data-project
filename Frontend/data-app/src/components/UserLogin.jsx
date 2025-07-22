import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UserLogin.css';
import logo from "../assets/logo.jfif";

const UserLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await fetch("http://127.0.0.1:5000/user-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (result.success) {
      localStorage.setItem("userToken", result.token);
      localStorage.setItem("userName", result.name);
      localStorage.setItem("userCode", result.userCode); // Make sure this is stored
      navigate("/home");
    } else {
      alert(result.message || "Invalid credentials");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Cannot connect to server. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
  const handleAdminLogin = () => {
    navigate('/admin');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  // Load remembered username if exists
  React.useEffect(() => {
    const rememberedUser = localStorage.getItem("rememberedUser");
    if (rememberedUser) {
      setUsername(rememberedUser);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="user-login-wrapper">
      <header className="user-login-header">
        <div className="user-header-content">
          <img src={logo} alt="Company Logo" className="user-header-logo" />
          <b><h1 className="user-system-title">DataCheck System User Login</h1></b>
          <button 
            className="admin-login-switch-btn"
            onClick={handleAdminLogin}
          >
            Admin Login
          </button>
        </div>
      </header>

      <div className="user-login-container">
        <div className="user-login-card">
          <div className="user-login-intro">
            <h2 className="user-login-heading">User Portal</h2>
            <p className="user-login-subheading">Sign in to continue</p>
          </div>

          {error && (
            <div className="user-login-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="user-login-form">
            <div className="user-input-field">
              <label htmlFor="user-username" className="user-input-label">Username</label>
              <input
                id="user-username"
                type="text"
                className="user-text-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="user-input-field">
              <label htmlFor="user-password" className="user-input-label">Password</label>
              <input
                id="user-password"
                type="password"
                className="user-text-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="user-options-container">
              <label className="user-remember-option">
                <input 
                  type="checkbox" 
                  className="user-remember-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <span 
                className="user-forgot-password-link"
                onClick={handleForgotPassword}
                style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}
              >
                Forgot password?
              </span>
            </div>

            <button 
              type="submit" 
              className="user-login-btn" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span className="sr-only">Signing in...</span>
                </>
              ) : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
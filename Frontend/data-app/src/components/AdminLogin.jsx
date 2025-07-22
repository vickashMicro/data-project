import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminLogin.css';    
import logo from "../assets/logo.jfif";

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    const response = await fetch("http://127.0.0.1:5000/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (result.success) {
      navigate("/admin-home"); // ✅ Redirect
    } else {
      alert("❌ Invalid credentials");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Server error, please try again later.");
  }

  setIsLoading(false);
};


  const goToUserLogin = () => {
    navigate('/');
  };

  return (
    <div className="admin-login-page">
      <header className="page-header">
        <div className="header-content">
          <img src={logo} alt="Logo" className="header-logo" />
          <h1>DataCheck System Admin Login</h1>
          <button className="user-login-button" onClick={goToUserLogin}>
            User Login
          </button>
        </div>
      </header>

      <div className="admin-login-container">
        <div className="admin-login-card">
          <div className="login-header">
            <h2>Admin Portal</h2>
            <p>Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="options-row">
              <label className="remember-me">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" className="forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="login-footer">
            <p>New to DataCheck? <a href="#">Contact administrator</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;

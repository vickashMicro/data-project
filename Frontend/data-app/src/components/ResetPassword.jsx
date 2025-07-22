import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../styles/UserLogin.css';
import logo from '../assets/logo.jfif';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) setError('Invalid or missing token.');
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('✅ ' + data.message + ' Redirecting to login...');
        setError('');
        setTimeout(() => navigate('/'), 3000);
      } else {
        setError(data.message || 'Reset failed.');
      }
    } catch {
      setError('Server error.');
    }
  };

  return (
    <div className="user-login-wrapper">
      <header className="user-login-header">
        <div className="user-header-content">
          <img src={logo} alt="Company Logo" className="user-header-logo" />
          <b><h1 className="user-system-title">Reset Password</h1></b>
        </div>
      </header>

      <div className="user-login-container">
        <div className="user-login-card">
          <div className="user-login-intro">
            <h2 className="user-login-heading">Enter New Password</h2>
            <p className="user-login-subheading">Please provide a new password for your account</p>
          </div>

          {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}
          {message && <p style={{ color: 'green', fontSize: '14px', marginBottom: '10px' }}>{message}</p>}

          {!error && (
            <form onSubmit={handleSubmit} className="user-login-form">
              <div className="user-input-field">
                <label className="user-input-label">New Password</label>
                <input
                  type="password"
                  className="user-text-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="user-input-field">
                <label className="user-input-label">Confirm Password</label>
                <input
                  type="password"
                  className="user-text-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="user-login-btn">
                Reset Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

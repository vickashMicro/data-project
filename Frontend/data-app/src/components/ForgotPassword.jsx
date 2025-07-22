import React, { useState } from 'react';
import '../styles/UserLogin.css';
import logo from '../assets/logo.jfif';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setMessage(data.message);
    } catch {
      setMessage('Failed to send reset email');
    }

    setLoading(false);
  };

  return (
    <div className="user-login-wrapper">
      <header className="user-login-header">
        <div className="user-header-content">
          <img src={logo} alt="Company Logo" className="user-header-logo" />
          <b><h1 className="user-system-title">Forgot Password</h1></b>
        </div>
      </header>

      <div className="user-login-container">
        <div className="user-login-card">
          <div className="user-login-intro">
            <h2 className="user-login-heading">Reset Access</h2>
            <p className="user-login-subheading">Enter your email to receive a reset link</p>
          </div>

          <form onSubmit={handleSubmit} className="user-login-form">
            <div className="user-input-field">
              <label htmlFor="forgot-email" className="user-input-label">Email</label>
              <input
                id="forgot-email"
                type="email"
                className="user-text-input"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="user-login-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Email'}
            </button>

            {message && (
              <p style={{ marginTop: '1rem', fontSize: '14px', color: '#2c7a4f' }}>{message}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

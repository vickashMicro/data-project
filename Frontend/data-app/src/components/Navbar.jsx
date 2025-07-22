import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaHome, FaDatabase, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/UserHome.css';

const Navbar = ({ activeTab, setActiveTab }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName");

  // Simulate network status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setIsOnline(Math.random() > 0.1); // Randomly toggle online/offline
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("activeTab");
    navigate('/');
  };

  return (
    <header className="user-home-navbar">
      <div className="user-home-navbar-left">
        <button
          className={`user-home-nav-button ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <FaHome className="nav-icon" />
          <b>Home</b>
        </button>

        <div className="user-home-dropdown" ref={dropdownRef}>
          <button
            className={`user-home-nav-button ${activeTab.startsWith('data-') ? 'active' : ''}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <FaDatabase className="nav-icon" />
            <b>Data Entry</b>
            {dropdownOpen ? <FaChevronUp className="chevron" /> : <FaChevronDown className="chevron" />}
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                className="user-home-dropdown-menu"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  className={`user-home-dropdown-item ${activeTab === 'data-format1' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('data-format1');
                    setDropdownOpen(false);
                  }}
                >
                  Data Entry Sheet - Format 1
                </button>
                <button
                  className={`user-home-dropdown-item ${activeTab === 'data-format2' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('data-format2');
                    setDropdownOpen(false);
                  }}
                >
                  Data Entry Sheet - Format 2
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      
      <div className="user-home-navbar-right">
        <div className="user-info-wrapper">
          <span className="user-name-display">👤 {userName}</span>
          <div className={`user-home-status ${isOnline ? 'online' : 'offline'}`}>
            <div className="status-indicator"></div>
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>
        <button className="user-home-logout" title="Logout" onClick={handleLogout}>
          <FaSignOutAlt />
        </button>
      </div>

    </header>
  );
};

export default Navbar;

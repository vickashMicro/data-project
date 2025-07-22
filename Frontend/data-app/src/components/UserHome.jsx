import React, { useState, useEffect } from 'react';
import '../styles/UserHome.css';
import globeImage from '../assets/globe.jpg';
import FormatOne from './FormatOne';
import FormatTwo from './FormatTwo';
import Navbar from './Navbar';

const UserHome = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'home';
  });

  const [loggedInUserCode, setLoggedInUserCode] = useState('');

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
    // Get userCode from localStorage
    const userCode = localStorage.getItem('userCode');
    if (userCode) {
      setLoggedInUserCode(userCode);
    }
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <img src={globeImage} alt="Globe" className="user-home-image" />
            <div className="welcome-message">
              <h1>Welcome to Your Dashboard</h1>
              <p>Select an option from the navigation to get started</p>
            </div>
          </>
        );
      case 'data-format1':
        return <FormatOne userCode={loggedInUserCode} />;
      case 'data-format2':
        return <FormatTwo userCode={loggedInUserCode} />;
      default:
        return null;
    }
  };

  return (
    <div className="user-home-page">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="user-home-content">
        <div className="content-container">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default UserHome;
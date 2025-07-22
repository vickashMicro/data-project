import React from "react";
import { 
  FaChevronDown, 
  FaUserPlus, 
  FaUpload, 
  FaFileExcel, 
  FaUsers, 
  FaChartBar, 
  FaHome, 
  FaExclamationTriangle,
  FaSignOutAlt,
  FaFileAlt,
  FaTrashAlt,
  FaBalanceScale // New icon for Mismatch Report
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentTime = new Date();
  
  const [systemMasterOpen, setSystemMasterOpen] = React.useState(false);
  const [reportsOpen, setReportsOpen] = React.useState(false);

  React.useEffect(() => {
    const systemMasterPaths = [
      '/create-user', 
      '/upload-file', 
      '/create-sheet',
      '/delete-sheet'
    ];
    const reportsPaths = [
      '/user-details', 
      '/format-one-download', 
      '/format-two-download', 
      '/user-wise-report', 
      '/errors',
      '/volume-report',
      '/mismatch-report' // Added mismatch-report path
    ];
    
    if (systemMasterPaths.includes(location.pathname)) {
      setSystemMasterOpen(true);
      setReportsOpen(false);
    } else if (reportsPaths.includes(location.pathname)) {
      setReportsOpen(true);
      setSystemMasterOpen(false);
    }
  }, [location.pathname]);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSystemMasterClick = () => {
    setSystemMasterOpen(!systemMasterOpen);
    setReportsOpen(false);
  };

  const handleReportsClick = () => {
    setReportsOpen(!reportsOpen);
    setSystemMasterOpen(false);
  };

  const handleSignOut = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/admin');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar">
      <div className="logo">MicroNetAdmin</div>
      <div className="sidebar-date">
        <div className="sidebar-day">{currentTime.toLocaleDateString([], { weekday: 'long' })}</div>
        <div className="sidebar-time">{formatTime(currentTime)}</div>
      </div>
      <nav className="nav-menu">
        <button 
          className={`nav-item ${isActive('/admin-home') ? 'active' : ''}`} 
          onClick={() => navigate('/admin-home')}
        >
          <FaHome className="nav-icon" />
          <span>Dashboard</span>
        </button>

        <div className={`nav-dropdown ${systemMasterOpen ? 'open' : ''}`}>
          <button
            className={`nav-item ${systemMasterOpen ? 'active' : ''}`}
            onClick={handleSystemMasterClick}
          >
            <span>System Master</span>
            <FaChevronDown className={`dropdown-icon ${systemMasterOpen ? 'rotate' : ''}`} />
          </button>
          <div className={`dropdown-menu ${systemMasterOpen ? 'open' : ''}`}>
            <button 
              className={`dropdown-item ${isActive('/create-user') ? 'active' : ''}`}
              onClick={() => navigate('/create-user')}
            >
              <FaUserPlus className="item-icon" />
              <span>Create User</span>
            </button>
            <button 
              className={`dropdown-item ${isActive('/upload-file') ? 'active' : ''}`}
              onClick={() => navigate('/upload-file')}
            >
              <FaUpload className="item-icon" />
              <span>Upload File</span>
            </button>
            <button 
              className={`dropdown-item ${isActive('/create-sheet') ? 'active' : ''}`}
              onClick={() => navigate('/create-sheet')}
            >
              <FaFileExcel className="item-icon" />
              <span>Create Sheet</span>
            </button>
            <button 
              className={`dropdown-item ${isActive('/delete-sheet') ? 'active' : ''}`}
              onClick={() => navigate('/delete-sheet')}
            >
              <FaTrashAlt className="item-icon" />
              <span>Delete Sheet</span>
            </button>
          </div>
        </div>

        <div className={`nav-dropdown ${reportsOpen ? 'open' : ''}`}>
          <button
            className={`nav-item ${reportsOpen ? 'active' : ''}`}
            onClick={handleReportsClick}
          >
            <span>Reports</span>
            <FaChevronDown className={`dropdown-icon ${reportsOpen ? 'rotate' : ''}`} />
          </button>
          <div className={`dropdown-menu ${reportsOpen ? 'open' : ''}`}>
            <button 
              className={`dropdown-item ${isActive('/user-details') ? 'active' : ''}`}
              onClick={() => navigate('/user-details')}
            >
              <FaUsers className="item-icon" />
              <span>User Details</span>
            </button>
            <button 
              className={`dropdown-item ${isActive('/format-one-download') ? 'active' : ''}`}
              onClick={() => navigate('/format-one-download')}
            >
              <FaFileExcel className="item-icon" />
              <span>Format 1 Download</span>
            </button>
            <button 
              className={`dropdown-item ${isActive('/format-two-download') ? 'active' : ''}`}
              onClick={() => navigate('/format-two-download')}
            >
              <FaFileExcel className="item-icon" />
              <span>Format 2 Download</span>
            </button>
            <button 
              className={`dropdown-item ${isActive('/user-wise-report') ? 'active' : ''}`}
              onClick={() => navigate('/user-wise-report')}
            >
              <FaChartBar className="item-icon" />
              <span>User Data Count</span>
            </button>
            <button 
              className={`dropdown-item ${isActive('/volume-report') ? 'active' : ''}`}
              onClick={() => navigate('/volume-report')}
            >
              <FaFileAlt className="item-icon" />
              <span>Volume Report</span>
            </button>
            <button 
              className={`dropdown-item ${isActive('/mismatch-report') ? 'active' : ''}`}
              onClick={() => navigate('/mismatch-report')}
            >
              <FaBalanceScale className="item-icon" />
              <span>Mismatch Report</span>
            </button>
            <button 
              className={`dropdown-item ${isActive('/errors') ? 'active' : ''}`}
              onClick={() => navigate('/errors')}
            >
              <FaExclamationTriangle className="item-icon" />
              <span>Error Reports</span>
            </button>
          </div>
        </div>
      </nav>

      <button 
        className="sign-out-btn"
        onClick={handleSignOut}
      >
        <FaSignOutAlt className="sign-out-icon" />
        <span>Sign Out</span>
      </button>
    </div>
  );
};

export default Sidebar;
import React from 'react';
import Sidebar from './Sidebar';
import '../styles/Error.css';
import { useLocation } from 'react-router-dom';

const Error = () => {
  const [systemMasterOpen, setSystemMasterOpen] = React.useState(false);
  const [reportsOpen, setReportsOpen] = React.useState(false);
  const location = useLocation();
  const errors = location.state?.errors || [];

  return (
    <div className="admin-home">
      <Sidebar
        systemMasterOpen={systemMasterOpen}
        setSystemMasterOpen={setSystemMasterOpen}
        reportsOpen={reportsOpen}
        setReportsOpen={setReportsOpen}
      />

      <div className="main-content">
        <div className="error-page-container">
          <h1 className="error-page-title">Data Validation Errors</h1>
          
          <div className="error-table-container">
            <table className="error-table">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Field</th>
                  <th>Error Type</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((error, index) => (
                  <tr key={index} className="error-row">
                    <td>{error.row}</td>
                    <td>{error.field}</td>
                    <td>{error.type}</td>
                    <td>
                      {error.type.includes('Duplicate') ? (
                        <span className="duplicate-details">
                          {error.type.split(': ')[1]}
                        </span>
                      ) : (
                        error.details || '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error;
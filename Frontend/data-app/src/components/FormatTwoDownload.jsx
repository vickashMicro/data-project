import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { FiDownload, FiAlertCircle, FiChevronDown, FiCheck } from 'react-icons/fi';
import '../styles/FormatOneDownload.css';

const FormatTwoDownload = () => {
  const [selectedSheet, setSelectedSheet] = useState('');
  const [availableSheets, setAvailableSheets] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const [systemMasterOpen, setSystemMasterOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [rowCount, setRowCount] = useState(null);

  // Fetch available sheets when component mounts
  useEffect(() => {
    fetch('http://localhost:5000/get-sheets')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setAvailableSheets(data.data);
        }
      })
      .catch(err => console.error('Error fetching sheets:', err));
  }, []);

  // Fetch row count when sheet changes
  useEffect(() => {
    if (selectedSheet) {
      fetch(`http://localhost:5000/get-mfile-row-count?sheetName=${selectedSheet}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setRowCount(data.rowCount);
          } else {
            setRowCount(null);
          }
        })
        .catch(err => {
          console.error('Error fetching row count:', err);
          setRowCount(null);
        });
    } else {
      setRowCount(null);
    }
  }, [selectedSheet]);

  const handleDownload = () => {
    if (!selectedSheet) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      return;
    }

    setIsDownloading(true);

    // Fetch the Mfile data from the backend
    fetch(`http://localhost:5000/download-mfile?sheetName=${selectedSheet}`)
      .then(response => response.json())
      .then(data => {
        if (data.success && data.fileData) {
          // Create a downloadable text file
          const content = data.fileData.join('\n');
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${selectedSheet}Mfile.txt`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setIsDownloading(false);
          setIsSuccess(true);
          setTimeout(() => setIsSuccess(false), 2000);

          // Update row count from download response
          if (data.rowCount !== undefined) {
            setRowCount(data.rowCount);
          }
        } else {
          throw new Error(data.message || 'Failed to download file');
        }
      })
      .catch(error => {
        console.error('Download error:', error);
        alert('Failed to download file: ' + error.message);
        setIsDownloading(false);
      });
  };

  const handleCheckError = () => {
    if (!selectedSheet) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      return;
    }

    fetch(`http://localhost:5000/check-mfile-errors?sheetName=${selectedSheet}`)
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert(`Errors checked. ${data.errorCount || 0} formatting errors found.`);
        } else {
          alert('Error checking file: ' + (data.message || 'Unknown error'));
        }
      })
      .catch(error => {
        console.error('Error checking:', error);
        alert('Failed to check for errors: ' + error.message);
      });
  };

  return (
    <div className="admin-home">
      <Sidebar
        systemMasterOpen={systemMasterOpen}
        setSystemMasterOpen={setSystemMasterOpen}
        reportsOpen={reportsOpen}
        setReportsOpen={setReportsOpen}
      />
      <div className="main-content">
        <div className="content-area">
          <div className="format-one-download-container">
            <header className="format-one-download-header">
              <h1 className="format-one-download-title">
                Format 2 (Mfile) Download
              </h1>
              <p className="text-muted">Download member data in fixed-width text format</p>
            </header>

            <div className="format-one-download-card">
              <div className="format-one-download-form-group">
                <label htmlFor="format-two-download-select" className="format-one-download-label">
                  Select Sheet
                </label>
                <div className="format-one-download-select-wrapper">
                  <select
                    id="format-two-download-select"
                    value={selectedSheet}
                    onChange={(e) => setSelectedSheet(e.target.value)}
                    className={`format-one-download-select ${shouldShake ? 'format-one-download-shake' : ''}`}
                  >
                    <option value="">Select a sheet...</option>
                    {availableSheets.map((sheet, index) => (
                      <option key={index} value={sheet}>
                        {sheet} {sheet === selectedSheet && rowCount !== null ? `- ${rowCount} records` : ''}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="format-one-download-select-arrow" />
                </div>
              </div>

              <div className="format-one-download-button-group">
                <button
                  className="format-one-download-error-button"
                  onClick={handleCheckError}
                >
                  <FiAlertCircle className="format-one-download-icon" />
                  Check Errors
                </button>
                <button
                  className={`format-one-download-main-button ${isDownloading ? 'loading' : ''} ${isSuccess ? 'success' : ''}`}
                  onClick={handleDownload}
                  disabled={isDownloading || isSuccess}
                >
                  {isDownloading ? (
                    <span className="format-one-download-spinner"></span>
                  ) : isSuccess ? (
                    <>
                      <FiCheck className="format-one-download-icon" />
                      Success!
                    </>
                  ) : (
                    <>
                      <FiDownload className="format-one-download-icon" />
                      Download Mfile
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default FormatTwoDownload;
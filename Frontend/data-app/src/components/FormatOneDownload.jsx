import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { FiDownload, FiAlertCircle, FiChevronDown, FiCheck } from 'react-icons/fi';
import '../styles/FormatOneDownload.css';

const FormatOneDownload = () => {
  const [selectedSheet, setSelectedSheet] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const [systemMasterOpen, setSystemMasterOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [sheetNames, setSheetNames] = useState([]);
  const [rowCounts, setRowCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch available sheet names
        const sheetsResponse = await fetch('http://localhost:5000/get-sheets');
        const sheetsData = await sheetsResponse.json();
        
        if (sheetsData.success) {
          setSheetNames(sheetsData.data);
          
          // Fetch row counts for each sheet's Cfile table
          const counts = {};
          const countPromises = sheetsData.data.map(async (sheet) => {
            try {
              const countResponse = await fetch(`http://localhost:5000/get-cfile-row-count?sheetName=${sheet}`);
              const countData = await countResponse.json();
              counts[sheet] = countData.success ? countData.rowCount : 0;
            } catch (error) {
              console.error(`Error fetching row count for ${sheet}:`, error);
              counts[sheet] = 0;
            }
          });
          
          await Promise.all(countPromises);
          setRowCounts(counts);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownload = async () => {
    if (!selectedSheet) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      return;
    }

    setIsDownloading(true);
    
    try {
      const response = await fetch(`http://localhost:5000/download-cfile?sheetName=${selectedSheet}`);
      const data = await response.json();
      
      if (data.success && data.fileData) {
        // Create the text file content
        let fileContent = '';
        data.fileData.forEach(row => {
          // Format each line according to requirements
          const line = 
            (row.batch_number || '').padStart(7, '0') +
            (row.zone_code || '').toUpperCase() +
            (row.emp_number || '').padStart(6, '0') +
            (row.cont_period || '').padStart(6, '0') +
            (row.member_number || '').padStart(6, '0') +
            (row.record_id || '5') +
            (row.page_no || '0').padStart(2, '0') +
            (row.contribution || '0').padStart(11, '0');
          
          fileContent += line + '\n';
        });

        // Create download link
        const blob = new Blob([fileContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedSheet}Cfile.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 2000);
      } else {
        alert(data.message || 'Failed to download file');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading file');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCheckError = () => {
    if (!selectedSheet) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      return;
    }
    alert(`Checking for formatting errors in ${selectedSheet}...`);
    // You can implement actual error checking logic here
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
                Format 1 (Cfile) Download
              </h1>
              <p className="text-muted">Download your reports in standardized formats</p>
            </header>

            <div className="format-one-download-card">
              <div className="format-one-download-form-group">
                <label htmlFor="format-one-download-select" className="format-one-download-label">
                  Select Sheet
                </label>
                <div className="format-one-download-select-wrapper">
                  {isLoading ? (
                    <div className="format-one-download-loading">Loading sheets...</div>
                  ) : (
                    <select
                      id="format-one-download-select"
                      value={selectedSheet}
                      onChange={(e) => setSelectedSheet(e.target.value)}
                      className={`format-one-download-select ${shouldShake ? 'format-one-download-shake' : ''}`}
                    >
                      <option value="">Select a sheet...</option>
                      {sheetNames.map((sheet, index) => (
                        <option key={index} value={sheet}>
                          {sheet} - {rowCounts[sheet] || 0} records
                        </option>
                      ))}
                    </select>
                  )}
                  {!isLoading && <FiChevronDown className="format-one-download-select-arrow" />}
                </div>
              </div>

              <div className="format-one-download-button-group">
                <button 
                  className={`format-one-download-error-button ${!selectedSheet ? 'disabled' : ''}`}
                  onClick={handleCheckError}
                  disabled={!selectedSheet}
                >
                  <FiAlertCircle className="format-one-download-icon" />
                  Check Errors
                </button>
                <button 
                  className={`format-one-download-main-button ${isDownloading ? 'loading' : ''} ${isSuccess ? 'success' : ''} ${!selectedSheet ? 'disabled' : ''}`}
                  onClick={handleDownload}
                  disabled={isDownloading || isSuccess || !selectedSheet}
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
                      Download Cfile
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

export default FormatOneDownload;
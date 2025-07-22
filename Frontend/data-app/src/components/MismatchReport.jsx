import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { FiDownload, FiFileText, FiFile, FiChevronDown, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import '../styles/MismatchReport.css';

const MismatchReport = () => {
  const [selectedBatchNumber, setSelectedBatchNumber] = useState('');
  const [batchOptions, setBatchOptions] = useState([]);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [isSuccessPDF, setIsSuccessPDF] = useState(false);
  const [isSuccessExcel, setIsSuccessExcel] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const [systemMasterOpen, setSystemMasterOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBatchOptions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('http://localhost:5000/get-sheets');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setBatchOptions(data.data);
        } else {
          setError(data.message || 'Failed to fetch sheets');
        }
      } catch (error) {
        console.error('Error fetching sheets:', error);
        setError(`Error fetching sheets: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBatchOptions();
  }, []);

  const handleDownloadPDF = async () => {
    if (!selectedBatchNumber) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      return;
    }
    
    setIsDownloadingPDF(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/download-mismatch-pdf?batchNumber=${selectedBatchNumber}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Mismatch_Report_${selectedBatchNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsSuccessPDF(true);
      setTimeout(() => setIsSuccessPDF(false), 2000);
    } catch (error) {
      console.error('PDF download error:', error);
      setError(`Error downloading PDF: ${error.message}`);
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!selectedBatchNumber) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      return;
    }
    
    setIsDownloadingExcel(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/download-mismatch-excel?batchNumber=${selectedBatchNumber}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Mismatch_Report_${selectedBatchNumber}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsSuccessExcel(true);
      setTimeout(() => setIsSuccessExcel(false), 2000);
    } catch (error) {
      console.error('Excel download error:', error);
      setError(`Error downloading Excel: ${error.message}`);
    } finally {
      setIsDownloadingExcel(false);
    }
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
          <div className="mismatch-report-container">
            <header className="mismatch-report-header">
              <h1 className="mismatch-report-title">
                <FiAlertTriangle className="mismatch-report-title-icon" />
                Contribution Mismatch Report
              </h1>
              <p className="text-muted">Download mismatch reports for batches with contribution discrepancies</p>
            </header>

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            {isLoading && (
              <div className="loading-overlay">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            <div className="mismatch-report-card">
              <div className="mismatch-report-form-group">
                <label htmlFor="mismatch-report-select" className="mismatch-report-label">
                  Select Batch Number
                </label>
                <div className="mismatch-report-select-wrapper">
                  <select
                    id="mismatch-report-select"
                    value={selectedBatchNumber}
                    onChange={(e) => setSelectedBatchNumber(e.target.value)}
                    className={`mismatch-report-select ${shouldShake ? 'mismatch-report-shake' : ''}`}
                    disabled={isLoading}
                  >
                    <option value="">Select a batch...</option>
                    {batchOptions.map((batch, index) => (
                      <option key={index} value={batch}>
                        {batch}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="mismatch-report-select-arrow" />
                </div>
              </div>

              <div className="mismatch-report-button-group">
                <button 
                  className={`mismatch-report-pdf-button ${isDownloadingPDF ? 'loading' : ''} ${isSuccessPDF ? 'success' : ''}`}
                  onClick={handleDownloadPDF}
                  disabled={isDownloadingPDF || isSuccessPDF || !selectedBatchNumber || isLoading}
                >
                  {isDownloadingPDF ? (
                    <span className="mismatch-report-spinner"></span>
                  ) : isSuccessPDF ? (
                    <>
                      <FiCheck className="mismatch-report-icon" />
                      Success!
                    </>
                  ) : (
                    <>
                      <FiFileText className="mismatch-report-icon" />
                      Download PDF
                    </>
                  )}
                </button>
                
                <button 
                  className={`mismatch-report-excel-button ${isDownloadingExcel ? 'loading' : ''} ${isSuccessExcel ? 'success' : ''}`}
                  onClick={handleDownloadExcel}
                  disabled={isDownloadingExcel || isSuccessExcel || !selectedBatchNumber || isLoading}
                >
                  {isDownloadingExcel ? (
                    <span className="mismatch-report-spinner"></span>
                  ) : isSuccessExcel ? (
                    <>
                      <FiCheck className="mismatch-report-icon" />
                      Success!
                    </>
                  ) : (
                    <>
                      <FiFile className="mismatch-report-icon" />
                      Download Excel
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

export default MismatchReport;
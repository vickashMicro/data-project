import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { FiDownload, FiFileText, FiFile, FiChevronDown, FiCheck } from 'react-icons/fi';
import '../styles/VolumeReport.css';

const VolumeReport = () => {
  const [selectedSheetName, setSelectedSheetName] = useState('');
  const [sheetOptions, setSheetOptions] = useState([]);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [isSuccessPDF, setIsSuccessPDF] = useState(false);
  const [isSuccessExcel, setIsSuccessExcel] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const [systemMasterOpen, setSystemMasterOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  useEffect(() => {
    // ✅ Fetch available sheet names
    const fetchSheetOptions = async () => {
      try {
        const response = await fetch('http://localhost:5000/get-sheets'); // 👈 Make sure your backend provides this
        const data = await response.json();
        if (data.success) {
          setSheetOptions(data.data);
        }
      } catch (error) {
        console.error('Error fetching sheet names:', error);
      }
    };
    fetchSheetOptions();
  }, []);

  const handleDownloadPDF = async () => {
    if (!selectedSheetName) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      return;
    }
    setIsDownloadingPDF(true);

    try {
      const response = await fetch(`http://localhost:5000/download-volume-pdf?sheetName=${selectedSheetName}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Volume_Report_${selectedSheetName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsSuccessPDF(true);
      setTimeout(() => setIsSuccessPDF(false), 2000);
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Error downloading PDF report');
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleDownloadExcel = async () => {
    if (!selectedSheetName) {
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);
      return;
    }
    setIsDownloadingExcel(true);

    try {
      const response = await fetch(`http://localhost:5000/download-volume-excel?sheetName=${selectedSheetName}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Volume_Report_${selectedSheetName}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsSuccessExcel(true);
      setTimeout(() => setIsSuccessExcel(false), 2000);
    } catch (error) {
      console.error('Excel download error:', error);
      alert('Error downloading Excel report');
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
          <div className="volume-report-container">
            <header className="volume-report-header">
              <h1 className="volume-report-title">
                Volume Report by Sheet
              </h1>
              <p className="text-muted">Download volume reports for a specific sheet</p>
            </header>

            <div className="volume-report-card">
              <div className="volume-report-form-group">
                <label htmlFor="volume-report-select" className="volume-report-label">
                  Select Sheet
                </label>
                <div className="volume-report-select-wrapper">
                  <select
                    id="volume-report-select"
                    value={selectedSheetName}
                    onChange={(e) => setSelectedSheetName(e.target.value)}
                    className={`volume-report-select ${shouldShake ? 'volume-report-shake' : ''}`}
                  >
                    <option value="">Select a sheet...</option>
                    {sheetOptions.map((sheet, index) => (
                      <option key={index} value={sheet}>{sheet}</option>
                    ))}
                  </select>
                  <FiChevronDown className="volume-report-select-arrow" />
                </div>
              </div>

              <div className="volume-report-button-group">
                <button 
                  className={`volume-report-pdf-button ${isDownloadingPDF ? 'loading' : ''} ${isSuccessPDF ? 'success' : ''}`}
                  onClick={handleDownloadPDF}
                  disabled={isDownloadingPDF || isSuccessPDF}
                >
                  {isDownloadingPDF ? (
                    <span className="volume-report-spinner"></span>
                  ) : isSuccessPDF ? (
                    <>
                      <FiCheck className="volume-report-icon" />
                      Success!
                    </>
                  ) : (
                    <>
                      <FiFileText className="volume-report-icon" />
                      Download PDF
                    </>
                  )}
                </button>
                
                <button 
                  className={`volume-report-excel-button ${isDownloadingExcel ? 'loading' : ''} ${isSuccessExcel ? 'success' : ''}`}
                  onClick={handleDownloadExcel}
                  disabled={isDownloadingExcel || isSuccessExcel}
                >
                  {isDownloadingExcel ? (
                    <span className="volume-report-spinner"></span>
                  ) : isSuccessExcel ? (
                    <>
                      <FiCheck className="volume-report-icon" />
                      Success!
                    </>
                  ) : (
                    <>
                      <FiFile className="volume-report-icon" />
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

export default VolumeReport;

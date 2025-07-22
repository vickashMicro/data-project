import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import '../styles/UserWiseDataDetail.css';

const UserWiseDataDetail = () => {
  const [selectedSheet, setSelectedSheet] = useState('');
  const [sheetFormat, setSheetFormat] = useState('excel');
  const [systemMasterOpen, setSystemMasterOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [sheets, setSheets] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch available sheets
  useEffect(() => {
    fetchSheets();
  }, []);

  // Fetch report data when sheet is selected
  useEffect(() => {
    if (selectedSheet) {
      fetchReportData();
    } else {
      setReportData([]);
    }
  }, [selectedSheet]);

  const fetchSheets = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/get-sheets');
      const data = await response.json();
      if (data.success) {
        setSheets(data.data);
      }
    } catch (error) {
      console.error('Error fetching sheets:', error);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/get-user-action-counts?sheetName=${selectedSheet}`);
      const data = await response.json();

      if (data.success) {
        setReportData(data.data);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

const handleDownload = async () => {
  if (!selectedSheet) return;

  try {
    setLoading(true);
    const endpoint = sheetFormat === 'pdf' 
      ? 'generate-pdf-report' 
      : 'generate-excel-report';

    const response = await fetch(`http://127.0.0.1:5000/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sheetName: selectedSheet
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate report');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSheet}_report.${sheetFormat === 'excel' ? 'xlsx' : 'pdf'}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    
  } catch (error) {
    console.error('Download error:', error);
    alert(`Download failed: ${error.message}`);
  } finally {
    setLoading(false);
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
        <div className="user-wise-report-container">
          <h2 className="report-title">User Data Entry Count Report</h2>

          <div className="controls-section">
            <div className="control-group">
              <label>Select Sheet</label>
              <select
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                className="sheet-select"
              >
                <option value="">-- Select Sheet --</option>
                {sheets.map((sheet, index) => (
                  <option key={index} value={sheet}>{sheet}</option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label>Report Format</label>
              <select
                value={sheetFormat}
                onChange={(e) => setSheetFormat(e.target.value)}
                className="format-select"
              >
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
              </select>
            </div>

            <button
              className="download-btn"
              onClick={handleDownload}
              disabled={!selectedSheet || loading}
            >
              {loading ? 'Generating...' : 'Download Report'}
            </button>
          </div>

          <div className="report-table-container">
            {loading ? (
              <div className="loading-indicator">Loading data...</div>
            ) : (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Sheet Name</th>
                    <th>Inserted Rows</th>
                    <th>Updated Rows</th>
                    <th>Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.length > 0 ? (
                    reportData.map((row, index) => (
                      <tr key={index}>
                        <td>{row.user_name || row.user_code}</td>
                        <td>{row.sheet_name}</td>
                        <td>{row.total_inserted}</td>
                        <td>{row.total_updated}</td>
                        <td>{new Date(row.last_activity).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="no-data">
                        {selectedSheet ? 'No data available for the selected sheet' : 'Please select a sheet to view data'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserWiseDataDetail;

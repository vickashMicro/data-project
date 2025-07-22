import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import '../styles/DeleteSheet.css';

const DeleteSheet = () => {
  const [sheets, setSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchSheets = async () => {
      try {
        const res = await fetch('http://localhost:5000/get-sheets');
        const data = await res.json();
        if (data.success) {
          setSheets(data.data);
        } else {
          setErrorMessage("Failed to fetch sheets.");
        }
      } catch (err) {
        setErrorMessage("Server error while fetching sheets.");
        console.error(err);
      }
    };
    fetchSheets();
  }, []);

  const handleDelete = async () => {
    if (!selectedSheet) {
      setErrorMessage("Please select a sheet to delete.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/delete-sheet?sheetName=${selectedSheet}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMessage(`Sheet "${selectedSheet}" deleted successfully.`);
        setSheets(sheets.filter(sheet => sheet !== selectedSheet));
        setSelectedSheet('');
      } else {
        setErrorMessage(data.message || "Failed to delete sheet.");
      }
    } catch (err) {
      setErrorMessage("Server error while deleting sheet.");
      console.error(err);
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <div className="admin-home">
      <Sidebar />
      <div className="main-content">
        <div className="delete-sheet-container">
          <h2 className="delete-sheet-title">Delete Sheet</h2>

          <div className="delete-sheet-form">
            <label className="delete-sheet-label">
              Select Sheet to Delete
              <select
                className="delete-sheet-select"
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                required
              >
                <option value="">-- Select Sheet --</option>
                {sheets.map((sheet) => (
                  <option key={sheet} value={sheet}>
                    {sheet}
                  </option>
                ))}
              </select>
            </label>

            <button 
              className="delete-sheet-btn" 
              onClick={() => selectedSheet ? setShowConfirm(true) : setErrorMessage("Please select a sheet.")}
              disabled={!selectedSheet}
            >
              Delete Sheet
            </button>
          </div>

          {errorMessage && <div className="delete-sheet-error">{errorMessage}</div>}
          {successMessage && <div className="delete-sheet-success">{successMessage}</div>}

          {/* Confirmation Modal */}
          {showConfirm && (
            <div className="delete-sheet-modal">
              <div className="delete-sheet-modal-content">
                <h3>Are you sure?</h3>
                <p>You are about to delete sheet: <strong>{selectedSheet}</strong>. This action cannot be undone.</p>
                <div className="delete-sheet-modal-buttons">
                  <button className="delete-sheet-cancel-btn" onClick={() => setShowConfirm(false)}>
                    Cancel
                  </button>
                  <button className="delete-sheet-confirm-btn" onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteSheet;
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import '../styles/DeleteData.css';

const DeleteData = () => {
  const [format, setFormat] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [zoneCode, setZoneCode] = useState('');
  const [empNumber, setEmpNumber] = useState('');
  const [memberNumber, setMemberNumber] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  const handleDelete = async () => {
    if (!format || !batchNumber || !zoneCode || !empNumber || !memberNumber) {
      setErrorMessage('Please fill all required fields.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const endpoint = format === 'Mfile' ? '/delete-format-two' : '/delete-format-one';
      
      // Format batch number based on format type
      let formattedBatch;
      if (format === 'Mfile') {
        // For Mfile: take first 7 digits (remove any spaces)
        formattedBatch = batchNumber.replace(/\s/g, '').slice(0, 7);
      } else {
        // For Cfile: pad to 7 digits with leading zeros
        formattedBatch = batchNumber.padStart(7, '0');
      }

      const params = new URLSearchParams({
        batchNumber: formattedBatch,
        zoneCode: zoneCode.toUpperCase(),
        empNumber: empNumber.padStart(6, '0'),
        memberNumber: memberNumber.padStart(6, '0')
      });

      const res = await fetch(`${API_BASE_URL}${endpoint}?${params}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || res.statusText || 'Failed to delete record');
      }

      const data = await res.json();
      setSuccessMessage(data.message || `Successfully deleted record from ${format} format`);
      
      // Reset form
      setBatchNumber('');
      setZoneCode('');
      setEmpNumber('');
      setMemberNumber('');
    } catch (err) {
      console.error('Delete error:', err);
      setErrorMessage(err.message || 'An error occurred while deleting the record');
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="admin-home">
      <Sidebar />
      <div className="main-content">
        <div className="delete-data-container">
          <h2 className="delete-data-title">Delete Data Record</h2>

          <div className="delete-data-form">
            <label className="delete-data-label">
              Select Format
              <select
                className="delete-data-select"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                required
              >
                <option value="">-- Select Format --</option>
                <option value="Mfile">Mfile (Format Two)</option>
                <option value="Cfile">Cfile (Format One)</option>
              </select>
            </label>

            <label className="delete-data-label">
              Batch Number
              <input
                type="text"
                className="delete-data-input"
                value={batchNumber}
                onChange={(e) => {
                  const value = format === 'Mfile' 
                    ? e.target.value.slice(0, 8)
                    : e.target.value.replace(/\D/g, '').slice(0, 7);
                  setBatchNumber(value);
                }}
                placeholder={
                  format === 'Mfile' 
                    ? 'YYYYDDD (7 digits)' 
                    : '7 digit batch number'
                }
                maxLength={format === 'Mfile' ? 8 : 7}
                required
              />
            </label>

            <label className="delete-data-label">
              Zone Code
              <input
                type="text"
                className="delete-data-input"
                value={zoneCode}
                onChange={(e) => setZoneCode(e.target.value.toUpperCase())}
                placeholder="Enter zone code (1 character)"
                maxLength="1"
                required
              />
            </label>

            <label className="delete-data-label">
              Employee Number
              <input
                type="text"
                className="delete-data-input"
                value={empNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setEmpNumber(value);
                }}
                placeholder="6 digit employee number"
                maxLength="6"
                required
              />
            </label>

            <label className="delete-data-label">
              Member Number
              <input
                type="text"
                className="delete-data-input"
                value={memberNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setMemberNumber(value);
                }}
                placeholder="6 digit member number"
                maxLength="6"
                required
              />
            </label>

            <button
              className="delete-data-btn"
              onClick={() => {
                if (format && batchNumber && zoneCode && empNumber && memberNumber) {
                  setShowConfirm(true);
                  setErrorMessage('');
                } else {
                  setErrorMessage('Please fill all required fields.');
                }
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Delete Record'}
            </button>
          </div>

          {errorMessage && (
            <div className="delete-data-error">
              <i className="fas fa-exclamation-circle"></i> {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="delete-data-success">
              <i className="fas fa-check-circle"></i> {successMessage}
            </div>
          )}

          {showConfirm && (
            <div className="delete-data-modal">
              <div className="delete-data-modal-content">
                <h3>Confirm Deletion</h3>
                <p>You are about to delete this record:</p>
                <div className="delete-data-record-details">
                  <p><strong>Format:</strong> {format === 'Mfile' ? 'Mfile (Format Two)' : 'Cfile (Format One)'}</p>
                  <p><strong>Batch:</strong> {batchNumber}</p>
                  <p><strong>Zone:</strong> {zoneCode}</p>
                  <p><strong>Employee:</strong> {empNumber.padStart(6, '0')}</p>
                  <p><strong>Member:</strong> {memberNumber.padStart(6, '0')}</p>
                </div>
                <p className="delete-data-warning">
                  <i className="fas fa-exclamation-triangle"></i> This action cannot be undone.
                </p>
                <div className="delete-data-modal-buttons">
                  <button
                    className="delete-data-cancel-btn"
                    onClick={() => setShowConfirm(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="delete-data-confirm-btn"
                    onClick={handleDelete}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Deleting...' : 'Confirm Delete'}
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

export default DeleteData;
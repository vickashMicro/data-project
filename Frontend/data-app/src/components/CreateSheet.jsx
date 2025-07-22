import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import '../styles/CreateSheet.css';

const CreateSheet = () => {
  const [sheetName, setSheetName] = useState('');
  const [empMemberFile, setEmpMemberFile] = useState('');
  const [empContributionFile, setEmpContributionFile] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchUploadedFiles = async () => {
      try {
        const res = await fetch('http://localhost:5000/uploaded-files');
        const data = await res.json();
        setUploadedFiles(data);
      } catch (err) {
        console.error("Failed to load uploaded files", err);
      }
    };
    fetchUploadedFiles();
  }, []);

  const startProgress = () => {
    setProgress(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressIntervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, 50);
  };

  const completeProgress = () => {
    clearInterval(progressIntervalRef.current);
    setProgress(100);
    setTimeout(() => setProgress(0), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sheetName || !empMemberFile || !empContributionFile) {
      alert("Please fill all fields.");
      return;
    }

    if (!/^\d{7}$/.test(sheetName)) {
      alert("Sheet name must be exactly 7 digits.");
      return;
    }

    try {
      const checkRes = await fetch(`http://localhost:5000/check-sheet-exists?sheetName=${sheetName}`);
      const checkData = await checkRes.json();
      if (checkData.success && checkData.exists) {
        alert(`Sheet \"${sheetName}\" already exists. Please use a different name.`);
        return;
      }

      setSuccessMessage('');
      startProgress();

      const res = await fetch("http://localhost:5000/create-merged-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetName,
          empMemberFile,
          empContributionFile,
        }),
      });

      const result = await res.json();
      completeProgress();

      if (result.success) {
        setSuccessMessage(`Sheet \"${sheetName}\" was successfully created with ${result.message}`);
        setShowSuccess(true);
        setSheetName('');
        setEmpMemberFile('');
        setEmpContributionFile('');
      } else {
        alert("Failed to create sheet: " + result.message);
      }
    } catch (error) {
      completeProgress();
      alert("Server error while creating sheet.");
      console.error(error);
    }
  };

  return (
    <div className="admin-home">
      <Sidebar />

      <div className="main-content">
        <div className="create-sheet-container">
          <h2>Create Sheet Format 1</h2>

          <form className="form-box" onSubmit={handleSubmit}>
            <label>
              Sheet Name
              <input
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                placeholder="Enter 7-digit sheet name"
                required
              />
            </label>

            <label>
              Emp Member File
              <select
                value={empMemberFile}
                onChange={(e) => setEmpMemberFile(e.target.value)}
                required
              >
                <option value="">-- Select Member File --</option>
                {uploadedFiles.map((file) => (
                  <option key={file.id} value={file.filename}>
                    {file.filename}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Emp Contribution File
              <select
                value={empContributionFile}
                onChange={(e) => setEmpContributionFile(e.target.value)}
                required
              >
                <option value="">-- Select Contribution File --</option>
                {uploadedFiles.map((file) => (
                  <option key={file.id} value={file.filename}>
                    {file.filename}
                  </option>
                ))}
              </select>
            </label>

            <button type="submit">Create</button>
          </form>

          {progress > 0 && (
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              >
                {progress}%
              </div>
            </div>
          )}

          {/* Success Message Modal */}
          <div className={`success-message ${showSuccess ? 'active' : ''}`}>
            <div className="checkmark-circle">
              <div className="checkmark">
                <div className="checkmark-stem"></div>
                <div className="checkmark-kick"></div>
              </div>
            </div>
            <h2>Success!</h2>
            <p>{successMessage}</p>
            <button
              className="modal-close-btn"
              onClick={() => setShowSuccess(false)}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSheet;
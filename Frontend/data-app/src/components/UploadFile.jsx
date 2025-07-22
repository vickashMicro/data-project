import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import '../styles/UploadFile.css';

const UploadFile = () => {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [systemMasterOpen, setSystemMasterOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert("Files uploaded successfully");
        fetchUploadedFiles();
        setFiles([]);
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      alert("Server error");
    }
  };

  const fetchUploadedFiles = async () => {
    try {
      const response = await fetch("http://localhost:5000/uploaded-files");
      const data = await response.json();
      setUploadedFiles(data);
    } catch (error) {
      console.error("Failed to fetch uploaded files");
    }
  };

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const handleDropAreaClick = () => {
    fileInputRef.current.click();
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
        <div className="upload-page">
          <h2 className="upload-title">Upload File</h2>

          <div
            className="drop-area"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={handleDropAreaClick}
          >
            <p>Drag and drop your files here<br />or click to browse</p>

            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden-file-input"
              ref={fileInputRef}
            />

            {files.length > 0 && (
              <ul className="file-preview-list">
                {files.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>

          {files.length > 0 && (
            <button className="upload-submit-btn" onClick={handleSubmit}>
              Upload Files
            </button>
          )}

          {uploadedFiles.length > 0 && (
            <table className="file-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>File Name</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {uploadedFiles.map((file, index) => (
                  <tr key={file.id}>
                    <td>{index + 1}</td>
                    <td>{file.filename}</td>
                    <td>
                      <a
                        href={`http://localhost:5000/download/${file.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                      >
                        Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadFile;

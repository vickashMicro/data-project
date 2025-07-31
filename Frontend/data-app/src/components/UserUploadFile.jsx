import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate
import '../styles/UserUploadFile.css';

const UserUploadFile = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const navigate = useNavigate(); // ✅ Initialize navigate

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

  return (
    <div className="user-upload-page">
      <main className="user-upload-main-content">
        <div className="content-container">
          <div>
            <h2 className="user-upload-title">Uploaded Files</h2>

            {uploadedFiles.length > 0 ? (
              <table className="user-upload-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>File Name</th>
                    <th>Download</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadedFiles.map((file, index) => (
                    <tr key={file.id || index}>
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
            ) : (
              <p>No files uploaded yet.</p>
            )}

            <button
              className="user-upload-back-button"
              onClick={() => navigate('/home')}
            >
              Back
            </button>
          </div>
        </div>
      </main>
    </div>


  );
};

export default UserUploadFile;

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import '../styles/UserDetails.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ✅ REGISTER the plugin


const UserDetails = () => {
  const [systemMasterOpen, setSystemMasterOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/get_users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Error fetching users:", err));
  }, []);

 const handleDownload = () => {
  const doc = new jsPDF();
  doc.text("User Details Report", 14, 10);
  
  const rows = users.map(user => [
    user.id,
    user.UserName,
    '********', // hide actual password
    user.email,
    user.phone
  ]);

  autoTable(doc, {
    head: [["ID", "UserName", "Password", "Email", "Phone"]],
    body: rows,
    startY: 20,
  });

  doc.save("user_details.pdf");
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
          <div className="user-details-content">
            <h2 className="user-details-heading">User Details</h2>
            <button className="download-button" onClick={handleDownload}>Download</button>
            <table className="user-details-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>UserName</th>
                  <th>Password</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.UserName}</td>
                    <td>********</td>
                    <td>{user.email}</td>
                    <td>{user.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;

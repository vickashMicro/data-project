import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import '../styles/Error.css';
import { useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Error = () => {
  const [systemMasterOpen, setSystemMasterOpen] = React.useState(false);
  const [reportsOpen, setReportsOpen] = React.useState(false);
  const location = useLocation();
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetName, setSheetName] = useState('');

  useEffect(() => {
    const fetchErrors = async () => {
      const queryParams = new URLSearchParams(location.search);
      const sheetNameParam = queryParams.get('sheetName');
      setSheetName(sheetNameParam || '');

      if (!sheetNameParam) {
        setErrors(location.state?.errors || []);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/check-format-one-errors?sheetName=${sheetNameParam}`
        );
        const data = await response.json();
        
        if (data.success) {
          setErrors(data.errors.map(error => ({
            id: error.id,
            batch_number: error.batch_number || '-',
            zone_code: error.zone_code || '-',
            emp_number: error.emp_number || '-',
            member_number: error.member_number || '-',
            cont_period: error.cont_period,
            page_no: error.page_no,
            details: error.details || 'Invalid field',
            error_type: error.error_type || 'unknown'
          })));
        } else {
          setErrors([{
            id: '-',
            batch_number: '-',
            zone_code: '-',
            emp_number: '-',
            member_number: '-',
            cont_period: '-',
            page_no: '-',
            details: data.message || 'Failed to fetch errors',
            error_type: 'system'
          }]);
        }
      } catch (error) {
        setErrors([{
          id: '-',
          batch_number: '-',
          zone_code: '-',
          emp_number: '-',
          member_number: '-',
          cont_period: '-',
          page_no: '-',
          details: 'Failed to connect to server',
          error_type: 'system'
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchErrors();
  }, [location]);

  const formatCellValue = (value, isInvalid) => {
    if (value === '-' || value === '0000' || value === '000000') {
      return <span style={{ color: 'red' }}>{value}</span>;
    }
    return value;
  };

  const downloadPDF = () => {
    if (errors.length === 0) return;

    try {
      // Initialize jsPDF with landscape orientation for better table display
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm'
      });

      const date = new Date().toLocaleDateString();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Set document properties before adding content
      doc.setProperties({
        title: `Error Report - ${sheetName || 'Unknown Sheet'}`,
        creator: 'Your Application'
      });

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(`Error Report - ${sheetName || 'Unknown Sheet'}`, pageWidth / 2, 15, { align: 'center' });
      
      // Subtitle
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Generated on: ${date}`, pageWidth / 2, 22, { align: 'center' });
      
      // Prepare table data
      const headers = [
        'ID',
        'Batch Number',
        'Zone Code',
        'Emp Number',
        'Member Number',
        'Cont Period',
        'Page No',
        'Error Details'
      ];
      
      const body = errors.map(error => [
        error.id,
        error.batch_number,
        error.zone_code,
        error.emp_number,
        error.member_number,
        error.cont_period,
        error.page_no,
        error.details
      ]);
      
      // Generate table with proper configuration
      autoTable(doc, {
        head: [headers],
        body: body,
        startY: 30,
        margin: { top: 30 },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          font: 'helvetica',
          textColor: [0, 0, 0] // Black text
        },
        headStyles: {
          fillColor: [231, 76, 60], // Red header
          textColor: [255, 255, 255], // White text
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 25 },
          2: { cellWidth: 15 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25 },
          5: { cellWidth: 20 },
          6: { cellWidth: 15 },
          7: { cellWidth: 'auto' }
        },
        didDrawCell: (data) => {
          if (data.row.index < 0 || !data.cell.raw) return;
          
          const error = errors[data.row.index];
          if (!error) return;
          
          const isInvalid = 
            (data.column.index === 5 && (error.cont_period === '000000' || error.cont_period === '-')) ||
            (data.column.index === 6 && (error.page_no === '0000' || error.page_no === '-'));
          
          if (isInvalid) {
            doc.setFillColor(255, 230, 230);
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          }
        }
      });
      
      // Save the PDF
      doc.save(`error_report_${sheetName || 'unknown'}_${date.replace(/\//g, '-')}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
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
        <div className="error-page-container">
          <h1 className="error-page-title">Data Validation Errors</h1>
          {sheetName && <h2 className="error-sheet-name">Sheet: {sheetName}</h2>}
          <p className="error-page-subtitle">
            Showing records with invalid fields (0000/000000)
          </p>
          
          {isLoading ? (
            <div className="error-loading">Loading errors...</div>
          ) : errors.length === 0 ? (
            <div className="error-no-errors">
              No records with invalid fields found!
            </div>
          ) : (
            <>
              <div className="error-actions">
                <button 
                  onClick={downloadPDF} 
                  className="pdf-download-button"
                  disabled={errors.length === 0}
                >
                  Download PDF Report
                </button>
              </div>
              <div className="error-table-container">
                <table className="error-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Batch Number</th>
                      <th>Zone Code</th>
                      <th>Emp Number</th>
                      <th>Member Number</th>
                      <th>Cont Period</th>
                      <th>Page No</th>
                      <th>Error Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errors.map((error, index) => (
                      <tr key={index} className="error-row">
                        <td>{error.id}</td>
                        <td>{error.batch_number}</td>
                        <td>{error.zone_code}</td>
                        <td>{error.emp_number}</td>
                        <td>{error.member_number}</td>
                        <td>
                          {formatCellValue(error.cont_period, error.error_type === 'cont_period' || error.error_type === 'both')}
                        </td>
                        <td>
                          {formatCellValue(error.page_no, error.error_type === 'page_no' || error.error_type === 'both')}
                        </td>
                        <td>
                          <span className="error-detail-message">
                            {error.details}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Error;
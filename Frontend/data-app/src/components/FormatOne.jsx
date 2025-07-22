import React, { useState, useEffect } from 'react';
import { FaSave, FaTrash, FaEraser, FaSearch, FaPlus, FaMinus } from 'react-icons/fa';
import '../styles/FormatOne.css';

const FormatOne = ({ userCode }) => {
  const [sheetData, setSheetData] = useState([]);
  const [sheetNames, setSheetNames] = useState([]);
  const [searchOptions, setSearchOptions] = useState([]);
  const [sheetName, setSheetName] = useState('');
  const [searchBy, setSearchBy] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const validateField = (field, value) => {
    if (!value) return false;
    switch (field) {
      case 'name': return /^[A-Za-z .]+$/.test(value);
      case 'batchNumber': return /^\d{7}$/.test(value);
      case 'zoneCode': return /^[A-Z]{1}$/i.test(value);
      case 'empNumber': return /^\d{6}$/.test(value);
      case 'contributed': return /^\d{6}$/.test(value);
      case 'membersNumber': return /^\d{6}$/.test(value);
      case 'recordID': return /^\d{1}$/.test(value);
      case 'pageNo': return /^\d{1,2}$/.test(value);
      case 'contribution': return /^\d+$/.test(value);
      default: return true;
    }
  };

  const getCellStyle = (field, value) => ({
    textTransform: 'uppercase',
    border: '1px solid #ccc',
    backgroundColor: validateField(field, value) ? 'white' : '#ffe6e6'
  });

  const getEmptyRow = () => {
    const label = searchBy || searchValue;
    const zoneCode = label?.charAt(0) || '';
    const empNumber = label?.substring(1) || '';
    return {
      name: '',
      batchNumber: sheetName,
      zoneCode,
      empNumber,
      contributed: '',
      membersNumber: '',
      recordID: '5',
      pageNo: '',
      contribution: ''
    };
  };

  useEffect(() => {
    if (sheetName && sheetData.length === 0) {
      setSheetData([getEmptyRow()]);
    }
  }, [sheetName]);

  useEffect(() => {
    setSelectAll(selectedRows.length === sheetData.length && sheetData.length > 0);
  }, [selectedRows, sheetData.length]);

  useEffect(() => {
    fetch('http://localhost:5000/get-sheets')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSheetNames(data.data);
          if (data.data.length > 0) setSheetName(data.data[0]);
        }
      });
  }, []);

  useEffect(() => {
    if (!sheetName) return;
    fetch(`http://localhost:5000/get-group-labels?sheetName=${sheetName}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setSearchOptions(data.data);
      });
  }, [sheetName]);

  const fetchMembersByLabel = (label) => {
    fetch(`http://localhost:5000/get-members-by-label?sheetName=${sheetName}&label=${label}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          if (data.data.length === 0) {
            setSheetData([getEmptyRow()]);
          } else {
            const [zoneCode, empNumber] = [label.charAt(0), label.substring(1)];
            setSheetData(data.data.map(item => ({
              name: item.name || '',
              batchNumber: sheetName,
              zoneCode,
              empNumber,
              contributed: item.cont_period || '',
              membersNumber: item.member_number || '',
              recordID: '5',
              pageNo: item.page_no || '',
              contribution: ''
            })));
          }
          setSelectedRows([]);
        } else {
          alert(data.message || "No data found.");
          setSheetData([getEmptyRow()]);
        }
      });
  };

  const handleSearch = () => {
    fetchMembersByLabel(searchValue);
  };

  const handleSearchByChange = (value) => {
    setSearchBy(value);
    if (value) fetchMembersByLabel(value);
  };

  const handleInputChange = (rowIndex, field, value) => {
    if (field === 'recordID') return;

    const maxLengths = {
      name: 100,
      batchNumber: 6,
      zoneCode: 1,
      empNumber: 6,
      contributed: 6,
      membersNumber: 6,
      pageNo: 2,
      contribution: 15,
    };

    if (['zoneCode', 'name'].includes(field)) {
      value = value.toUpperCase();
    }

    if (maxLengths[field] && value.length > maxLengths[field]) return;

    const numericFields = ['batchNumber', 'empNumber', 'contributed', 'membersNumber', 'pageNo', 'contribution'];
    if (numericFields.includes(field) && value !== '') {
      if (!/^\d*$/.test(value)) return;
    }

    const updatedData = [...sheetData];
    updatedData[rowIndex][field] = value;
    updatedData[rowIndex]['batchNumber'] = sheetName;
    setSheetData(updatedData);
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) return;
    if (window.confirm('Are you sure you want to delete selected rows?')) {
      const updatedData = sheetData.filter((_, index) => !selectedRows.includes(index));
      setSheetData(updatedData.length > 0 ? updatedData : [getEmptyRow()]);
      setSelectedRows([]);
    }
  };

  const handleClear = () => {
    setSheetData([getEmptyRow()]);
    setSelectedRows([]);
  };

  const handleAddRow = () => {
    setSheetData([...sheetData, getEmptyRow()]);
  };

  const handleRowDelete = (index) => {
    if (sheetData.length <= 1) return;
    setSheetData(sheetData.filter((_, i) => i !== index));
    setSelectedRows(selectedRows.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  const handleRowCheckboxChange = (index) => {
    setSelectedRows(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows([...Array(sheetData.length).keys()]);
    }
    setSelectAll(!selectAll);
  };
const handleSave = async () => {
    if (!userCode) {
        alert("User code missing. Cannot save.");
        return;
    }

    // Validate all fields first
    for (let i = 0; i < sheetData.length; i++) {
        const row = sheetData[i];
        for (const [field, value] of Object.entries(row)) {
            if (field === 'total' || field === 'recordID') continue;
            if (!validateField(field, value)) {
                alert(`Invalid value in row ${i + 1}, field "${field}". Please correct before saving.`);
                return;
            }
        }
        // Additional validation for contribution field
        if (!row.contribution || isNaN(row.contribution) || parseFloat(row.contribution) <= 0) {
            alert(`Invalid contribution amount in row ${i + 1}. Please enter a valid positive number.`);
            return;
        }
    }

    // Prepare the rows data
    const rows = sheetData.map(row => ({
        batchNumber: sheetName,
        zoneCode: row.zoneCode,
        empNumber: row.empNumber,
        contributed: row.contributed,
        membersNumber: row.membersNumber,
        recordID: '5',
        pageNo: row.pageNo || '0',
        contribution: row.contribution
    }));

    try {
        // Calculate frontend total for confirmation
        const frontendTotal = sheetData.reduce((sum, row) => sum + Number(row.contribution || 0), 0);
        
        // Show confirmation dialog with total amount
        const confirmSave = window.confirm(
            `You are about to save ${sheetData.length} records.\n` +
            `Total Contribution Amount: ${frontendTotal.toFixed(2)}\n\n` +
            `Do you want to proceed?`
        );
        
        if (!confirmSave) {
            return;
        }

        const response = await fetch("http://localhost:5000/save-format-one", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userCode,
                sheetName,
                rows
            })
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || "Failed to save data");
        }

        if (result.success) {
            let successMessage = `✅ Data saved successfully!\n` +
                                `Updated records: ${result.updated}\n` +
                                `New records: ${result.inserted}`;
            
            // Add detailed mismatch information if any
            if (result.mismatches && result.mismatches > 0) {
                successMessage += `\n\n⚠️ Contribution Mismatch Detected!\n` +
                               `Frontend Total: ${result.frontend_total.toFixed(2)}\n` +
                               `Database Total: ${result.backend_total.toFixed(2)}\n` +
                               `Difference: ${(result.frontend_total - result.backend_total).toFixed(2)}\n\n` +
                               `A mismatch report has been generated (${sheetName}_mismatches).`;
            }
            
            // Show success message
            alert(successMessage);
            
            // Refresh data if searching
            if (searchBy || searchValue) {
                const label = searchBy || searchValue;
                fetchMembersByLabel(label);
            }
        } else {
            alert(`❌ Failed to save data: ${result.message}`);
        }
    } catch (err) {
        console.error("Save error:", err);
        
        // Enhanced error handling
        let errorMessage = `Error saving data: ${err.message}`;
        if (err.message.includes("NetworkError")) {
            errorMessage = "Network error: Please check your internet connection and try again.";
        } else if (err.message.includes("Failed to fetch")) {
            errorMessage = "Server connection failed. Please try again later.";
        }
        
        alert(errorMessage);
    }
};
  const totalContribution = sheetData.reduce((acc, row) => acc + Number(row.contribution || 0), 0);

  return (
    <div className="formatone-container">

      {/* TOP ACTION BUTTONS */}
      {/* TOP ACTION SECTION WITH INFO BOXES TO THE LEFT */}
      <div className="formatone-top-section">
        <div className="formatone-info-container">
          <div className="formatone-total-rows-box">Row Count: {sheetData.length}</div>
          <div className="formatone-total-contribution-box">Total Contribution: {totalContribution}</div>
        </div>
        <div className="formatone-top-buttons">
          <button className="formatone-save-btn" onClick={handleSave}><FaSave /> SAVE</button>
          <button className="formatone-delete-btn" onClick={handleDeleteSelected}><FaTrash /> DELETE</button>
          <button className="formatone-clear-btn" onClick={handleClear}><FaEraser /> CLEAR</button>
        </div>
      </div>


      <div className="formatone-sheet-header">Data Entry Sheet Format 1</div>

      {/* FILTER SECTION */}
      <div className="formatone-filter-section">
        <div className="formatone-filter-group">
          <label>Select Format</label>
          <input type="text" value="File 1: Member contribution Data Entry" disabled />
        </div>
        <div className="formatone-filter-group">
          <label>Sheet Name</label>
          <select value={sheetName} onChange={(e) => setSheetName(e.target.value)}>
            {sheetNames.map((sheet, i) => (
              <option key={i} value={sheet}>{sheet}</option>
            ))}
          </select>
        </div>
        <div className="formatone-filter-group">
          <label>Search By</label>
          <select value={searchBy} onChange={(e) => handleSearchByChange(e.target.value)}>
            <option value="">--Select--</option>
            {searchOptions.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="formatone-filter-group">
          <label>Search Bar</label>
          <div className="formatone-search-input">
            <input
              type="text"
              value={searchValue}
              maxLength={7}
              onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
              placeholder="A000123"
              style={{ textTransform: 'uppercase' }}
            />
            <button className="formatone-search-btn" onClick={handleSearch}><FaSearch /></button>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="formatone-table-scroll-container">
        <div className="formatone-data-table-container">
          <table className="formatone-data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                    disabled={sheetData.length === 0}
                  />
                </th>
                <th style={{ width: '80px' }}>Action</th>
                <th style={{ width: '180px' }}>Name</th>
                <th>Batch Number</th>
                <th>Zone Code</th>
                <th>Emp Number</th>
                <th>ContPeriod</th>
                <th>Member Number</th>
                <th>RecordID</th>
                <th>PageNo</th>
                <th>Contribution</th>
              </tr>
            </thead>
            <tbody>
              {sheetData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(rowIndex)}
                      onChange={() => handleRowCheckboxChange(rowIndex)}
                    />
                  </td>
                  <td>
                    <div className="formatone-action-buttons">
                      <button className="formatone-row-action-btn formatone-add-btn" onClick={handleAddRow}><FaPlus /></button>
                      <button className="formatone-row-action-btn formatone-delete-btn" onClick={() => handleRowDelete(rowIndex)} disabled={sheetData.length <= 1}><FaMinus /></button>
                    </div>
                  </td>
                  {Object.entries(row).filter(([key]) => key !== 'total').map(([key, value]) => (
                    <td key={key}>
                      {key === 'recordID' ? (
                        <input
                          type="text"
                          value="5"
                          readOnly
                          style={{
                            backgroundColor: '#eee',
                            textAlign: 'center',
                            textTransform: 'uppercase',
                            border: '1px solid #ccc',
                            borderRadius: '3px',
                            width: '100%'
                          }}
                        />
                      ) : key === 'contribution' ? (
                        <textarea
                          value={value}
                          onChange={(e) => handleInputChange(rowIndex, key, e.target.value)}
                          rows={1}
                          style={{
                            resize: 'none',
                            overflow: 'hidden',
                            width: '100%',
                            padding: '5px',
                            borderRadius: '3px',
                            textAlign: 'center',
                            ...getCellStyle(key, value)
                          }}
                          onInput={(e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleInputChange(rowIndex, key, e.target.value)}
                          style={getCellStyle(key, value)}
                        />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FormatOne;

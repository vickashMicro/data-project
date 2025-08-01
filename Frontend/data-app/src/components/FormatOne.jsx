import React, { useState, useEffect } from 'react';
import { FaSave, FaTrash, FaEraser, FaSearch, FaPlus, FaMinus } from 'react-icons/fa';
import '../styles/FormatOne.css';

const FormatOne = ({ userCode }) => {
  const [sheetData, setSheetData] = useState([]);
  const [sheetNames, setSheetNames] = useState([]);
  const [searchOptions, setSearchOptions] = useState([]);
  const [groupedRecords, setGroupedRecords] = useState([]);
  const [sheetName, setSheetName] = useState('');
  const [searchBy, setSearchBy] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saveResult, setSaveResult] = useState({ updated: 0, inserted: 0 });

  const formatNumberWithCommas = (num) => {
    if (num === '' || isNaN(num)) return '';
    return parseFloat(num).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const validateField = (field, value) => {
    if (!value) {
      if (field === 'name' || field === 'pageNo' || field === 'contributed') return true;
    }

    switch (field) {
      case 'name': return /^[A-Za-z .]+$/.test(value);
      case 'batchNumber': return /^\d{7}$/.test(value);
      case 'zoneCode': return /^[A-Z]{1}$/i.test(value);
      case 'empNumber': return /^\d{6}$/.test(value);
      case 'contributed':
        if (value.length !== 6) return false;
        const year = parseInt(value.substring(0, 4));
        const month = parseInt(value.substring(4, 6));
        return year >= 2020 && year <= 2025 && month >= 1 && month <= 12;
      case 'membersNumber': return /^\d{1,6}$/.test(value);
      case 'recordID': return /^\d{1}$/.test(value);
      case 'pageNo': return /^\d{1,2}$/.test(value);
      case 'contribution': return /^\d+$/.test(value);
      case 'salary': return true;
      default: return true;
    }
  };

  const getCellStyle = (field, value) => ({
    textTransform: 'uppercase',
    border: '1px solid #ccc',
    backgroundColor: validateField(field, value) ? 'white' : '#ffe6e6'
  });

  const getEmptyRow = (label = '') => {
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
      contribution: '',
      salary: ''
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

    fetch(`http://localhost:5000/get-grouped-records?sheetName=${sheetName}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setGroupedRecords(data.groups);
      });
  }, [sheetName]);

  const loadSavedRecords = (zoneCode, empNumber) => {
    fetch(`http://localhost:5000/get-saved-records?sheetName=${sheetName}&zoneCode=${zoneCode}&empNumber=${empNumber}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const records = data.records.map(item => ({
            name: '',
            batchNumber: item.batch_number || sheetName,
            zoneCode: item.zone_code,
            empNumber: item.emp_number,
            contributed: item.cont_period || '',
            membersNumber: item.member_number || '',
            recordID: item.record_id || '5',
            pageNo: item.page_no ? item.page_no.slice(-2) : '',
            contribution: item.contribution ? item.contribution.replace(/^0+/, '') : '',
            salary: item.contribution ? (parseInt(item.contribution) * 5).toString() : ''
          }));
          setSheetData(records);
        } else {
          alert(data.message || "No saved records found");
          setSheetData([getEmptyRow()]);
        }
      });
  };

  const fetchMembersByLabel = (label) => {
    if (!label) return;

    const isSavedRecord = label.includes('(');
    const cleanLabel = isSavedRecord ? label.split(' ')[0] : label;
    const zoneCode = cleanLabel.charAt(0);
    const empNumber = cleanLabel.substring(1);

    if (isSavedRecord) {
      loadSavedRecords(zoneCode, empNumber);
    } else {
      fetch(`http://localhost:5000/get-members-by-label?sheetName=${sheetName}&label=${cleanLabel}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const records = data.data.length === 0 ?
              [getEmptyRow(cleanLabel)] :
              data.data.map(item => ({
                name: item.name || '',
                batchNumber: sheetName,
                zoneCode,
                empNumber,
                contributed: item.cont_period || '',
                membersNumber: item.member_number || '',
                recordID: '5',
                pageNo: item.page_no ? item.page_no.slice(-2) : '',
                contribution: '',
                salary: ''
              }));
            setSheetData(records);
            setSelectedRows([]);
          } else {
            alert(data.message || "No data found.");
            setSheetData([getEmptyRow(cleanLabel)]);
          }
        });
    }
  };

  const handleSearch = () => {
    fetchMembersByLabel(searchValue);
  };

  const handleSearchByChange = (value) => {
    setSearchBy(value);
    setSearchValue('');
    if (value) fetchMembersByLabel(value);
  };

  const handleSavedRecordChange = (value) => {
    setSearchValue(value);
    setSearchBy('');
    if (value) fetchMembersByLabel(value);
  };

  const handleInputChange = (rowIndex, field, value, e) => {
    if (field === 'recordID' || field === 'batchNumber' || field === 'zoneCode' || field === 'empNumber' || field === 'salary') {
      return;
    }

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

    if (field === 'contribution') {
      const contribution = parseInt(value) || 0;
      const salary = contribution * 5;
      updatedData[rowIndex]['salary'] = salary.toString();
    }

    updatedData[rowIndex]['batchNumber'] = sheetName;
    setSheetData(updatedData);

    if (e && e.key === 'Enter') {
      const nextRowIndex = rowIndex + 1;
      if (nextRowIndex < sheetData.length) {
        const nextInput = document.querySelector(
          `tr:nth-child(${nextRowIndex + 1}) input[name="${field}"], 
           tr:nth-child(${nextRowIndex + 1}) textarea[name="${field}"]`
        );
        if (nextInput) nextInput.focus();
      }
    }
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
    setSearchBy('');
    setSearchValue('');
  };

  const handleAddRow = (index) => {
    const updated = [...sheetData];
    const newRow = getEmptyRow();
    if (searchBy || searchValue) {
      const label = searchBy || searchValue;
      newRow.zoneCode = label.charAt(0);
      newRow.empNumber = label.substring(1);
    }
    updated.splice(index + 1, 0, newRow);
    setSheetData(updated);
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

      // Skip validation for these fields
      const skipFields = ['total', 'recordID', 'salary', 'batchNumber'];

      for (const [field, value] of Object.entries(row)) {
        if (skipFields.includes(field)) continue;

        if (!validateField(field, value)) {
          alert(`Invalid value in row ${i + 1}, field "${field}". Please correct before saving.`);
          return;
        }
      }

      if (!row.contribution || isNaN(row.contribution) || parseFloat(row.contribution) <= 0) {
        alert(`Invalid contribution amount in row ${i + 1}. Please enter a valid positive number.`);
        return;
      }

      if (!row.contributed || row.contributed.length !== 6) {
        alert(`Invalid contribution period in row ${i + 1}. Format should be YYYYMM.`);
        return;
      }
    }

    try {
      // Prepare the data
      const rows = sheetData.map(row => ({
        batchNumber: sheetName,
        zoneCode: row.zoneCode,
        empNumber: row.empNumber,
        contributed: row.contributed,
        membersNumber: row.membersNumber.padStart(6, '0'),
        recordID: '5',
        pageNo: (row.pageNo || '0').padStart(4, '0'),
        contribution: (row.contribution || '0').padStart(11, '0')
      }));

      const frontendTotal = sheetData.reduce((sum, row) => sum + Number(row.contribution || 0), 0) / 100;

      const confirmSave = window.confirm(
        `You are about to save ${sheetData.length} records.\n` +
        `Total Contribution Amount: ${formatNumberWithCommas(frontendTotal)}\n\n` +
        `Do you want to proceed?`
      );

      if (!confirmSave) return;

      const response = await fetch("http://localhost:5000/save-format-one", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userCode,
          sheetName,
          rows,
          frontendTotal: frontendTotal.toFixed(2)
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save data");
      }

      if (result.success) {
        setSaveResult({
          updated: result.updated,
          inserted: result.inserted
        });
        setShowSuccessModal(true);

        if (result.mismatches && result.mismatches > 0) {
          alert(`⚠️ Contribution Mismatch Detected!\nFrontend Total: ${formatNumberWithCommas(result.frontend_total)}\nDatabase Total: ${formatNumberWithCommas(result.backend_total)}\nDifference: ${formatNumberWithCommas(result.frontend_total - result.backend_total)}\n\nA mismatch report has been generated (${sheetName}_mismatches).`);
        }

        // Refresh the saved records dropdown after saving
        if (sheetName) {
          fetch(`http://localhost:5000/get-grouped-records?sheetName=${sheetName}`)
            .then(res => res.json())
            .then(data => {
              if (data.success) setGroupedRecords(data.groups);
            });
        }

        // Auto-refresh after 3 seconds
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        alert(`❌ Failed to save data: ${result.message}`);
      }
    } catch (err) {
      console.error("Save error:", err);
      let errorMessage = `Error saving data: ${err.message}`;

      if (err.message.includes("NetworkError")) {
        errorMessage = "Network error: Please check your internet connection and try again.";
      } else if (err.message.includes("Failed to fetch")) {
        errorMessage = "Server connection failed. Please try again later.";
      } else if (err.message.includes("validation failed")) {
        errorMessage = "Data validation failed. Please check your inputs and try again.";
      }

      alert(errorMessage);
    }
  };

  const totalContribution = sheetData.reduce((acc, row) => acc + Number(row.contribution || 0), 0) / 100;

  return (
    <div className="formatone-container">
      <div className="formatone-top-section">
        <div className="formatone-info-container">
          <div className="formatone-total-rows-box">Row Count: {sheetData.length}</div>
          <div className="formatone-total-contribution-box">
            Total Contribution: {formatNumberWithCommas(totalContribution)}
          </div>
        </div>
        <div className="formatone-top-buttons">
          <button className="formatone-save-btn" onClick={handleSave}><FaSave /> SAVE</button>
          <button className="formatone-delete-btn" onClick={handleDeleteSelected}><FaTrash /> DELETE</button>
          <button className="formatone-clear-btn" onClick={handleClear}><FaEraser /> CLEAR</button>
        </div>
      </div>

      <div className="formatone-sheet-header">Data Entry Sheet Format 1</div>

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
          <label>--Select--</label>
          <select
            value={searchBy}
            onChange={(e) => handleSearchByChange(e.target.value)}
          >
            <option value="">-- Search By : --</option>
            {[...searchOptions]
              .sort((a, b) => {
          
                const aLetter = a.charAt(0).toUpperCase();
                const bLetter = b.charAt(0).toUpperCase();

                const aNum = parseInt(a.slice(1)) || 0;
                const bNum = parseInt(b.slice(1)) || 0;

                if (aLetter < bLetter) return -1;
                if (aLetter > bLetter) return 1;

                return aNum - bNum;
              })
              .map((option, i) => (
                <option key={`new-${i}`} value={option}>{option}</option>
              ))}
          </select>
        </div>
        <div className="formatone-filter-group">
          <label>Saved Records</label>
          <select
            value={searchValue}
            onChange={(e) => handleSavedRecordChange(e.target.value)}
          >
            <option value="">-- Select Saved Record --</option>
            {[...groupedRecords]
              .sort((a, b) => {

                const aLabel = a.label.split(' ')[0];
                const bLabel = b.label.split(' ')[0];

                const aLetter = aLabel.charAt(0).toUpperCase();
                const bLetter = bLabel.charAt(0).toUpperCase();

                const aNum = parseInt(aLabel.slice(1)) || 0;
                const bNum = parseInt(bLabel.slice(1)) || 0;
                if (aLetter < bLetter) return -1;
                if (aLetter > bLetter) return 1;

                return aNum - bNum;
              })
              .map((group, i) => (
                <option key={`saved-${i}`} value={group.label}>
                  {group.label}
                </option>
              ))
            }
          </select>
        </div>
        <div className="formatone-filter-group">
          <label>Search Bar</label>
          <div className="formatone-search-input">
            <input
              type="text"
              value={searchValue}
              maxLength={12}
              onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="A000123"
              style={{ textTransform: 'uppercase' }}
            />
            <button className="formatone-search-btn" onClick={handleSearch}>
              <FaSearch />
            </button>
          </div>
        </div>
      </div>

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
                <th>Salary</th>
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
                      <button className="formatone-row-action-btn formatone-add-btn" onClick={() => handleAddRow(rowIndex)}><FaPlus /></button>
                      <button className="formatone-row-action-btn formatone-delete-btn" onClick={() => handleRowDelete(rowIndex)} disabled={sheetData.length <= 1}><FaMinus /></button>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      name="name"
                      value={row.name}
                      onChange={(e) => handleInputChange(rowIndex, 'name', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleInputChange(rowIndex, 'name', e.target.value, e)}
                      style={getCellStyle('name', row.name)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.batchNumber}
                      readOnly
                      style={{
                        backgroundColor: '#eee',
                        textAlign: 'center',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        width: '100%'
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.zoneCode}
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
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.empNumber}
                      readOnly
                      style={{
                        backgroundColor: '#eee',
                        textAlign: 'center',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        width: '100%'
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="contributed"
                      value={row.contributed}
                      onChange={(e) => handleInputChange(rowIndex, 'contributed', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleInputChange(rowIndex, 'contributed', e.target.value, e)}
                      maxLength={6}
                      style={getCellStyle('contributed', row.contributed)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="membersNumber"
                      value={row.membersNumber}
                      onChange={(e) => handleInputChange(rowIndex, 'membersNumber', e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleInputChange(rowIndex, 'membersNumber', e.target.value, e)}
                      maxLength={6}
                      style={getCellStyle('membersNumber', row.membersNumber)}
                    />
                  </td>
                  <td>
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
                  </td>
                  <td>
                    <input
                      type="text"
                      name="pageNo"
                      value={row.pageNo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                        handleInputChange(rowIndex, 'pageNo', value);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleInputChange(rowIndex, 'pageNo', e.target.value, e)}
                      maxLength={2}
                      style={getCellStyle('pageNo', row.pageNo)}
                    />
                  </td>
                  <td>
                    <textarea
                      name="contribution"
                      value={row.contribution}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                        handleInputChange(rowIndex, 'contribution', value);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleInputChange(rowIndex, 'contribution', e.target.value, e)}
                      rows={1}
                      style={{
                        resize: 'none',
                        overflow: 'hidden',
                        width: '100%',
                        padding: '5px',
                        borderRadius: '3px',
                        textAlign: 'center',
                        ...getCellStyle('contribution', row.contribution)
                      }}
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.salary ? formatNumberWithCommas(parseInt(row.salary) / 100) : ''}
                      readOnly
                      style={{
                        backgroundColor: '#eee',
                        textAlign: 'right',
                        border: '1px solid #ccc',
                        borderRadius: '3px',
                        width: '100%'
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showSuccessModal && (
        <div className="success-modal">
          <div className="success-modal-content">
            <h2>Success</h2>
            <p>
              Data saved successfully!<br />
              Updated: {saveResult?.updated ?? 0} records<br />
              Inserted: {saveResult?.inserted ?? 0} records
            </p>
            <button className="modal-close-btn" onClick={() => setShowSuccessModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormatOne;
import React, { useState, useEffect } from 'react';
import '../styles/FormatTwo.css';
import { FaSave, FaTrash, FaEraser, FaSearch, FaPlus, FaMinus } from 'react-icons/fa';

const FormatTwo = ({ userCode }) => {
  const emptyRow = {
    batchNumber: '',
    zoneCode: '',
    empNumber: '',
    memNumber: '',
    lastName: '',
    initials: '',
    idNumber: '',
    idStatus: '',
    memStatus: '',
    operationCode: '',
    fullName: '',
    sexCode: '' // Field kept but not used in data operations
  };

  const [sheetData, setSheetData] = useState([emptyRow]);
  const [sheetNames, setSheetNames] = useState([]);
  const [sheetName, setSheetName] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  const [groupedRecords, setGroupedRecords] = useState([]);
  const [searchBy, setSearchBy] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [companyAddress, setCompanyAddress] = useState('');
  const [volumeSelections, setVolumeSelections] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saveResult, setSaveResult] = useState({ updated: 0, inserted: 0 });
  const [validationErrors, setValidationErrors] = useState({
    batchZoneEmp: false
  });

  const requiredFields = [
    'batchNumber',
    'zoneCode',
    'empNumber',
    'memNumber',
    'lastName',
    'memStatus',
    'operationCode'
  ];

  const validateField = (field, value) => {
    if (value === null || value === undefined) return false;
    const val = value.toString().trim();
    if (requiredFields.includes(field) && val === '') return false;

    switch (field) {
      case 'batchNumber': return /^\d{7}$/.test(val);
      case 'zoneCode': return /^[A-Z]{1}$/.test(val);
      case 'empNumber': return /^\d{6}$/.test(val);
      case 'memNumber': return /^\d{0,6}$/.test(val);
      case 'lastName': return /^[A-Z .]+$/.test(val);
      case 'initials': return val === '' || /^[A-Z ]*$/.test(val);
      case 'idNumber': return val === '' || /^(\d{9}|\d{12})$/.test(val);
      case 'idStatus': return val === '' || /^[VX]$/.test(val);
      case 'memStatus': return /^[19]$/.test(val);
      case 'operationCode': return /^[AC]$/.test(val);
      case 'fullName': return val === '' || /^[A-Z .]+$/.test(val);
      case 'sexCode': return true; // Always valid since not used
      default: return true;
    }
  };

  const getCellStyle = (field, value) => {
    const baseStyle = {
      backgroundColor: validateField(field, value) ? 'white' : '#ffe6e6',
      border: '1px solid #ccc',
      borderRadius: '3px',
      textTransform: 'uppercase',
      width: '90%',
      boxSizing: 'border-box',
      padding: '4px',
      ...(isReadOnlyField(field) ? {
        backgroundColor: '#f5f5f5',
        cursor: 'not-allowed'
      } : {})
    };

    if (['batchNumber', 'zoneCode', 'empNumber'].includes(field) && validationErrors.batchZoneEmp) {
      return {
        ...baseStyle,
        backgroundColor: '#ffcccc',
        border: '1px solid red'
      };
    }

    return baseStyle;
  };

  const isReadOnlyField = (field) => {
    return ['batchNumber', 'zoneCode', 'empNumber'].includes(field);
  };

  useEffect(() => {
    fetch('http://localhost:5000/get-sheets')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          setSheetNames(data.data);
          setSheetName(data.data[0]);
          const batchNumber = data.data[0].split('_')[0] || '';
          setSheetData([{ ...emptyRow, batchNumber }]);
        }
      })
      .catch(() => alert('Failed to load sheets'));
  }, []);

  useEffect(() => {
    if (!sheetName) return;
    const batchNumber = sheetName.split('_')[0] || '';

    fetch(`http://localhost:5000/get-group-labels?batchNumber=${batchNumber}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setSearchOptions(data.data);
      })
      .catch(() => alert('Failed to load group labels'));

    fetch(`http://localhost:5000/get-grouped-mfile-records?batchNumber=${batchNumber}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setGroupedRecords(data.groups);
      });
  }, [sheetName]);

  const validateCompanyAddress = async (batchNumber, zoneCode, empNumber) => {
    if (!batchNumber || !zoneCode || !empNumber) {
      setCompanyAddress('');
      setValidationErrors(prev => ({ ...prev, batchZoneEmp: true }));
      return false;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/validate-company-address?batchNumber=${batchNumber}&zoneCode=${zoneCode}&empNumber=${empNumber}`
      );
      const data = await response.json();

      if (data.success) {
        if (data.valid) {
          setCompanyAddress(data.address);
          setValidationErrors(prev => ({ ...prev, batchZoneEmp: false }));
          return true;
        } else {
          setCompanyAddress('No matching record found');
          setValidationErrors(prev => ({ ...prev, batchZoneEmp: true }));
          return false;
        }
      } else {
        setCompanyAddress('Validation error');
        setValidationErrors(prev => ({ ...prev, batchZoneEmp: true }));
        return false;
      }
    } catch (error) {
      setCompanyAddress('Network error');
      setValidationErrors(prev => ({ ...prev, batchZoneEmp: true }));
      return false;
    }
  };

  const loadSavedRecords = (zoneCode, empNumber) => {
    const batchNumber = sheetName.split('_')[0] || '';
    fetch(`http://localhost:5000/get-saved-mfile-records?batchNumber=${batchNumber}&zoneCode=${zoneCode}&empNumber=${empNumber}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const newData = data.records.map(item => ({
            batchNumber: item.batch_number || batchNumber,
            zoneCode: item.zone_code,
            empNumber: item.emp_number,
            memNumber: item.member_number || '',
            lastName: item.last_name || '',
            initials: item.initials || '',
            idNumber: item.id_number || '',
            idStatus: item.id_status || '',
            memStatus: item.mem_status || '1',
            operationCode: item.operation_code || 'A',
            fullName: item.full_name || '',
            sexCode: '' // Initialize as empty
          }));

          setSheetData(newData);
          setSelectedRows([]);
          setSelectAll(false);

          const newVolumeSelections = {};
          newData.forEach((_, index) => {
            newVolumeSelections[index] = ['NN'];
          });
          setVolumeSelections(newVolumeSelections);

          if (newData.length > 0) {
            validateCompanyAddress(batchNumber, newData[0].zoneCode, newData[0].empNumber);
          }
        } else {
          alert(data.message || "No saved records found");
          setSheetData([{ ...emptyRow, batchNumber }]);
        }
      });
  };

  const fetchMembersByLabel = (label) => {
    const isSavedRecord = label.includes('(');
    const cleanLabel = isSavedRecord ? label.split(' ')[0] : label;
    const zoneCode = cleanLabel.charAt(0);
    const empNumber = cleanLabel.substring(1);

    if (isSavedRecord) {
      loadSavedRecords(zoneCode, empNumber);
    } else {
      const batchNumber = sheetName.split('_')[0] || '';
      fetch(`http://localhost:5000/get-members-by-label?sheetName=${sheetName}&label=${label}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const newData = data.data.map(item => ({
              batchNumber,
              zoneCode,
              empNumber,
              memNumber: item.member_number || '',
              lastName: (item.name || '').toUpperCase(),
              initials: '',
              idNumber: item.id_number || '',
              idStatus: item.id_status || '',
              memStatus: item.mem_status || '1',
              operationCode: 'A',
              fullName: '',
              sexCode: '' // Initialize as empty
            })) || [{ ...emptyRow, batchNumber, zoneCode, empNumber }];

            setSheetData(newData);
            setSelectedRows([]);
            setSelectAll(false);
            setVolumeSelections({});

            if (newData.length > 0) {
              validateCompanyAddress(batchNumber, zoneCode, empNumber);
            }
          }
        })
        .catch(() => alert('Failed to fetch member data'));
    }
  };

  const handleSearch = () => {
    if (!searchValue) {
      alert('Please enter search value');
      return;
    }
    fetchMembersByLabel(searchValue.toUpperCase());
  };

  const handleSearchByChange = (value) => {
    setSearchBy(value);
    setSearchValue('');
    if (value) {
      fetchMembersByLabel(value.toUpperCase());
    }
  };

  const handleSavedRecordChange = (value) => {
    setSearchValue(value);
    setSearchBy('');
    if (value) fetchMembersByLabel(value);
  };

  const handleInputChange = (rowIndex, field, inputValue) => {
    if (isReadOnlyField(field)) return;

    let value = inputValue.toUpperCase();

    const maxLens = {
      batchNumber: 7,
      zoneCode: 1,
      empNumber: 6,
      memNumber: 6,
      lastName: 100,
      initials: 20,
      idNumber: 12,
      idStatus: 1,
      memStatus: 1,
      operationCode: 1,
      fullName: 100,
      sexCode: 1
    };

    if (maxLens[field] && value.length > maxLens[field]) return;

    const patterns = {
      batchNumber: /^[0-9]*$/,
      zoneCode: /^[A-Z]*$/,
      empNumber: /^[0-9]*$/,
      memNumber: /^[0-9]*$/,
      lastName: /^[A-Z .]*$/,
      initials: /^[A-Z ]*$/,
      idNumber: /^[0-9]*$/,
      idStatus: /^[VX]*$/,
      memStatus: /^[19]*$/,
      operationCode: /^[AC]*$/,
      fullName: /^[A-Z .]*$/,
      sexCode: /^[A-Z]*$/
    };

    if (patterns[field] && !patterns[field].test(value)) return;

    if (field === 'memNumber') {
      value = inputValue.replace(/\D/g, '');
      if (value.length > 6) value = value.slice(0, 6);
    }

    const updatedData = [...sheetData];
    updatedData[rowIndex][field] = value;
    setSheetData(updatedData);

    if (['batchNumber', 'zoneCode', 'empNumber'].includes(field)) {
      const batch = updatedData[rowIndex].batchNumber;
      const zone = updatedData[rowIndex].zoneCode;
      const emp = updatedData[rowIndex].empNumber;

      if (batch && zone && emp) {
        validateCompanyAddress(batch, zone, emp);
      } else {
        setCompanyAddress('');
        setValidationErrors(prev => ({ ...prev, batchZoneEmp: true }));
      }
    }
  };

  const handleAddRow = (rowIndex) => {
    const newRow = {
      ...emptyRow,
      batchNumber: sheetData[rowIndex]?.batchNumber || sheetName.split('_')[0] || '',
      zoneCode: sheetData[rowIndex]?.zoneCode || '',
      empNumber: sheetData[rowIndex]?.empNumber || '',
      memNumber: '',
      memStatus: '1',
      operationCode: 'A'
    };

    const newData = [
      ...sheetData.slice(0, rowIndex + 1),
      newRow,
      ...sheetData.slice(rowIndex + 1)
    ];

    setSheetData(newData);
  };

  const handleRowDelete = (rowIndex) => {
    if (sheetData.length <= 1) return;
    const updatedData = sheetData.filter((_, index) => index !== rowIndex);
    setSheetData(updatedData);
    setSelectedRows(prev => prev.filter(i => i !== rowIndex).map(i => (i > rowIndex ? i - 1 : i)));

    setVolumeSelections(prev => {
      const newSelections = { ...prev };
      delete newSelections[rowIndex];
      Object.keys(newSelections).forEach(key => {
        if (parseInt(key) > rowIndex) {
          newSelections[parseInt(key) - 1] = newSelections[key];
          delete newSelections[key];
        }
      });
      return newSelections;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) return;
    if (window.confirm('Are you sure you want to delete selected rows?')) {
      const updatedData = sheetData.filter((_, index) => !selectedRows.includes(index));
      setSheetData(updatedData.length > 0 ? updatedData : [{ ...emptyRow, batchNumber: sheetName.split('_')[0] || '' }]);
      setSelectedRows([]);
      setSelectAll(false);

      setVolumeSelections(prev => {
        const newSelections = {};
        let shiftAmount = 0;

        sheetData.forEach((_, index) => {
          if (selectedRows.includes(index)) {
            shiftAmount++;
          } else if (prev[index]) {
            newSelections[index - shiftAmount] = prev[index];
          }
        });

        return newSelections;
      });
    }
  };

  const handleClear = () => {
    const batchNumber = sheetName.split('_')[0] || '';
    setSheetData([{ ...emptyRow, batchNumber }]);
    setSelectedRows([]);
    setSelectAll(false);
    setCompanyAddress('');
    setVolumeSelections({});
    setValidationErrors(prev => ({ ...prev, batchZoneEmp: false }));
  };

  const handleCheckboxChange = (index) => {
    setSelectedRows(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(sheetData.map((_, index) => index));
    }
    setSelectAll(!selectAll);
  };

  const handleSheetNameChange = (e) => {
    const newSheetName = e.target.value;
    setSheetName(newSheetName);
    setSearchBy('');
    setSearchValue('');
    const batchNumber = newSheetName.split('_')[0] || '';
    setSheetData([{ ...emptyRow, batchNumber }]);
    setSelectedRows([]);
    setSelectAll(false);
    setCompanyAddress('');
    setVolumeSelections({});
    setValidationErrors(prev => ({ ...prev, batchZoneEmp: false }));
  };

  const handleVolumeChange = (rowIndex, condition) => {
    setVolumeSelections(prev => {
      const current = prev[rowIndex] || [];
      const newSelections = { ...prev };

      if (current.includes(condition)) {
        newSelections[rowIndex] = current.filter(c => c !== condition);
      } else {
        newSelections[rowIndex] = [...current, condition];
      }

      return newSelections;
    });
  };

  const validateAllRows = () => {
    if (validationErrors.batchZoneEmp) {
      return { valid: false, row: 1, field: 'batch/zone/emp combination' };
    }

    for (let i = 0; i < sheetData.length; i++) {
      if (!volumeSelections[i] || volumeSelections[i].length === 0) {
        return { valid: false, row: i + 1, field: 'volume' };
      }
    }

    for (let i = 0; i < sheetData.length; i++) {
      for (const [field, value] of Object.entries(sheetData[i])) {
        if (!validateField(field, value)) {
          return { valid: false, row: i + 1, field };
        }
      }
    }
    return { valid: true };
  };

const handleKeyDown = (e, rowIndex, field) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    
    // If not the last row, move to same field in next row
    if (rowIndex < sheetData.length - 1) {
      const nextRowField = document.getElementById(`input-${rowIndex + 1}-${field}`);
      if (nextRowField) {
        nextRowField.focus();
        nextRowField.select();
      }
    }
    // If last row, add new row and focus on same field
    else {
      handleAddRow(rowIndex);
      setTimeout(() => {
        const newRowField = document.getElementById(`input-${rowIndex + 1}-${field}`);
        if (newRowField) {
          newRowField.focus();
          newRowField.select();
        }
      }, 0);
    }
  }
};


  const handleSave = async () => {
    if (!userCode) {
      alert("User code missing. Cannot save.");
      return;
    }

    const validation = validateAllRows();
    if (!validation.valid) {
      if (validation.field === 'batch/zone/emp combination') {
        alert("Invalid batch/zone/employee combination. Please correct before saving.");
      } else if (validation.field === 'volume') {
        alert(`Please select at least one volume condition for row ${validation.row}`);
      } else {
        alert(`Invalid value in row ${validation.row}, field "${validation.field}". Please correct before saving.`);
      }
      return;
    }

    const batchNumber = sheetName.split('_')[0] || '';

    // Calculate volume counts
    const volumeCounts = { NN: 0, OI: 0, MS: 0 };
    Object.values(volumeSelections).forEach(conditions => {
      conditions.forEach(condition => {
        if (volumeCounts.hasOwnProperty(condition)) {
          volumeCounts[condition]++;
        }
      });
    });

    // Prepare rows data
    const rows = sheetData.map(row => ({
      batchNumber: row.batchNumber,
      zoneCode: row.zoneCode,
      empNumber: row.empNumber,
      memNumber: row.memNumber.padStart(6, '0'),
      lastName: row.lastName,
      initials: row.initials,
      idNumber: row.idNumber,
      idStatus: row.idStatus,
      memStatus: row.memStatus,
      operationCode: row.operationCode,
      fullName: row.fullName
    }));

    try {
      // First save the main data
      const response = await fetch("http://localhost:5000/save-format-two", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userCode,
          batchNumber,
          rows
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save main data");
      }

      if (result.success) {
        // Then save volume counts
        const volumeResponse = await fetch("http://localhost:5000/save-volume-counts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            sheetName: sheetName,  // Using sheetName instead of batchNumber
            userCode,
            counts: volumeCounts
          })
        });

        const volumeResult = await volumeResponse.json();

        if (!volumeResponse.ok) {
          throw new Error(volumeResult.message || "Failed to save volume counts");
        }

        if (volumeResult.success) {
          setSaveResult({
            updated: result.updated,
            inserted: result.inserted
          });
          setShowSuccessModal(true);
        } else {
          // If volume counts failed but main data saved
          console.error('Volume counts save failed:', volumeResult.message);
          alert(`✅ Data saved successfully but volume counts failed to update. ${volumeResult.message}`);
        }
      } else {
        throw new Error(result.message || "Unknown error saving data");
      }
    } catch (err) {
      console.error('Save error:', err);
      alert(`❌ Failed to save data: ${err.message}`);
    }
  };
  return (
    <div className="format-two-container">
      <div className="formattwo-top-section">
        <div className="formattwo-info-container">
          <div className="formattwo-total-rows-box">Total Rows: {sheetData.length}</div>
          {companyAddress && (
            <div className={`company-address-box ${validationErrors.batchZoneEmp ? 'error' : ''}`}>
              <strong>Company Address:</strong> {companyAddress}
              {validationErrors.batchZoneEmp && (
                <span className="validation-error"> (Invalid combination)</span>
              )}
            </div>
          )}
        </div>
        <div className="formattwo-top-buttons">
          <button className="formattwo-save-btn" onClick={handleSave}><FaSave /> SAVE</button>
          <button className="formattwo-delete-btn" onClick={handleDeleteSelected}><FaTrash /> DELETE</button>
          <button className="formattwo-clear-btn" onClick={handleClear}><FaEraser /> CLEAR</button>
        </div>
      </div>

      <div className="formatone-sheet-header">Data Entry Sheet Format 2 </div>

      <div className="filter-section">
        <div className="filter-group">
          <label>Select Format</label>
          <input type="text" value="File 1: Member Data Entry" disabled />
        </div>
        <div className="filter-group">
          <label>Sheet Name</label>
          <select value={sheetName} onChange={handleSheetNameChange}>
            {sheetNames.map((sheet, i) => (
              <option key={i} value={sheet}>{sheet}</option>
            ))}
          </select>
        </div>


        <div className="filter-group">
          <label>Search By</label>
          <select
            value={searchBy}
            onChange={(e) => handleSearchByChange(e.target.value)}
          >
            <option value=""> --Select-- </option>
            {searchOptions.map((option, i) => (
              <option key={`new-${i}`} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Saved Records</label>
          <select
            value={searchValue}
            onChange={(e) => handleSavedRecordChange(e.target.value)}
          >
            <option value="">-- Select Saved Record --</option>
            {groupedRecords.map((group, i) => (
              <option key={`saved-${i}`} value={group.label}>
                {group.label}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Search Bar</label>
          <div className="search-input">
            <input
              type="text"
              value={searchValue}
              maxLength={7}
              onChange={(e) => setSearchValue(e.target.value.toUpperCase())}
              placeholder="A000123"
              style={{ textTransform: 'uppercase' }}
            />
            <button className="search-btn" onClick={handleSearch}><FaSearch /></button>
          </div>
        </div>


      </div>
      <div className="table-scroll-container">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '35px' }}>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                    disabled={sheetData.length === 0}
                  />
                </th>
                <th style={{ width: '60px' }}>Action</th>
                <th style={{ width: '75px' }}>Batch Number</th>
                <th style={{ width: '55px' }}>Zone Code</th>
                <th style={{ width: '75px' }}>Emp Number</th>
                <th style={{ width: '75px' }}>Mem Number</th>
                <th style={{ width: '155px' }}>Last Name</th>
                <th style={{ width: '105px' }}>Initials</th>
                <th style={{ width: '120px' }}>ID Number</th>
                <th style={{ width: '60px' }}>ID Status</th>
                <th style={{ width: '59px' }}>Mem Status</th>
                <th style={{ width: '85px' }}>Operation Code</th>
                <th style={{ width: '175px' }}>Full Name</th>
                <th style={{ width: '59px' }}>Sex Code</th>
                <th style={{ width: '130px' }}>Volume</th>
              </tr>
            </thead>
            <tbody>
              {sheetData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(rowIndex)}
                      onChange={() => handleCheckboxChange(rowIndex)}
                    />
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="row-action-btn add-btn"
                        onClick={() => handleAddRow(rowIndex)}
                        type="button"
                        title="Add row"
                      >
                        <FaPlus />
                      </button>
                      <button
                        className="row-action-btn delete-btn"
                        onClick={() => handleRowDelete(rowIndex)}
                        disabled={sheetData.length <= 1}
                        type="button"
                        title="Delete row"
                      >
                        <FaMinus />
                      </button>
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.batchNumber}
                      onChange={(e) => handleInputChange(rowIndex, 'batchNumber', e.target.value)}
                      style={getCellStyle('batchNumber', row.batchNumber)}
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.zoneCode}
                      onChange={(e) => handleInputChange(rowIndex, 'zoneCode', e.target.value)}
                      style={getCellStyle('zoneCode', row.zoneCode)}
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.empNumber}
                      onChange={(e) => handleInputChange(rowIndex, 'empNumber', e.target.value)}
                      style={getCellStyle('empNumber', row.empNumber)}
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      id={`input-${rowIndex}-memNumber`}
                      value={row.memNumber}
                      onChange={(e) => handleInputChange(rowIndex, 'memNumber', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 'memNumber')}
                      style={getCellStyle('memNumber', row.memNumber)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      id={`input-${rowIndex}-lastName`}
                      value={row.lastName}
                      onChange={(e) => handleInputChange(rowIndex, 'lastName', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 'lastName')}
                      style={getCellStyle('lastName', row.lastName)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      id={`input-${rowIndex}-initials`}
                      value={row.initials}
                      onChange={(e) => handleInputChange(rowIndex, 'initials', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 'initials')}
                      style={getCellStyle('initials', row.initials)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      id={`input-${rowIndex}-idNumber`}
                      value={row.idNumber}
                      onChange={(e) => handleInputChange(rowIndex, 'idNumber', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 'idNumber')}
                      style={getCellStyle('idNumber', row.idNumber)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      id={`input-${rowIndex}-idStatus`}
                      value={row.idStatus}
                      onChange={(e) => handleInputChange(rowIndex, 'idStatus', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 'idStatus')}
                      style={getCellStyle('idStatus', row.idStatus)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      id={`input-${rowIndex}-memStatus`}
                      value={row.memStatus}
                      onChange={(e) => handleInputChange(rowIndex, 'memStatus', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 'memStatus')}
                      style={getCellStyle('memStatus', row.memStatus)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      id={`input-${rowIndex}-operationCode`}
                      value={row.operationCode}
                      onChange={(e) => handleInputChange(rowIndex, 'operationCode', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 'operationCode')}
                      style={getCellStyle('operationCode', row.operationCode)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      id={`input-${rowIndex}-fullName`}
                      value={row.fullName}
                      onChange={(e) => handleInputChange(rowIndex, 'fullName', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 'fullName')}
                      style={getCellStyle('fullName', row.fullName)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      id={`input-${rowIndex}-sexCode`}
                      value={row.sexCode}
                      onChange={(e) => handleInputChange(rowIndex, 'sexCode', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, 'sexCode')}
                      style={getCellStyle('sexCode', row.sexCode)}
                    />
                  </td>
                  <td>
                    <div className="volume-checkboxes">
                      {['NN', 'OI', 'MS'].map(condition => (
                        <label key={condition} className="volume-checkbox-label">
                          <input
                            type="checkbox"
                            checked={volumeSelections[rowIndex]?.includes(condition) || false}
                            onChange={() => handleVolumeChange(rowIndex, condition)}
                          />
                          {condition}
                        </label>
                      ))}
                    </div>
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
            <button
              className="modal-close-btn"
              onClick={() => {
                setShowSuccessModal(false);
                window.location.reload();
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormatTwo;
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
    sexCode: ''
  };

  const [sheetData, setSheetData] = useState([emptyRow]);
  const [sheetNames, setSheetNames] = useState([]);
  const [sheetName, setSheetName] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  const [searchBy, setSearchBy] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [companyAddress, setCompanyAddress] = useState('');
  const [volumeSelections, setVolumeSelections] = useState({}); // Track volume selections per row

  const requiredFields = [
    'batchNumber',
    'zoneCode',
    'empNumber',
    'memNumber',
    'lastName',
    'initials',
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
      case 'memNumber': return /^\d{6}$/.test(val);
      case 'lastName': return /^[A-Z .]+$/.test(val);
      case 'initials': return /^[A-Z ]*$/.test(val);
      case 'idNumber': return val === '' || /^(\d{9}|\d{12})$/.test(val);
      case 'idStatus': return val === '' || /^[VX]$/.test(val);
      case 'memStatus': return /^[19]$/.test(val);
      case 'operationCode': return /^[AC]$/.test(val);
      case 'fullName': return val === '' || /^[A-Z .]+$/.test(val);
      case 'sexCode': return true;
      default: return true;
    }
  };

  const getCellStyle = (field, value) => ({
    backgroundColor: validateField(field, value) ? 'white' : '#ffe6e6',
    border: '1px solid #ccc',
    borderRadius: '3px',
    textTransform: 'uppercase',
    width: '100%',
    boxSizing: 'border-box',
    padding: '5px'
  });

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
    fetch(`http://localhost:5000/get-group-labels?sheetName=${sheetName}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setSearchOptions(data.data);
      })
      .catch(() => alert('Failed to load group labels'));
  }, [sheetName]);

  const fetchCompanyAddress = (batchNumber, zoneCode) => {
    if (!batchNumber || !zoneCode) {
      setCompanyAddress('');
      return;
    }
    
    fetch(`http://localhost:5000/get-company-address?batchNumber=${batchNumber}&zoneCode=${zoneCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.address) {
          setCompanyAddress(data.address);
        } else {
          setCompanyAddress('Address not found');
        }
      })
      .catch(() => setCompanyAddress('Error fetching address'));
  };

  const fetchMembersByLabel = (label) => {
    fetch(`http://localhost:5000/get-members-by-label?sheetName=${sheetName}&label=${label}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const batchNumber = sheetName.split('_')[0] || '';
          const zoneCode = label.substring(0, 1).toUpperCase();
          const empNumber = label.substring(1);

          fetchCompanyAddress(batchNumber, zoneCode);

          const newData = data.data.map(item => ({
            batchNumber,
            zoneCode,
            empNumber,
            memNumber: item.member_number || '',
            lastName: (item.name || '').toUpperCase(),
            initials: '',
            idNumber: item.id_number || '',
            idStatus: item.id_status || '',
            memStatus: item.mem_status || '',
            operationCode: '',
            fullName: '',
            sexCode: item.sex_code || ''
          })) || [{ ...emptyRow, batchNumber, zoneCode, empNumber }];

          setSheetData(newData);
          setSelectedRows([]);
          setSelectAll(false);
          // Reset volume selections when loading new data
          setVolumeSelections({});
        }
      })
      .catch(() => alert('Failed to fetch member data'));
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
    setSearchValue(value);
    if (value) {
      fetchMembersByLabel(value.toUpperCase());
    }
  };

  const handleInputChange = (rowIndex, field, inputValue) => {
    let value = inputValue.toUpperCase();

    const maxLens = {
      batchNumber: 7,
      zoneCode: 1,
      empNumber: 6,
      memNumber: 6,
      lastName: 100,
      initials: 10,
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

    const updatedData = [...sheetData];
    updatedData[rowIndex][field] = value;
    setSheetData(updatedData);
  };

  const handleAddRow = () => {
    const batchNumber = sheetData[0]?.batchNumber || sheetName.split('_')[0] || '';
    const zoneCode = sheetData[0]?.zoneCode || '';
    const empNumber = sheetData[0]?.empNumber || '';
    setSheetData([...sheetData, { ...emptyRow, batchNumber, zoneCode, empNumber }]);
  };

  const handleRowDelete = (rowIndex) => {
    if (sheetData.length <= 1) return;
    const updatedData = sheetData.filter((_, index) => index !== rowIndex);
    setSheetData(updatedData);
    setSelectedRows(prev => prev.filter(i => i !== rowIndex).map(i => (i > rowIndex ? i - 1 : i)));
    
    // Remove volume selection for deleted row
    setVolumeSelections(prev => {
      const newSelections = {...prev};
      delete newSelections[rowIndex];
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
      
      // Remove volume selections for deleted rows
      setVolumeSelections(prev => {
        const newSelections = {...prev};
        selectedRows.forEach(rowIndex => {
          delete newSelections[rowIndex];
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
  };

  const handleVolumeChange = (rowIndex, condition) => {
    setVolumeSelections(prev => {
      const current = prev[rowIndex] || [];
      const newSelections = {...prev};
      
      if (current.includes(condition)) {
        newSelections[rowIndex] = current.filter(c => c !== condition);
      } else {
        newSelections[rowIndex] = [...current, condition];
      }
      
      return newSelections;
    });
  };

  const validateAllRows = () => {
    // Check if all rows have at least one volume selection
    for (let i = 0; i < sheetData.length; i++) {
      if (!volumeSelections[i] || volumeSelections[i].length === 0) {
        return { valid: false, row: i + 1, field: 'volume' };
      }
    }

    // Check other fields
    for (let i = 0; i < sheetData.length; i++) {
      for (const [field, value] of Object.entries(sheetData[i])) {
        if (!validateField(field, value)) {
          return { valid: false, row: i + 1, field };
        }
      }
    }
    return { valid: true };
  };

  const handleSave = async () => {
    if (!userCode) {
      alert("User code missing. Cannot save.");
      return;
    }

    const validation = validateAllRows();
    if (!validation.valid) {
      if (validation.field === 'volume') {
        alert(`Please select at least one volume condition for row ${validation.row}`);
      } else {
        alert(`Invalid value in row ${validation.row}, field "${validation.field}". Please correct before saving.`);
      }
      return;
    }

    // Count volume conditions
    const volumeCounts = { NN: 0, OI: 0, MS: 0 };
    Object.values(volumeSelections).forEach(conditions => {
      conditions.forEach(condition => {
        if (volumeCounts.hasOwnProperty(condition)) {
          volumeCounts[condition]++;
        }
      });
    });

    const rows = sheetData.map(row => ({ ...row }));

    try {
      // First save the main data
      const response = await fetch("http://localhost:5000/save-format-two", {
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
      
      if (result.success) {
        // Then save the volume counts
        const volumeResponse = await fetch("http://localhost:5000/save-volume-counts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            sheetName,
            userCode,
            counts: volumeCounts
          })
        });
        
        const volumeResult = await volumeResponse.json();
        
        if (volumeResult.success) {
          alert(`✅ Data saved successfully!\nUpdated: ${result.updated}\nInserted: ${result.inserted}`);
        } else {
          alert(`❌ Data saved but volume counts failed: ${volumeResult.message}`);
        }
      } else {
        alert(`❌ Error saving data: ${result.message}`);
      }
    } catch (err) {
      alert(`❌ Failed to save data: ${err.message}`);
    }
  };

  return (
    <div className="format-two-container">
      <div className="formattwo-top-section">
        <div className="formattwo-info-container">
          <div className="formattwo-total-rows-box">Total Rows: {sheetData.length}</div>
          {companyAddress && (
            <div className="company-address-box">
              <strong>Company Address:</strong> {companyAddress}
            </div>
          )}
        </div>
        <div className="formattwo-top-buttons">
          <button className="formattwo-save-btn" onClick={handleSave}><FaSave /> SAVE</button>
          <button className="formattwo-delete-btn" onClick={handleDeleteSelected}><FaTrash /> DELETE</button>
          <button className="formattwo-clear-btn" onClick={handleClear}><FaEraser /> CLEAR</button>
        </div>
      </div>

      <div className="sheet-header">Data Entry Sheet Format 2</div>

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
          <select value={searchBy} onChange={(e) => handleSearchByChange(e.target.value)}>
            <option value="">--Select--</option>
            {searchOptions.map((option, i) => (
              <option key={i} value={option}>{option}</option>
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
                <th style={{ width: '160px' }}>Last Name</th>
                <th style={{ width: '85px' }}>Initials</th>
                <th style={{ width: '120px' }}>ID Number</th>
                <th style={{ width: '60px' }}>ID Status</th>
                <th style={{ width: '60px' }}>Mem Status</th>
                <th style={{ width: '85px' }}>Operation Code</th>
                <th style={{ width: '180px' }}>Full Name</th>
                <th style={{ width: '60px' }}>Sex Code</th>
                <th style={{ width: '135px' }}>Volume</th> {/* Reduced from 120px */}
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
                      <button className="row-action-btn add-btn" onClick={handleAddRow} type="button" title="Add row"><FaPlus /></button>
                      <button className="row-action-btn delete-btn" onClick={() => handleRowDelete(rowIndex)} disabled={sheetData.length <= 1} type="button" title="Delete row"><FaMinus /></button>
                    </div>
                  </td>
                  {Object.entries(row).map(([key, value]) => (
                    <td key={`${rowIndex}-${key}`}>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleInputChange(rowIndex, key, e.target.value)}
                        style={getCellStyle(key, value)}
                      />
                    </td>
                  ))}
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
    </div>
  );
};

export default FormatTwo;
import React, { useEffect, useState, useRef } from 'react';
import { collections, addData, getData, updateData, deleteData } from '../../services/emigrantsService';
import { exportToCSV, importCSV } from '../../utils/csvUtils';
import { db } from '../../firebase';

// Import assets
import CustomNotification from './CustomNotification';
import trashIcon from './images/trash-btn.png';
import editIcon from './images/edit-btn.png';
import importIcon from './images/import-btn.png';
import exportIcon from './images/export-btn.png';
import deleteIcon from './images/delete-btn.png';
import detailsIcon from './images/details-btn.png';

// This array is now defined at the top so handleImport can use it
const educationFields = [ 
  { label: 'Year', key: 'year' }, 
  { label: 'Not of Schooling Age', key: 'notOfSchoolingAge' }, 
  { label: 'No Formal Education', key: 'noFormalEducation' }, 
  { label: 'Elementary Level', key: 'elementaryLevel' }, 
  { label: 'Elementary Graduate', key: 'elementaryGraduate' }, 
  { label: 'High School Level', key: 'highSchoolLevel' }, 
  { label: 'High School Graduate', key: 'highSchoolGraduate' }, 
  { label: 'Vocational Level', key: 'vocationalLevel' }, 
  { label: 'Vocational Graduate', key: 'vocationalGraduate' }, 
  { label: 'College Level', key: 'collegeLevel' }, 
  { label: 'College Graduate', key: 'collegeGraduate' }, 
  { label: 'Post Graduate Level', key: 'postGraduateLevel' }, 
  { label: 'Post Graduate', key: 'postGraduate' }, 
  { label: 'Non-Formal Education', key: 'nonFormalEducation' }, 
  // This label MUST match your CSV header. 
  // If your header is just "Not Reported", change this label.
  { label: 'Not Reported / No Response', key: 'notReported' } 
];

// This is the state for the 'Add New Record' form
const initialFormState = { 
  year: "", 
  notOfSchoolingAge: "", 
  noFormalEducation: "", 
  elementaryLevel: "", 
  elementaryGraduate: "", 
  highSchoolLevel: "", 
  highSchoolGraduate: "", 
  vocationalLevel: "", 
  vocationalGraduate: "", 
  collegeLevel: "", 
  collegeGraduate: "", 
  postGraduateLevel: "", 
  postGraduate: "", 
  nonFormalEducation: "", 
  notReported: "" 
};


function EducationTable() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalItem, setModalItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: '', type: 'success' });
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(initialFormState);
  const collectionRef = collections.education;

  const showNotification = (message, type = 'success') => { setNotification({ visible: true, message, type }); };
  const hideNotification = () => { setNotification({ ...notification, visible: false }); };
  const fetchData = async () => { try { const result = await getData(collectionRef); setData(result); } catch (error) { showNotification('Failed to fetch data.', 'error'); } };
  useEffect(() => { fetchData(); }, []);
  useEffect(() => { const sortDataByYear = (dataToSort, order) => [...dataToSort].sort((a, b) => (order === 'asc' ? (Number(a.year) || 0) - (Number(b.year) || 0) : (Number(b.year) || 0) - (Number(a.year) || 0))); let filtered = searchTerm === '' ? data : data.filter(item => Object.values(item).some(val => val?.toString().toLowerCase().includes(searchTerm.toLowerCase()))); setFilteredData(sortDataByYear(filtered, sortOrder)); }, [searchTerm, data, sortOrder]);
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleModalChange = (e) => setModalItem({ ...modalItem, [e.target.name]: Number(e.target.value) || 0 });
  const toggleSortOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  const handleAdd = async () => { try { const dataToAdd = Object.keys(initialFormState).reduce((acc, key) => { acc[key] = Number(form[key]) || 0; return acc; }, {}); await addData(collectionRef, dataToAdd); setForm(initialFormState); fetchData(); showNotification('Record added successfully!', 'success'); } catch (error) { showNotification('Error adding record.', 'error'); } };
  const handleSaveUpdate = async () => { if (!modalItem?.id) return; try { const dataToUpdate = { ...modalItem }; delete dataToUpdate.id; await updateData(collectionRef, modalItem.id, dataToUpdate); fetchData(); closeModal(); showNotification('Record updated successfully!', 'success'); } catch (error) { showNotification('Error updating record.', 'error'); } };
  const handleDelete = (id) => { if (id) setItemToDelete(id); };
  const confirmDelete = async () => { if (!itemToDelete) return; const id = itemToDelete; setItemToDelete(null); setIsDeleting(true); try { await deleteData(collectionRef, id); setSelectedRowId(null); fetchData(); showNotification('Record deleted successfully!', 'success'); } catch (error) { showNotification('Error deleting record.', 'error'); } finally { setIsDeleting(false); } };
  const handleDeleteAll = () => setShowDeleteAllConfirm(true);
  const confirmDeleteAll = async () => { setShowDeleteAllConfirm(false); setIsDeleting(true); try { const snapshot = await collectionRef.get(); if (snapshot.empty) { showNotification('There are no records to delete.', 'error'); setIsDeleting(false); return; } const batch = db.batch(); snapshot.docs.forEach(doc => batch.delete(doc.ref)); await batch.commit(); setSelectedRowId(null); fetchData(); showNotification(`Successfully deleted all ${snapshot.size} records.`, 'success'); } catch (error) { showNotification('Error deleting all records.', 'error'); } finally { setIsDeleting(false); } };
  
  // --- THIS IS THE NEW, CORRECTED FUNCTION ---
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsUploading(true);

    // Helper function to safely clean and convert values
    const cleanValue = (val) => {
      const strVal = String(val || '0');
      const cleaned = strVal.replace(/,/g, ''); // Remove commas
      return Number(cleaned) || 0;
    };

    try {
      const csvData = await importCSV(file);
      const batch = db.batch();

      csvData.forEach(row => {
        const newRecord = {};

        // Loop through the educationFields array to dynamically build the record
        educationFields.forEach(field => {
          // field.key is the database key (e.g., 'nonFormalEducation')
          // field.label is the CSV header (e.g., 'Non-Formal Education')

          if (field.key === 'year') {
            newRecord.year = cleanValue(row.Year || row.YEAR);
          } else {
            // Find the CSV value by checking multiple variations of the label
            // Check exact match, then try normalized versions (trim whitespace, case variations)
            const csvVal = row[field.label] || 
                           row[field.label.trim()] ||
                           row[field.label.toUpperCase()] || 
                           row[field.label.toLowerCase()] ||
                           // Also check without any special characters/spaces normalized
                           Object.keys(row).find(key => 
                             key.toLowerCase().replace(/[^a-z0-9]/g, '') === 
                             field.label.toLowerCase().replace(/[^a-z0-9]/g, '')
                           ) && row[Object.keys(row).find(key => 
                             key.toLowerCase().replace(/[^a-z0-9]/g, '') === 
                             field.label.toLowerCase().replace(/[^a-z0-9]/g, '')
                           )];
            
            newRecord[field.key] = cleanValue(csvVal);
          }
        });

        const docRef = collectionRef.doc();
        batch.set(docRef, newRecord); 
      }); 

      await batch.commit(); 
      showNotification(`Successfully imported ${csvData.length} records!`, 'success'); 
      fetchData(); 
    } catch (error) { 
      console.error("Import Error:", error);
      showNotification('Error importing CSV. Please check format.', 'error'); 
    } finally { 
      setIsUploading(false); 
      event.target.value = ''; 
    } 
  };
  // --- END OF UPDATED FUNCTION ---

  const handleExport = () => { 
    if (filteredData.length === 0) { 
      showNotification('No data to export', 'error'); 
      return; 
    }
    // FIX for export: Use educationFields to create correct headers
    const exportData = filteredData.map(row => {
      const newRow = {};
      educationFields.forEach(field => {
        // Use field.label for the CSV header and field.key to get the data
        newRow[field.label] = row[field.key] || 0;
      });
      return newRow;
    });
    exportToCSV(exportData, `education-data-${new Date().toISOString().split('T')[0]}`); 
    showNotification('Data exported successfully!', 'success'); 
  };

  const closeModal = () => { setShowModal(false); setModalItem(null); setIsEditing(false); };
  const getSelectedRow = () => data.find(row => row.id === selectedRowId);
  const handleEdit = () => { const selectedRow = getSelectedRow(); if (selectedRow) { setModalItem({ ...selectedRow }); setIsEditing(true); setShowModal(true); } };
  const handleViewDetails = () => { const selectedRow = getSelectedRow(); if (selectedRow) { setModalItem(selectedRow); setIsEditing(false); setShowModal(true); } };

  return (
    <div>
      {/* --- RENDER NOTIFICATIONS & OVERLAYS --- */}
      {notification.visible && <CustomNotification message={notification.message} type={notification.type} onClose={hideNotification} />}
      {isUploading && ( <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, flexDirection: 'column', color: 'white', gap: '20px' }}> <div style={{ border: '8px solid #f3f3f3', borderTop: '8px solid #3b82f6', borderRadius: '50%', width: '60px', height: '60px', animation: 'spin 1.5s linear infinite' }}></div><h3>Importing...</h3> </div> )}
      {isDeleting && ( <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, flexDirection: 'column', color: 'white', gap: '20px' }}> <div style={{ border: '8px solid #f3f3f3', borderTop: '8px solid #ef4444', borderRadius: '50%', width: '60px', height: '60px', animation: 'spin 1.5s linear infinite' }}></div><h3>Deleting...</h3> </div> )}
      {showDeleteAllConfirm && ( <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2500 }}> <div style={{ backgroundColor: 'white', color: '#333', padding: '32px', borderRadius: '12px', maxWidth: '450px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', textAlign: 'center' }}> <h2 style={{ marginTop: 0, color: '#dc2626' }}>⚠️ Are you absolutely sure?</h2> <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.5' }}>This will permanently delete <strong>ALL {data.length} records.</strong></p> <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'center' }}> <button onClick={() => setShowDeleteAllConfirm(false)} className="add-btn" style={{ background: '#6c757d' }}>Cancel</button> <button onClick={confirmDeleteAll} className="add-btn" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>Yes, Delete All</button> </div> </div> </div> )}
      {itemToDelete && ( <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2500 }}> <div style={{ backgroundColor: 'white', color: '#333', padding: '32px', borderRadius: '12px', maxWidth: '450px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', textAlign: 'center' }}> <h2 style={{ marginTop: 0, color: '#eab308' }}>Confirm Deletion</h2> <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.5' }}>Are you sure you want to delete this record?</p> <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'center' }}> <button onClick={() => setItemToDelete(null)} className="add-btn" style={{ background: '#6c757d' }}>Cancel</button> <button onClick={confirmDelete} className="add-btn" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>Yes, Delete</button> </div> </div> </div> )}
      
      <h2 className="content-title">Education - Data</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={handleExport} className="add-btn" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}> <img src={exportIcon} alt="Export" style={{ width: '16px', height: '16px', marginRight: '6px'}}/>Export CSV </button>
        <button onClick={() => fileInputRef.current.click()} className="add-btn" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}> <img src={importIcon} alt="Import" style={{ width: '16px', height: '16px', marginRight: '6px'}}/>Import CSV </button>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} />
        <button onClick={handleDeleteAll} className="add-btn" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}> <img src={trashIcon} alt="Delete All" style={{ width: '16px', height: '16px', marginRight: '6px'}}/>Delete All </button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={toggleSortOrder} className="add-btn" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', gap: '6px' }}> {sortOrder === 'asc' ? '📈 Year (Oldest First)' : '📉 Year (Newest First)'} </button>
        <input type="text" placeholder="🔍 Search by year or any field..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '10px 14px', border: '2px solid #dee2e6', borderRadius: '8px', fontSize: '14px', flex: '1', minWidth: '250px' }} />
        <span style={{ color: '#6c757d', fontSize: '14px' }}> Showing {filteredData.length} of {data.length} records </span>
      </div>

      <div className="add-form">
        <h3 className="form-title">Add New Record</h3>
        <div className="form-inputs">
          {/* This form now dynamically creates inputs from educationFields */}
          {educationFields.map(field => {
            // Use the label for the placeholder
            const placeholder = field.label === 'Not Reported / No Response' ? 'Not Reported' : field.label;
            return (
              <input 
                key={field.key} 
                name={field.key} 
                type="number" 
                placeholder={placeholder} 
                value={form[field.key]} 
                onChange={handleChange} 
                className="form-input" 
              />
            )
          })}
          <button onClick={handleAdd} className="add-btn">Add Record</button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={toggleSortOrder} style={{ cursor: 'pointer', userSelect: 'none' }} title="Click to sort">Year {sortOrder === 'asc' ? '▲' : '▼'}</th>
              <th>Not School Age</th>
              <th>No Formal Ed.</th>
              <th>Elem Level</th>
              <th>Elem Grad</th>
              <th>HS Level</th>
              <th>HS Grad</th>
              <th>Voc Level</th>
              <th>Voc Grad</th>
              <th>College Level</th>
              <th>College Grad</th>
              <th>Post Grad Level</th>
              <th>Post Grad</th>
              <th>Non-Formal Ed.</th>
              <th>Not Rep.</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => (
              <tr 
                key={item.id}
                className={selectedRowId === item.id ? 'selected-row' : ''}
                onClick={() => setSelectedRowId(selectedRowId === item.id ? null : item.id)}
              >
                <td style={{left: 0, backgroundColor: selectedRowId === item.id ? '#e0f2fe' : 'white', fontWeight: 'bold', zIndex: 1 }}>{item.year || 0}</td>
                <td>{item.notOfSchoolingAge || 0}</td>
                <td>{item.noFormalEducation || 0}</td>
                <td>{item.elementaryLevel || 0}</td>
                <td>{item.elementaryGraduate || 0}</td>
                <td>{item.highSchoolLevel || 0}</td>
                <td>{item.highSchoolGraduate || 0}</td>
                <td>{item.vocationalLevel || 0}</td>
                <td>{item.vocationalGraduate || 0}</td>
                <td>{item.collegeLevel || 0}</td>
                <td>{item.collegeGraduate || 0}</td>
                <td>{item.postGraduateLevel || 0}</td>
                <td>{item.postGraduate || 0}</td>
                <td>{item.nonFormalEducation || 0}</td>
                <td>{item.notReported || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRowId && (
  <>
    <style>
      {`
        @keyframes slideUp {
          from {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `}
    </style>
    <div style={{
      position: 'fixed', 
      bottom: '20px', 
      left: '50%', 
      transform: 'translateX(-50%) translateY(0)',
      display: 'flex', 
      gap: '10px', 
      backgroundColor: '#11202e', 
      backdropFilter: 'blur(10px)', 
      padding: '10px 20px', 
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)', 
      zIndex: 1000,
      alignItems: 'center', 
      color: 'white',
      animation: 'slideUp 0.3s ease-out'
    }}>
      <span>Actions for Year: <strong>{getSelectedRow()?.year}</strong></span>
      <div style={{ borderLeft: '1px solid #718096', margin: '0 10px', height: '24px' }}></div>
      <button onClick={handleViewDetails} className="action-btn" style={{ background: '#8b5cf6' }}> <img src={detailsIcon} alt="Details" style={{ width: '16px', height: '16px' }}/> </button>
      <button onClick={handleEdit} className="action-btn update-btn"> <img src={editIcon} alt="Edit" style={{ width: '16px', height: '16px' }}/> </button>
      <button onClick={() => handleDelete(selectedRowId)} className="action-btn delete-btn"> <img src={deleteIcon} alt="Delete" style={{ width: '16px', height: '16px' }}/> </button>
      <button onClick={() => setSelectedRowId(null)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer', lineHeight: 1, marginLeft: '10px' }}>&times;</button>
    </div>
  </>
)}
      
      {showModal && modalItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', color: '#333', padding: '32px', borderRadius: '12px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' }}>
            <h2 style={{ marginTop: 0, color: '#1e3c72', marginBottom: '24px' }}>{isEditing ? 'Edit Record' : 'Record Details'} - Year {modalItem.year}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Also make the modal dynamic */}
              {educationFields.map(field => {
                 const label = field.label === 'Not Reported / No Response' ? 'Not Reported' : field.label;
                 return (
                  <div key={field.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong>{label}:</strong>
                    {isEditing ? ( <input type="number" name={field.key} value={modalItem[field.key] || ''} onChange={handleModalChange} style={{ padding: '4px 8px', width: '100px', border: '1px solid #ccc', borderRadius: '4px' }} /> ) : ( <span>{modalItem[field.key] || 0}</span> )}
                  </div>
                 )
              })}
            </div>
            <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {isEditing ? ( <button onClick={handleSaveUpdate} className="action-btn" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: 'white' }}> Save Changes </button> ) : ( <button onClick={() => setIsEditing(true)} className="action-btn update-btn">Edit Record</button> )}
              <button onClick={closeModal} className="add-btn" style={{ background: '#6c757d' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EducationTable;
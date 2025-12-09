import React, { useEffect, useState, useRef } from 'react';
import { collections, addData, getData, updateData, deleteData } from '../../services/emigrantsService';
import { exportToCSV, importCSV } from '../../utils/csvUtils';
import { db } from '../../firebase';

// Import assets (assuming they are reused)
import CustomNotification from './CustomNotification';
import trashIcon from './images/trash-btn.png';
import editIcon from './images/edit-btn.png';
import importIcon from './images/import-btn.png';
import exportIcon from './images/export-btn.png';
import deleteIcon from './images/delete-btn.png';
import detailsIcon from './images/details-btn.png';

function OccupationTable() {
  // --- All state and handler functions are here and complete ---
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

  // --- MODIFIED: Updated for Occupation data ---
  const initialFormState = { year: "", professional: "", managerial: "", clerical: "", sales: "", service: "", agriculture: "", production: "", armedForces: "", housewives: "", retirees: "", students: "", minors: "", outOfSchoolYouth: "", noOccupationReported: "" };
  const [form, setForm] = useState(initialFormState);
  const collectionRef = collections.occupation; // Assuming a different Firebase collection

  // --- MODIFIED: Define fields for Occupation data ---
  const occupationFields = [
    { label: 'Year', key: 'year' },
    { label: 'Professional', key: 'professional' },
    { label: 'Managerial', key: 'managerial' },
    { label: 'Clerical', key: 'clerical' },
    { label: 'Sales', key: 'sales' },
    { label: 'Service', key: 'service' },
    { label: 'Agriculture', key: 'agriculture' },
    { label: 'Production', key: 'production' },
    { label: 'Armed Forces', key: 'armedForces' },
    { label: 'Housewives', key: 'housewives' },
    { label: 'Retirees', key: 'retirees' },
    { label: 'Students', key: 'students' },
    { label: 'Minors', key: 'minors' },
    { label: 'Out of School Youth', key: 'outOfSchoolYouth' },
    { label: 'No Occupation Reported', key: 'noOccupationReported' },
  ];

  // --- All handler functions are the same logic, but adapted via state ---
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
  
  // --- MODIFIED: handleImport maps the new CSV headers to Firestore fields ---
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const csvData = await importCSV(file);
      const batch = db.batch();
      csvData.forEach(row => {
        const docRef = collectionRef.doc();
        batch.set(docRef, {
          year: Number(row.Year) || 0,
          professional: Number(row["Prof'l"]) || 0,
          managerial: Number(row.Managerial) || 0,
          clerical: Number(row.Clerical) || 0,
          sales: Number(row.Sales) || 0,
          service: Number(row.Service) || 0,
          agriculture: Number(row.Agriculture) || 0,
          production: Number(row.Production) || 0,
          armedForces: Number(row['Armed Forces']) || 0,
          housewives: Number(row.Housewives) || 0,
          retirees: Number(row.Retirees) || 0,
          students: Number(row.Students) || 0,
          minors: Number(row.Minors) || 0,
          outOfSchoolYouth: Number(row['Out of School Youth']) || 0,
          noOccupationReported: Number(row['No Occupation Reported']) || 0
        });
      });
      await batch.commit();
      showNotification(`Successfully imported ${csvData.length} records!`, 'success');
      fetchData();
    } catch (error) {
      showNotification('Error importing CSV. Please check format.', 'error');
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };
  
  // --- MODIFIED: Updated export filename ---
  const handleExport = () => { if (filteredData.length === 0) { showNotification('No data to export', 'error'); return; } exportToCSV(filteredData, `occupation-data-${new Date().toISOString().split('T')[0]}`); showNotification('Data exported successfully!', 'success'); };
  
  const closeModal = () => { setShowModal(false); setModalItem(null); setIsEditing(false); };
  const getSelectedRow = () => data.find(row => row.id === selectedRowId);
  const handleEdit = () => { const selectedRow = getSelectedRow(); if (selectedRow) { setModalItem({ ...selectedRow }); setIsEditing(true); setShowModal(true); } };
  const handleViewDetails = () => { const selectedRow = getSelectedRow(); if (selectedRow) { setModalItem(selectedRow); setIsEditing(false); setShowModal(true); } };

  return (
    <div>
      {/* --- RENDER NOTIFICATIONS & OVERLAYS (No change needed) --- */}
      {notification.visible && <CustomNotification message={notification.message} type={notification.type} onClose={hideNotification} />}
      {isUploading && ( <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, flexDirection: 'column', color: 'white', gap: '20px' }}> <div style={{ border: '8px solid #f3f3f3', borderTop: '8px solid #3b82f6', borderRadius: '50%', width: '60px', height: '60px', animation: 'spin 1.5s linear infinite' }}></div><h3>Importing...</h3> </div> )}
      {isDeleting && ( <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, flexDirection: 'column', color: 'white', gap: '20px' }}> <div style={{ border: '8px solid #f3f3f3', borderTop: '8px solid #ef4444', borderRadius: '50%', width: '60px', height: '60px', animation: 'spin 1.5s linear infinite' }}></div><h3>Deleting...</h3> </div> )}
      {showDeleteAllConfirm && ( <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2500 }}> <div style={{ backgroundColor: 'white', color: '#333', padding: '32px', borderRadius: '12px', maxWidth: '450px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', textAlign: 'center' }}> <h2 style={{ marginTop: 0, color: '#dc2626' }}>⚠️ Are you absolutely sure?</h2> <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.5' }}>This will permanently delete <strong>ALL {data.length} records.</strong></p> <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'center' }}> <button onClick={() => setShowDeleteAllConfirm(false)} className="add-btn" style={{ background: '#6c757d' }}>Cancel</button> <button onClick={confirmDeleteAll} className="add-btn" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>Yes, Delete All</button> </div> </div> </div> )}
      {itemToDelete && ( <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2500 }}> <div style={{ backgroundColor: 'white', color: '#333', padding: '32px', borderRadius: '12px', maxWidth: '450px', width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', textAlign: 'center' }}> <h2 style={{ marginTop: 0, color: '#eab308' }}>Confirm Deletion</h2> <p style={{ color: '#4b5563', fontSize: '16px', lineHeight: '1.5' }}>Are you sure you want to delete this record?</p> <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'center' }}> <button onClick={() => setItemToDelete(null)} className="add-btn" style={{ background: '#6c757d' }}>Cancel</button> <button onClick={confirmDelete} className="add-btn" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>Yes, Delete</button> </div> </div> </div> )}
      
      {/* --- MODIFIED: Title changed --- */}
      <h2 className="content-title">Occupation - Data</h2>
      
      {/* --- Top action buttons (No change needed) --- */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={handleExport} className="add-btn" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}> <img src={exportIcon} alt="Export" style={{ width: '16px', height: '16px', marginRight: '6px'}}/>Export CSV </button>
        <button onClick={() => fileInputRef.current.click()} className="add-btn" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}> <img src={importIcon} alt="Import" style={{ width: '16px', height: '16px', marginRight: '6px'}}/>Import CSV </button>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} style={{ display: 'none' }} />
        <button onClick={handleDeleteAll} className="add-btn" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}> <img src={trashIcon} alt="Delete All" style={{ width: '16px', height: '16px', marginRight: '6px'}}/>Delete All </button>
      </div>

      {/* --- Search and sort bar (No change needed) --- */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button onClick={toggleSortOrder} className="add-btn" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', gap: '6px' }}> {sortOrder === 'asc' ? '📈 Year (Oldest First)' : '📉 Year (Newest First)'} </button>
        <input type="text" placeholder="🔍 Search by year or any field..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '10px 14px', border: '2px solid #dee2e6', borderRadius: '8px', fontSize: '14px', flex: '1', minWidth: '250px' }} />
        <span style={{ color: '#6c757d', fontSize: '14px' }}> Showing {filteredData.length} of {data.length} records </span>
      </div>

      {/* --- MODIFIED: Add form updated with new fields --- */}
      <div className="add-form">
        <h3 className="form-title">Add New Record</h3>
        <div className="form-inputs">
          {occupationFields.map(field => ( <input key={field.key} name={field.key} type="number" placeholder={field.label} value={form[field.key]} onChange={handleChange} className="form-input" /> ))}
          <button onClick={handleAdd} className="add-btn">Add Record</button>
        </div>
      </div>

      {/* --- MODIFIED: Table updated for occupation data --- */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={toggleSortOrder} style={{ cursor: 'pointer', userSelect: 'none' }} title="Click to sort">Year {sortOrder === 'asc' ? '▲' : '▼'}</th>
              <th>Prof'l</th><th>Managerial</th><th>Clerical</th><th>Sales</th><th>Service</th><th>Agri.</th><th>Prod.</th><th>Armed F.</th><th>Housewives</th><th>Retirees</th><th>Students</th><th>Minors</th><th>OSY</th><th>Not Rep.</th>
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
                <td>{item.professional || 0}</td><td>{item.managerial || 0}</td><td>{item.clerical || 0}</td><td>{item.sales || 0}</td><td>{item.service || 0}</td><td>{item.agriculture || 0}</td><td>{item.production || 0}</td><td>{item.armedForces || 0}</td><td>{item.housewives || 0}</td><td>{item.retirees || 0}</td><td>{item.students || 0}</td><td>{item.minors || 0}</td><td>{item.outOfSchoolYouth || 0}</td><td>{item.noOccupationReported || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Floating action bar (No change needed) --- */}
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
      
      {/* --- MODIFIED: Modal updated for occupation data --- */}
      {showModal && modalItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', color: '#333', padding: '32px', borderRadius: '12px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)' }}>
            <h2 style={{ marginTop: 0, color: '#1e3c72', marginBottom: '24px' }}>{isEditing ? 'Edit Record' : 'Record Details'} - Year {modalItem.year}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {occupationFields.map(field => (
                <div key={field.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <strong>{field.label}:</strong>
                  {isEditing ? ( <input type="number" name={field.key} value={modalItem[field.key] || ''} onChange={handleModalChange} style={{ padding: '4px 8px', width: '100px', border: '1px solid #ccc', borderRadius: '4px' }} /> ) : ( <span>{modalItem[field.key] || 0}</span> )}
                </div>
              ))}
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

export default OccupationTable;
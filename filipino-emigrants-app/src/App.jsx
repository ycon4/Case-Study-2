import React, { useState, useEffect } from "react";
import './App.css';
import { auth } from './firebase';

// Import your custom components
import LoginForm from './components/auth/LoginForm';
import CustomNotification from './components/tables/CustomNotification';
import AgeTable from './components/tables/AgeTable';
import AllCountriesTable from './components/tables/AllCountriesTable';
import OccupationTable from "./components/tables/OccupationTable";
import MajorCountriesTable from "./components/tables/MajorCountriesTable";
import CivilStatusTable from "./components/tables/CivilStatusTable";
import SexTable from "./components/tables/SexTable";
import EducationTable from "./components/tables/EducationTable";
import PlaceOfOriginTable from "./components/tables/PlaceOfOriginTable";
import ComparisonChart from "./components/charts/ComparisonChart";
import CompositionChart from "./components/charts/CompositionChart"; // Ensure this import is correct
import TrendChart from "./components/charts/TrendChart";
import DistributionChart from "./components/charts/DistributionChart";
import RelationshipChart from "./components/charts/RelationshipChart";
import GeographicChart from "./components/charts/GeographicChart";

import img1 from './images/img1.jpeg';


// --- NEW: Loading Component (Standardized) ---
const LoadingSpinner = () => (  
  <div className="loading-container">
    <div className="spinner"></div>
    <h3 style={{ color: '#6c757d' }}>Loading data...</h3>
  </div>
);

// --- NEW: Home Content Component ---
const HomeContent = () => (
  <div className="home-content">
    <h2 className="content-title">A Brief History of Filipino Emigration</h2>
    <div className="home-section">
      <div className="home-text">
        <h3>The Early Waves</h3>
        <p>
          The roots of Filipino emigration extend back centuries to the Manila-Galleon Trade era (1565-1815), when Filipino sailors occasionally settled in places like Louisiana, but the first major wave of migration occurred in the early 1900s following U.S. colonization of the Philippines. Between 1906 and 1934, approximately 120,000 Filipinos—predominantly young, single men who would become known as "manongs" (meaning "older brother" in Ilocano)—migrated to Hawaii and the U.S. West Coast as colonial subjects with U.S. national status. Initially recruited to work on Hawaiian sugar plantations and later in West Coast agriculture, canneries, and domestic service, these early pioneers confronted severe racial discrimination, anti-miscegenation laws that prohibited them from marrying white women, and even violent attacks during the Great Depression when they were scapegoated for taking jobs. Despite facing legal restrictions through the 1934 Tydings-McDuffie Act, which reclassified Filipinos as aliens and limited immigration to just 50 people per year, the manongs persevered, forming tight-knit community organizations and establishing a cultural foothold that would eventually pave the way for the dramatic surge in Filipino immigration following the 1965 Immigration Act. Their resilience and sacrifices created the foundation upon which one of America's largest Asian American communities would be built.
        </p>
      </div>
      <img src={img1} alt="Historic photo of Filipino farm workers" />
    </div>
    <div className="home-section reverse">
      <div className="home-text">
        <h3>Post-War and Professional Migration</h3>
        <p>
          Following World War II and the passage of the U.S. Immigration and Nationality Act of 1965, a new wave of migration began. This group consisted of professionals, particularly doctors, nurses, engineers, and other educated individuals. This "brain drain" represented a significant shift, as families began to establish permanent roots in the United States and other Western countries.
        </p>
      </div>
      <img src="https://via.placeholder.com/350x200" alt="Filipino professionals in the 1970s" />
    </div>
    <div className="home-section">
        <div className="home-text">
            <h3>The Rise of the OFW</h3>
            <p>
                Beginning in the 1970s, labor migration to the Middle East boomed. Driven by economic necessity, millions of Filipinos sought temporary employment abroad as Overseas Filipino Workers (OFWs). This phenomenon reshaped the Philippine economy through remittances and created a global diaspora with a presence in nearly every country on Earth. Today, OFWs are hailed as modern-day heroes for their sacrifices and contributions.
            </p>
        </div>
        <img src="https://via.placeholder.com/350x200" alt="OFWs at an airport" />
    </div>
  </div>
);


function App() {
  // --- STATE MANAGEMENT ---
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // --- datasetLoading is now managed by the tables, but we need a central state for the main loading spinner ---
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [notification, setNotification] = useState({ visible: false, message: '', type: 'success' });
  
  const [viewMode, setViewMode] = useState("home"); 
  const [activeTab, setActiveTab] = useState("comparison");
  const [activeDataset, setActiveDataset] = useState("age");

  // --- NOTIFICATION HELPERS ---
  const showNotification = (message, type = 'success') => { setNotification({ visible: true, message, type }); };
  const hideNotification = () => { setNotification({ ...notification, visible: false }); };

  // --- AUTHENTICATION LISTENER ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser && !loading) {
        showNotification(`Welcome, ${currentUser.email}!`, "success");
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [loading]);

  // --- LOGOUT HANDLER ---
  const handleLogout = () => {
    auth.signOut()
      .then(() => { showNotification("You have been logged out.", "success"); })
      .catch((error) => console.error("Logout Error:", error));
  };

  const tabs = [ { id: "comparison", label: "Comparison" }, { id: "composition", label: "Composition" }, { id: "trend", label: "Trend" }, { id: "distribution", label: "Distribution" }, { id: "relationship", label: "Relationship" }, { id: "geographic", label: "Geographic Representation" } ];
  const datasets = [ { id: "age", label: "Age" }, { id: "allCountries", label: "All Countries" }, { id: "occupation", label: "Occupation" }, { id: "majorCountries", label: "Major Countries" }, { id: "civilStatus", label: "Civil Status" }, { id: "sex", label: "Sex" }, { id: "education", label: "Education" }, { id: "placeOfOrigin", label: "Place of Origin" } ];
  
  // --- FIX 1: Pass activeDataset to CompositionChart and use shared loading state ---
  const renderChart = () => { 
    if (isTableLoading) return <LoadingSpinner />;

    switch (activeTab) { 
      case "comparison": 
        // ComparisonChart needs to be updated to handle the loading state internally as well
        return <ComparisonChart activeDataset={activeDataset} setIsTableLoading={setIsTableLoading} />; 
      
      case "composition": 
        // CRITICAL FIX: Pass the activeDataset prop so the chart component knows what to render.
        return <CompositionChart activeDataset={activeDataset} />; 
        
      case "trend": 
        return <TrendChart />; 
      case "distribution": 
        return <DistributionChart />; 
      case "relationship": 
        return <RelationshipChart />; 
      case "geographic": 
        return <GeographicChart />; 
      default: 
        return <ComparisonChart activeDataset={activeDataset} setIsTableLoading={setIsTableLoading} />; 
    } 
  };
  
  // --- FIX 2: Pass the central loading setter to ALL table components ---
  const renderTable = () => { 
    if (isTableLoading) return <LoadingSpinner />;
    
    switch (activeDataset) { 
      case "age": return <AgeTable setIsTableLoading={setIsTableLoading} />; 
      case "allCountries": return <AllCountriesTable setIsTableLoading={setIsTableLoading} />; 
      case "occupation": return <OccupationTable setIsTableLoading={setIsTableLoading} />; 
      case "majorCountries": return <MajorCountriesTable setIsTableLoading={setIsTableLoading} />; 
      case "civilStatus": return <CivilStatusTable setIsTableLoading={setIsTableLoading} />; 
      case "sex": return <SexTable setIsTableLoading={setIsTableLoading} />; 
      case "education": return <EducationTable setIsTableLoading={setIsTableLoading} />; 
      case "placeOfOrigin": return <PlaceOfOriginTable setIsTableLoading={setIsTableLoading} />; 
      default: return <AgeTable setIsTableLoading={setIsTableLoading} />; 
    } 
  };

  // --- RENDER LOGIC ---
  if (loading) {
    return ( <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><h2>Loading Application...</h2></div> );
  }

  return (
    <>
      {notification.visible && (
        <CustomNotification message={notification.message} type={notification.type} onClose={hideNotification} />
      )}
      
      {!user ? (
        <LoginForm />
      ) : (
        <div className="app-container">
          {/* Header */}
          <div className="header">
            <h1 className="header-title">FILIPINO-EMIGRANT ANALYTICS</h1>  
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>

          {/* View Mode Tabs */}
          <div className="view-mode-tabs">
            <button onClick={() => setViewMode("home")} className={`view-tab ${viewMode === "home" ? "active" : ""}`}>
              Home
            </button>
            <button onClick={() => { setViewMode("table"); setIsTableLoading(false); }} className={`view-tab ${viewMode === "table" ? "active" : ""}`}>
              Table View
            </button>
            <button onClick={() => { setViewMode("graphical"); setIsTableLoading(false); }} className={`view-tab ${viewMode === "graphical" ? "active" : ""}`}>
              Graphical View
            </button>
          </div>

          {/* Main Content Area */}
          <div className="main-container">
            {viewMode !== 'home' && (
              <div className="sidebar">
                {viewMode === "graphical" ? (
                  <>
                    {tabs.map((tab) => ( <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`sidebar-btn ${activeTab === tab.id ? "active" : ""}`}>{tab.label}</button> ))}
                  </>
                ) : (
                  <>
                    {datasets.map((dataset) => ( <button key={dataset.id} onClick={() => setActiveDataset(dataset.id)} className={`sidebar-btn ${activeDataset === dataset.id ? "active" : ""}`}>{dataset.label}</button> ))}
                  </>
                )}
              </div>
            )}
            
            <div className={`content-area ${viewMode === 'home' ? 'full-width' : ''}`}>
              {viewMode === 'home' && <HomeContent />}
              {viewMode === 'table' && renderTable()}
              {viewMode === 'graphical' && renderChart()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
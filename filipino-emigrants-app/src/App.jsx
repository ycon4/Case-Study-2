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
import img2 from './images/img2.jpg';
import img3 from './images/img3.jpeg';
import logo from './images/logo.png';


// --- NEW: Loading Component (Standardized) ---
const LoadingSpinner = () => (  
  <div className="loading-container">
    <div className="spinner"></div>
    <h3 style={{ color: '#6c757d' }}>Loading data...</h3>
  </div>
);



const HomeContent = () => (

  
  <div className="home-content">
    {/* Hero Section */}
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '60px 40px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated Glowing Shapes */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(240, 149, 170, 0.6) 0%, rgba(240, 149, 170, 0) 70%)',
        borderRadius: '50%',
        filter: 'blur(40px)',
        animation: 'float 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '8%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(156, 45, 169, 0.7) 0%, rgba(156, 45, 169, 0) 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'float 10s ease-in-out infinite reverse'
      }} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '350px',
        height: '350px',
        background: 'radial-gradient(circle, rgba(193, 79, 158, 0.5) 0%, rgba(193, 79, 158, 0) 70%)',
        borderRadius: '50%',
        filter: 'blur(50px)',
        animation: 'pulse 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        top: '30%',
        right: '20%',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(225, 122, 162, 0.45) 0%, rgba(225, 122, 162, 0) 70%)',
        borderRadius: '50%',
        filter: 'blur(45px)',
        animation: 'float 7s ease-in-out infinite'
      }} />
      {/* Decorative background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '5%',
        width: '150px',
        height: '150px',
        background: 'rgba(240, 149, 170, 0.1)',
        borderRadius: '50%',
        filter: 'blur(40px)'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '8%',
        width: '200px',
        height: '200px',
        background: 'rgba(156, 45, 169, 0.15)',
        borderRadius: '50%',
        filter: 'blur(50px)'
      }} />

      {/* Main Content Container */}
      <div style={{
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '60px',
        alignItems: 'center',
        marginBottom: '60px'
      }}>
        {/* Left Side - Title and Subtitle */}
        <div>
          <h1 style={{
            fontSize: 'clamp(48px, 7vw, 96px)',
            fontWeight: '900',
            color: '#ffffff',
            marginBottom: '16px',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            lineHeight: '1.1',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            Filipino Emigrants Analytics
          </h1>

          <p style={{
            fontSize: '14px',
            fontWeight: '300',
            color: 'rgba(255, 255, 255, 0.7)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginTop: '20px'
          }}>
            Tracing the journeys of a global diaspora through data and history
          </p>
        </div>

        {/* Right Side - Stats Grid */}
        <div style={{
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: '20px'
}}>
  <div 
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '28px 24px',
      textAlign: 'center',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
    }}
  >
    <div style={{
      fontSize: '42px',
      fontWeight: '700',
      color: '#F095AA',
      marginBottom: '8px'
    }}>
      10M+
    </div>
    <div style={{
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.6)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>
      Overseas Filipinos
    </div>
  </div>

  <div 
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '28px 24px',
      textAlign: 'center',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
    }}
  >
    <div style={{
      fontSize: '42px',
      fontWeight: '700',
      color: '#E17AA2',
      marginBottom: '8px'
    }}>
      200+
    </div>
    <div style={{
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.6)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>
      Countries Reached
    </div>
  </div>

  <div 
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    style={{
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '28px 24px',
      textAlign: 'center',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
    }}
  >
    <div style={{
      fontSize: '42px',
      fontWeight: '700',
      color: '#C14F9E',
      marginBottom: '8px'
    }}>
      40+
    </div>
    <div style={{
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.6)',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    }}>
      Years of Migration
    </div>
  </div>
</div>
      </div>

      {/* Intro Paragraphs - Full Width Below */}
      <div style={{
        maxWidth: '1400px',
        width: '100%',
        margin: '0 auto',
        display: 'grid',
        gap: '24px'
      }}>
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '16px',
          lineHeight: '1.8'
        }}>
          The Filipino diaspora represents one of the largest and most geographically dispersed 
          migration movements in modern history. From the early manongs who braved discrimination 
          in Hawaiian plantations to today's skilled professionals serving in hospitals, 
          tech companies, and ships across the world, Filipino emigrants have left an indelible 
          mark on global society.
        </p>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '15px',
          lineHeight: '1.8'
        }}>
          This platform explores the patterns, trends, and stories behind Filipino emigration 
          through comprehensive data analysis spanning demographics, destinations, occupations, 
          and temporal shifts. Understanding these patterns helps us appreciate the resilience, 
          sacrifice, and contributions of millions of Filipinos who chose to build lives beyond 
          their homeland.
        </p>
      </div>
    </div>

    {/* History Content Section */}
    <div style={{ 
      background: '#ffffff', 
      padding: '0 40px 60px',
      borderRadius: '24px'
    }}>
      <h2 className="content-title" style={{
        marginTop: '20px',
        marginBottom: '40px',
        paddingTop: '20px'
      }}>
        A Brief History of Filipino Emigration
      </h2>
      
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
            Following World War II and the passage of the U.S. Immigration and Nationality Act of 1965, a new and distinct wave of migration emerged, marking a major turning point in global mobility patterns. This period saw the movement of highly skilled professionals—such as doctors, nurses, engineers, teachers, and other educated individuals—who sought better employment opportunities, higher wages, and improved living conditions abroad. Unlike earlier labor migrations that were often temporary, this wave was characterized by the migration of entire families who decided to settle permanently in their new countries. The phenomenon, often referred to as a “brain drain,” reflected both the growing demand for skilled workers in the United States and other Western nations and the limited professional opportunities available in many developing countries. Over time, these migrants not only contributed their expertise to their host societies but also formed thriving diaspora communities that maintained strong cultural and familial ties to their homelands.
          </p>
        </div>
        <img src={img2} alt="Historic photo of Filipino farm workers" />
      </div>
      
      <div className="home-section">
        <div className="home-text">
          <h3>The Rise of the OFW</h3>
          <p>
            Beginning in the 1970s, labor migration to the Middle East experienced a dramatic surge, marking another pivotal chapter in the history of Filipino migration. Triggered by rising unemployment and limited economic opportunities at home, millions of Filipinos sought temporary work abroad, particularly in oil-rich nations such as Saudi Arabia, the United Arab Emirates, and Kuwait. These Overseas Filipino Workers (OFWs) filled crucial roles in construction, domestic service, healthcare, and other sectors, becoming vital contributors to both their host countries and the Philippine economy. The steady flow of remittances sent back home not only supported countless Filipino families but also became a cornerstone of national economic stability. Over time, this large-scale labor migration led to the formation of a vast global Filipino diaspora, establishing communities in almost every corner of the world. Today, OFWs are widely recognized as modern-day heroes, celebrated for their resilience, hard work, and the personal sacrifices they make in pursuit of a better life for their families.
          </p>
        </div>
        <img src={img3} alt="Historic photo of Filipino farm workers" />
      </div>
    </div>

      {/* Footer Section */}
<div style={{
  // background: '#171d24',
  background: 'linear-gradient(to bottom, #171d24 0%, #6b3481 100%)',
  color: 'white',
  padding: '60px 40px 30px',
  marginTop: '60px',
  borderRadius: '24px'
}}>
  <div style={{
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '40px',
    marginBottom: '40px'
  }}>
    {/* About Section */}
    <div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '700',
        marginBottom: '16px',
        color: '#F095AA'
      }}>
        About This Platform
      </h3>
      <p style={{
        fontSize: '14px',
        lineHeight: '1.6',
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        A comprehensive analytics platform dedicated to understanding Filipino emigration patterns, 
        demographics, and trends across the globe.
      </p>
    </div>

    {/* Quick Links */}
    <div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '700',
        marginBottom: '16px',
        color: '#F095AA'
      }}>
        Quick Links
      </h3>
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0
      }}>
        <li style={{ marginBottom: '10px' }}>
          <a href="#data" style={{
            color: 'rgba(255, 255, 255, 0.7)',
            textDecoration: 'none',
            fontSize: '14px',
            transition: 'color 0.3s'
          }} onMouseOver={(e) => e.target.style.color = '#F095AA'} 
             onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}>
            Data Sources
          </a>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <a href="#methodology" style={{
            color: 'rgba(255, 255, 255, 0.7)',
            textDecoration: 'none',
            fontSize: '14px',
            transition: 'color 0.3s'
          }} onMouseOver={(e) => e.target.style.color = '#F095AA'} 
             onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}>
            Methodology
          </a>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <a href="#contact" style={{
            color: 'rgba(255, 255, 255, 0.7)',
            textDecoration: 'none',
            fontSize: '14px',
            transition: 'color 0.3s'
          }} onMouseOver={(e) => e.target.style.color = '#F095AA'} 
             onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}>
            Contact Us
          </a>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <a href="#privacy" style={{
            color: 'rgba(255, 255, 255, 0.7)',
            textDecoration: 'none',
            fontSize: '14px',
            transition: 'color 0.3s'
          }} onMouseOver={(e) => e.target.style.color = '#F095AA'} 
             onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}>
            Privacy Policy
          </a>
        </li>
      </ul>
    </div>

    {/* Resources */}
    <div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '700',
        marginBottom: '16px',
        color: '#F095AA'
      }}>
        Resources
      </h3>
      <ul style={{
        listStyle: 'none',
        padding: 0,
        margin: 0
      }}>
        <li style={{ marginBottom: '10px' }}>
          <a href="#reports" style={{
            color: 'rgba(255, 255, 255, 0.7)',
            textDecoration: 'none',
            fontSize: '14px',
            transition: 'color 0.3s'
          }} onMouseOver={(e) => e.target.style.color = '#F095AA'} 
             onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}>
            Research Reports
          </a>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <a href="#api" style={{
            color: 'rgba(255, 255, 255, 0.7)',
            textDecoration: 'none',
            fontSize: '14px',
            transition: 'color 0.3s'
          }} onMouseOver={(e) => e.target.style.color = '#F095AA'} 
             onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}>
            API Documentation
          </a>
        </li>
        <li style={{ marginBottom: '10px' }}>
          <a href="#downloads" style={{
            color: 'rgba(255, 255, 255, 0.7)',
            textDecoration: 'none',
            fontSize: '14px',
            transition: 'color 0.3s'
          }} onMouseOver={(e) => e.target.style.color = '#F095AA'} 
             onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.7)'}>
            Download Data
          </a>
        </li>
      </ul>
    </div>

    {/* Connect */}
    <div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '700',
        marginBottom: '16px',
        color: '#F095AA'
      }}>
        Connect
      </h3>
      <div style={{ display: 'flex', gap: '12px' }}>
        <a href="#" style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(240, 149, 170, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F095AA',
          textDecoration: 'none',
          transition: 'all 0.3s'
        }} onMouseOver={(e) => {
          e.currentTarget.style.background = '#F095AA';
          e.currentTarget.style.color = '#171d24';
        }} onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(240, 149, 170, 0.1)';
          e.currentTarget.style.color = '#F095AA';
        }}>
          <span style={{ fontSize: '18px' }}>f</span>
        </a>
        <a href="#" style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(240, 149, 170, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F095AA',
          textDecoration: 'none',
          transition: 'all 0.3s'
        }} onMouseOver={(e) => {
          e.currentTarget.style.background = '#F095AA';
          e.currentTarget.style.color = '#171d24';
        }} onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(240, 149, 170, 0.1)';
          e.currentTarget.style.color = '#F095AA';
        }}>
          <span style={{ fontSize: '18px' }}>𝕏</span>
        </a>
        <a href="#" style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(240, 149, 170, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F095AA',
          textDecoration: 'none',
          transition: 'all 0.3s'
        }} onMouseOver={(e) => {
          e.currentTarget.style.background = '#F095AA';
          e.currentTarget.style.color = '#171d24';
        }} onMouseOut={(e) => {
          e.currentTarget.style.background = 'rgba(240, 149, 170, 0.1)';
          e.currentTarget.style.color = '#F095AA';
        }}>
          <span style={{ fontSize: '18px' }}>in</span>
        </a>
      </div>
    </div>
  </div>

  {/* Bottom Bar */}
  <div style={{
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    paddingTop: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  }}>
    <p style={{
      fontSize: '14px',
      color: 'rgba(255, 255, 255, 0.5)',
      margin: 0
    }}>
      © 2025 Filipino Emigrants Analytics. All rights reserved.
    </p>
    <div style={{ display: 'flex', gap: '20px' }}>
      <a href="#terms" style={{
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.5)',
        textDecoration: 'none',
        transition: 'color 0.3s'
      }} onMouseOver={(e) => e.target.style.color = '#F095AA'} 
         onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.5)'}>
        Terms of Service
      </a>
      <a href="#privacy" style={{
        fontSize: '14px',
        color: 'rgba(255, 255, 255, 0.5)',
        textDecoration: 'none',
        transition: 'color 0.3s'
      }} onMouseOver={(e) => e.target.style.color = '#F095AA'} 
         onMouseOut={(e) => e.target.style.color = 'rgba(255, 255, 255, 0.5)'}>
        Privacy Policy
      </a>
    </div>
  </div>
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
            <h1 className="header-title"><img src={logo} alt="Logo" /> FILIPINO EMIGRANTS ANALYTICS</h1>  
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

// src/components/charts/ComparisonChart.js

import React, { useEffect, useState, useMemo } from 'react';
import Select from 'react-select';
import { getData, collections } from '../../services/emigrantsService';
import BubbleChart from './BubbleChart';

// --- It's good practice to have shared constants available ---
// You could move these to a separate utility file later
const countryLabels = [ 'PHILIPPINES', 'AFGHANISTAN', 'ALBANIA', 'ALGERIA', 'ANGOLA', 'ANTARCTICA', 'ARGENTINA', 'ARMENIA', 'AUSTRALIA', 'AUSTRIA', 'AZERBAIJAN', 'BAHAMAS', 'BANGLADESH', 'BELARUS', 'BELGIUM', 'BELIZE', 'BENIN', 'BHUTAN', 'BOLIVIA', 'BOSNIA AND HERZEGOVINA', 'BOTSWANA', 'BRAZIL', 'BRUNEI DARUSSALAM', 'BULGARIA', 'BURKINA', 'BURUNDI', 'CAMBODIA', 'CAMEROON', 'CANADA', 'CENTRAL AFRICAN REPUBLIC', 'CHAD', 'CHILE', 'CHINA (P.R.O.C.)', 'COLOMBIA', 'COSTA RICA', "COTE D' IVOIRE (IVORY COAST)", 'CROATIA', 'CUBA', 'CYPRUS', 'CZECH REPUBLIC', 'DEMOCRATIC REPUBLIC OF THE CONGO (ZAIRE)', 'DENMARK', 'DJIBOUTI', 'DOMINICAN REPUBLIC', 'ECUADOR', 'EGYPT', 'EL SALVADOR', 'EQUATORIAL GUINEA', 'ERITREA', 'ESTONIA', 'ETHIOPIA', 'FALKLAND ISLANDS (MALVINAS)', 'FIJI', 'FINLAND', 'FRANCE', 'FRENCH SOUTHERN AND ANTARCTIC LANDS', 'GABON', 'GAMBIA', 'GEORGIA', 'GERMANY', 'GHANA', 'GREECE', 'GREENLAND', 'GUATEMALA', 'GUINEA', 'GUINEA BISSAU', 'GUYANA', 'HAITI', 'HONDURAS', 'HUNGARY', 'ICELAND', 'INDIA', 'INDONESIA', 'IRAN', 'IRAQ', 'IRELAND', 'ISRAEL', 'ITALY', 'JAMAICA', 'JAPAN', 'JORDAN', 'KAZAKHSTAN', 'KENYA', 'KOSOVO', 'KUWAIT', 'KYRGYZSTAN', 'LAOS', 'LATVIA', 'LEBANON', 'LESOTHO', 'LIBERIA', 'LIBYA', 'LITHUANIA', 'LUXEMBOURG', 'MACEDONIA', 'MADAGASCAR', 'MALAWI', 'MALAYSIA', 'MALI', 'MAURITANIA', 'MEXICO', 'MOLDOVA', 'MONGOLIA', 'MONTENEGRO', 'MOROCCO', 'MOZAMBIQUE', 'MYANMAR (BURMA)', 'NAMIBIA', 'NEPAL', 'NETHERLANDS', 'NEW CALEDONIA', 'NEW ZEALAND', 'NICARAGUA', 'NIGER', 'NIGERIA', 'NORTHERN CYPRUS', 'NORTH KOREA', 'NORWAY', 'OMAN', 'PAKISTAN', 'PANAMA', 'PAPUA NEW GUINEA', 'PARAGUAY', 'PERU', 'POLAND', 'PORTUGAL', 'PUERTO RICO', 'QATAR', 'REPUBLIC OF THE CONGO', 'REPUBLIC OF SERBIA', 'ROMANIA', 'RUSSIAN FEDERATION / USSR', 'RWANDA', 'SAUDI ARABIA', 'SENEGAL', 'SIERRA LEONE', 'SLOVAK REPUBLIC', 'SLOVENIA', 'SOLOMON ISLANDS', 'SOMALIA', 'SOMALILAND', 'SOUTH AFRICA', 'SOUTH KOREA', 'SOUTH SUDAN', 'SPAIN', 'SRI LANKA', 'SUDAN', 'SURINAME', 'SWAZILAND', 'SWEDEN', 'SWITZERLAND', 'SYRIA', 'TAJIKSTAN', 'TAIWAN (ROC)', 'THAILAND', 'TOGO', 'TRINIDAD AND TOBAGO', 'TUNISIA', 'TURKEY', 'TURKMENISTAN', 'UGANDA', 'UKRAINE', 'UNITED ARAB EMIRATES', 'UNITED KINGDOM', 'UNITED REPUBLIC OF TANZANIA', 'UNITED STATES OF AMERICA', 'URUGUAY', 'UZBEKISTAN', 'VANUATU', 'VENEZUELA', 'VIETNAM', 'WEST BANK', 'WESTERN SAHARA', 'YEMEN', 'ZAMBIA', 'ZIMBABWE' ];
const sanitizeKey = (label) => label.replace(/[\s/().-]/g, '_').replace(/_+/g, '_');
const allCountriesOptions = countryLabels.map(label => ({
  value: sanitizeKey(label),
  label: label
}));

// Hardcoded colors for the major countries chart
const MAJOR_COUNTRY_COLORS = {
  usa: 'rgba(239, 68, 68, 0.7)',           // Red
  canada: 'rgba(59, 130, 246, 0.7)',       // Blue
  japan: 'rgba(236, 72, 153, 0.7)',        // Pink (changed from white)
  australia: 'rgba(245, 158, 11, 0.7)',    // Amber
  italy: 'rgba(34, 197, 94, 0.7)',         // Green
  newZealand: 'rgba(20, 21, 23, 0.7)',     // Black
  unitedKingdom: 'rgba(139, 92, 246, 0.7)', // Violet
  germany: 'rgba(253, 224, 71, 0.7)',      // Yellow
  southKorea: 'rgba(219, 39, 119, 0.7)',   // Pink/Rose
  spain: 'rgba(249, 115, 22, 0.7)',        // Orange
};
const BORDER_COLORS = { japan: 'rgba(255, 255, 255, 1)' };

// Function to generate a random color for the "All Countries" chart
const generateRandomColor = () => {
  const r = Math.floor(Math.random() * 200);
  const g = Math.floor(Math.random() * 200);
  const b = Math.floor(Math.random() * 200);
  return `rgba(${r}, ${g}, ${b}, 0.7)`;
};

function ComparisonChart() {
  // --- NEW STATES ---
  const [activeChart, setActiveChart] = useState('major'); // 'major' or 'all'
  const [majorCountriesData, setMajorCountriesData] = useState([]);
  const [allCountriesData, setAllCountriesData] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]); // For the filter
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch both datasets when the component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      const majorData = await getData(collections.majorCountries);
      const allData = await getData(collections.allCountries);
      setMajorCountriesData(majorData);
      setAllCountriesData(allData);
      setIsLoading(false);
    };
    fetchAllData();
  }, []);

  // --- useMemo to process data for the Major Countries chart ---
  const majorChartData = useMemo(() => {
    if (!majorCountriesData || majorCountriesData.length === 0) return null;
    const countryKeys = Object.keys(MAJOR_COUNTRY_COLORS);
    const datasets = countryKeys.map(key => {
      const countryName = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
      return {
        label: countryName,
        data: majorCountriesData.map(item => ({
          x: Number(item.year),
          y: Number(item[key]) || 0,
          r: Math.sqrt(Number(item[key]) || 0) / 10,
        })).filter(bubble => bubble.y > 0),
        backgroundColor: MAJOR_COUNTRY_COLORS[key],
        borderColor: BORDER_COLORS[key] || MAJOR_COUNTRY_COLORS[key],
        borderWidth: BORDER_COLORS[key] ? 2 : 0,
      };
    });
    return { datasets };
  }, [majorCountriesData]);

  // --- useMemo to process data for the All Countries chart ---
  const allChartData = useMemo(() => {
    if (!allCountriesData || allCountriesData.length === 0 || selectedCountries.length === 0) {
      return { datasets: [] }; // Return an empty structure to avoid errors
    }
    const datasets = selectedCountries.map(country => {
      return {
        label: country.label,
        data: allCountriesData.map(item => ({
          x: Number(item.year),
          y: Number(item[country.value]) || 0,
          r: Math.sqrt(Number(item[country.value]) || 0) / 10,
        })).filter(bubble => bubble.y > 0),
        backgroundColor: generateRandomColor(),
      };
    });
    return { datasets };
  }, [allCountriesData, selectedCountries]);

  const chartOptions = { /* ... options remain the same ... */ };

  if (isLoading) {
    return (
      <div>
        <h2 className="content-title">Country Comparison</h2>
        <div className="chart-placeholder"><p className="placeholder-text">Loading Chart Data...</p></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="content-title">Country Comparison</h2>

      {/* --- Chart Navigation --- */}
      <div className="chart-nav">
        <button onClick={() => setActiveChart('major')} disabled={activeChart === 'major'}>
          ‹ Previous
        </button>
        <span className="chart-nav-title">
          {activeChart === 'major' ? 'Major Destinations' : 'All Destinations (Filtered)'}
        </span>
        <button onClick={() => setActiveChart('all')} disabled={activeChart === 'all'}>
          Next ›
        </button>
      </div>

      {/* --- Conditional Filter for All Countries Chart --- */}
      {activeChart === 'all' && (
        <div style={{ margin: '20px', padding: '0 20px', zIndex: 10, position: 'relative' }}>
          <Select
            isMulti
            options={allCountriesOptions}
            classNamePrefix="select"
            placeholder="Select countries to compare..."
            value={selectedCountries}
            onChange={setSelectedCountries}
          />
        </div>
      )}

      {/* --- Conditional Chart Display --- */}
      <div style={{ height: '70vh', padding: '20px' }}>
        {activeChart === 'major' && majorChartData && (
          <BubbleChart chartData={majorChartData} options={chartOptions} />
        )}
        {activeChart === 'all' && allChartData && (
          <BubbleChart chartData={allChartData} options={chartOptions} />
        )}
      </div>
    </div>
  );
}

export default ComparisonChart;
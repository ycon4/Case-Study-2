// src/components/charts/AgeStackedBarChart.js

import React, { useEffect, useState, useMemo } from 'react';
import Select from 'react-select'; 
import { getData, collections } from '../../services/emigrantsService';
import StackedBarChart from './StackedBarChart'; 

// Define colors and labels for each age group
const FIELD_MAP = {
  age14Below: { label: '14 - Below', color: '#0B0C4A', isDefault: true }, 
  age15_19: { label: '15 - 19', color: '#1B1766', isDefault: true }, 
  age20_24: { label: '20 - 24', color: '#2C2089', isDefault: true }, 
  age25_29: { label: '25 - 29', color: '#4020A0', isDefault: true }, 
  age30_34: { label: '30 - 34', color: '#5620A5', isDefault: true }, 
  age35_39: { label: '35 - 39', color: '#6B23A9', isDefault: true }, 
  age40_44: { label: '40 - 44', color: '#8426A9', isDefault: true }, 
  age45_49: { label: '45 - 49', color: '#9C2DA9', isDefault: true }, 
  age50_54: { label: '50 - 54', color: '#B23CA5', isDefault: true }, 
  age55_59: { label: '55 - 59', color: '#C14F9E', isDefault: true }, 
  age60_64: { label: '60 - 64', color: '#D16498', isDefault: true }, 
  age65_69: { label: '65 - 69', color: '#E17AA2', isDefault: true }, 
  age70Above: { label: '70 - Above', color: '#F095AA', isDefault: true }, 
  notReported: { label: 'Not Reported', color: '#F76B6B', isDefault: false } 
};


// Create options array for react-select
const selectOptions = Object.keys(FIELD_MAP).map(key => ({
    value: key,
    label: FIELD_MAP[key].label
}));

const defaultSelectedOptions = selectOptions.filter(option => FIELD_MAP[option.value].isDefault);


function AgeStackedBarChart() {
  const [data, setData] = useState([]); 
  const [chartData, setChartData] = useState(null); 
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState(defaultSelectedOptions);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const ageData = await getData(collections.age);
      const sortedData = ageData.sort((a, b) => (Number(a.year) || 0) - (Number(b.year) || 0));
      
      setData(sortedData);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length === 0 || selectedAgeGroups.length === 0) {
        setChartData(null);
        return;
    }

    const activeKeys = selectedAgeGroups.map(group => group.value);
    const labels = data.map(item => item.year);
    
    const datasets = activeKeys.map(key => ({
        label: FIELD_MAP[key].label,
        data: data.map(item => item[key] || 0),
        backgroundColor: FIELD_MAP[key].color,
    }));

    setChartData({ labels, datasets });
    
  }, [data, selectedAgeGroups]);


  // --- Chart Options: TITLE REMOVED HERE ---
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      // REMOVED THE PLUGINS.TITLE OBJECT
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { stacked: true, title: { display: true, text: 'Year' } },
      y: { stacked: true, title: { display: true, text: 'Total Number of Emigrants' } },
    },
    // Add margin to the top of the chart area to account for the external title
    layout: {
      padding: { top: 30 } 
    }
  }), []);


  if (isLoading) {
    return <div className="chart-placeholder"><p className="placeholder-text">Loading Age Stacked Bar Chart Data...</p></div>;
  }
  
  if (data.length === 0) {
    return (
      <div className="chart-placeholder">
        <p className="placeholder-text">No data records found in the database.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
        {/* --- NEW: PLAIN TEXT TITLE OUTSIDE OF CHART CANVAS --- */}
        <h3 style={{
            textAlign: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '10px' 
        }}>
            Age Composition Trend Over Years
        </h3>
        {/* --- Filter UI --- */}
        <div style={{ marginBottom: '20px', zIndex: 10, position: 'relative' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Filter Age Groups:</label>
            <Select
                isMulti
                options={selectOptions}
                placeholder="Select age groups to display..."
                value={selectedAgeGroups}
                onChange={setSelectedAgeGroups}
                menuPortalTarget={document.body}
                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            />
        </div>
        
        <div style={{ height: '70vh' }}>
            {chartData ? (
                <StackedBarChart chartData={chartData} options={chartOptions} />
            ) : (
                <div className="chart-placeholder">Select at least one age group to view the chart.</div>
            )}
        </div>
    </div>
  );
}

export default AgeStackedBarChart;
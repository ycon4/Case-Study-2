// src/components/charts/CivilStatusStackedBarChart.js

import React, { useEffect, useState, useMemo } from 'react';
import { getData, collections } from '../../services/emigrantsService';
import StackedBarChart from './StackedBarChart';

const FIELD_MAP = {
  single: { label: 'Single', color: '#0B0C4A' },
  married: { label: 'Married', color: '#4020A0' },
  widowed: { label: 'Widowed', color: '#8426A9' },
  separated: { label: 'Separated', color: '#B23CA5' },
  divorced: { label: 'Divorced', color: '#E17AA2' },
  notReported: { label: 'Not Reported', color: '#F76B6B' },
};

function CivilStatusStackedBarChart() {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const civilStatusData = await getData(collections.civilStatus);
      const sortedData = civilStatusData.sort((a, b) => (Number(a.year) || 0) - (Number(b.year) || 0));
      
      if (sortedData.length === 0) {
        setIsLoading(false);
        return;
      }

      const labels = sortedData.map(item => item.year);
      
      const datasets = Object.keys(FIELD_MAP).map(key => ({
        label: FIELD_MAP[key].label,
        data: sortedData.map(item => item[key] || 0),
        backgroundColor: FIELD_MAP[key].color,
      }));

      setChartData({ labels, datasets });
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Use useMemo to prevent unnecessary recalculations
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      // --- REMOVED: Chart.js Title Plugin ---
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { stacked: true, title: { display: true, text: 'Year' } },
      y: { stacked: true, title: { display: true, text: 'Total Number of Emigrants' } },
    },
    // --- ADDED: Layout padding to make room for external title ---
    layout: {
      padding: { top: 30 } 
    }
  }), []);

  if (isLoading) {
    return <div className="chart-placeholder"><p className="placeholder-text">Loading Civil Status Stacked Bar Chart Data...</p></div>;
  }
  
  if (!chartData || chartData.labels.length === 0) {
     return <div className="chart-placeholder"><p className="placeholder-text">No data records found in the database.</p></div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* --- REPLACED: External HTML Title --- */}
      <h3 style={{
          textAlign: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '10px' 
      }}>
          Civil Status Composition Trend Over Years
      </h3>
      {/* ------------------------------------- */}
      <div style={{ height: '70vh' }}>
        <StackedBarChart chartData={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

export default CivilStatusStackedBarChart;
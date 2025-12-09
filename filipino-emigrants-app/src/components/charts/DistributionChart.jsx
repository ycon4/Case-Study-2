// src/components/charts/DistributionChart.js

import React, { useState, useEffect } from 'react';

// Import the specific charts required for each dataset
import AgePyramidChart from './AgePyramidChart';
import OriginTreemapChart from './OriginTreemapChart';

// Define the order and mapping of the charts
const CHART_ORDER = [
    { id: 'age', label: 'Age Distribution', component: AgePyramidChart },
    { id: 'placeOfOrigin', label: 'Regional Distribution', component: OriginTreemapChart },
];

// Map for quick component lookup
const ChartMap = CHART_ORDER.reduce((acc, chart) => {
    acc[chart.id] = chart.component;
    return acc;
}, {});

// Placeholder for when a dataset is clicked but the chart isn't mapped
const PlaceholderChart = ({ dataset }) => (
    <div style={{ height: '70vh', padding: '20px', textAlign: 'center', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h3 className="content-title">Distribution Chart - {dataset.charAt(0).toUpperCase() + dataset.slice(1)}</h3>
        <p style={{ marginTop: '20px' }}>
            The visualization for this dataset is currently pending implementation.
        </p>
    </div>
);


function DistributionChart({ activeDataset }) {
    // 1. Determine the valid starting ID.
    const initialDataset = CHART_ORDER.find(c => c.id === activeDataset) 
                           ? activeDataset 
                           : CHART_ORDER[0].id; // Default to 'age'

    // 2. State to manage which chart is currently displayed (controlled by buttons)
    const [localDataset, setLocalDataset] = useState(initialDataset);

    // 3. Sync local state when the main sidebar (activeDataset) changes
    useEffect(() => {
        // Only update the local chart if the new activeDataset is in our trend list.
        if (CHART_ORDER.find(c => c.id === activeDataset)) {
            setLocalDataset(activeDataset);
        }
    }, [activeDataset]);

    const currentIndex = CHART_ORDER.findIndex(chart => chart.id === localDataset);
    const ChartComponent = ChartMap[localDataset];

    const handleNavigation = (direction) => {
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < CHART_ORDER.length) {
            setLocalDataset(CHART_ORDER[newIndex].id);
        }
    };
    
    // Get the current chart's full label for the navigation title
    const currentChartLabel = currentIndex !== -1 ? CHART_ORDER[currentIndex].label : CHART_ORDER[0].label;


    return (
        <div>
            <h2 className="content-title">Distribution Analysis</h2>

            {/* --- Navigation Bar (Always Renders) --- */}
            <div className="chart-nav">
                <button 
                    onClick={() => handleNavigation(-1)} 
                    disabled={currentIndex <= 0}
                >
                    &lt; Previous
                </button>
                <span className="chart-nav-title">
                    {currentChartLabel} Chart
                </span>
                <button 
                    onClick={() => handleNavigation(1)} 
                    disabled={currentIndex >= CHART_ORDER.length - 1}
                >
                    Next &gt;
                </button>
            </div>
            {/* ---------------------- */}

            {ChartComponent ? (
                <ChartComponent />
            ) : (
                <PlaceholderChart dataset={localDataset} />
            )}
        </div>
    );
}

export default DistributionChart;
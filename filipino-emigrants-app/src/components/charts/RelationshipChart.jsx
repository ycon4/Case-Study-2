// src/components/charts/RelationshipChart.js

import React, { useState, useEffect } from 'react';
import OccupationHeatmap  from './OccupationHeatmap';
import EducationHeatmap from './EducationHeatmap';

// Define the order and mapping of the charts
const CHART_ORDER = [
    { id: 'occupation', label: 'Occupation Profile', component: OccupationHeatmap },
    { id: 'placeOfOrigin', label: 'Regional Origin Hotspots', component: EducationHeatmap },
];

// Map for quick component lookup
const ChartMap = CHART_ORDER.reduce((acc, chart) => {
    acc[chart.id] = chart.component;
    return acc;
}, {});

function RelationshipChart({ activeDataset }) {
    // 1. Determine the valid starting ID.
    const initialDataset = CHART_ORDER.find(c => c.id === activeDataset) 
                           ? activeDataset 
                           : CHART_ORDER[0].id; // Default to 'occupation'

    // 2. State to manage which chart is currently displayed
    const [localDataset, setLocalDataset] = useState(initialDataset);

    // 3. Sync local state when the main sidebar (activeDataset) changes
    useEffect(() => {
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
    
    const currentChartLabel = CHART_ORDER[currentIndex]?.label || CHART_ORDER[0].label;

    return (
        <div>
            <h2 className="content-title">Relationship Analysis</h2>

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

            {ChartComponent ? <ChartComponent /> : null}
        </div>
    );
}

export default RelationshipChart;
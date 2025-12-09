// src/components/charts/TrendChart.jsx

import React, { useState, useEffect } from 'react';
import AgeMultiLineChart from './AgeMultiLineChart';
import SexBubbleTimeline from './SexBubbleTimeline';
import MajorCountriesMultiLineChart from './MajorCountriesMultiLineChart';

// Define the order and mapping of the charts
const CHART_ORDER = [
    { id: 'age', label: 'Age Trend', component: AgeMultiLineChart },
    { id: 'sex', label: 'Sex Trend', component: SexBubbleTimeline },
    { id: 'majorCountries', label: 'Major Countries Trend', component: MajorCountriesMultiLineChart },
];

// Map for quick component lookup
const ChartMap = CHART_ORDER.reduce((acc, chart) => {
    acc[chart.id] = chart.component;
    return acc;
}, {});

// --- The Placeholder is now only a component-level fallback, not a navigation screen ---
const PlaceholderChart = () => (
    <div style={{ height: '70vh', padding: '20px', textAlign: 'center', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h3 className="content-title">Trend Chart</h3>
        <p style={{ marginTop: '20px' }}>
            No chart could be loaded. Please ensure data tables for Age, Sex, and Major Countries are populated.
        </p>
    </div>
);


function TrendChart({ activeDataset }) {
    // 1. Determine the valid starting ID. If activeDataset is NOT one of the mapped charts,
    //    it defaults to the first chart's ID ('age'). This guarantees a graph is always shown.
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
            <h2 className="content-title">Emigration Trend Analysis</h2>

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

            {/* 4. The chart component is now guaranteed to be rendered or a fallback is shown */}
            {ChartComponent ? (
                <ChartComponent />
            ) : (
                <PlaceholderChart />
            )}
        </div>
    );
}

export default TrendChart;
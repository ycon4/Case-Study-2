// src/components/charts/CompositionChart.js

import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import AgeStackedBarChart from './AgeStackedBarChart';
import CivilStatusStackedBarChart from './CivilStatusStackedBarChart';
import SexMarimekkoChart from './SexProportionalStackedBarChart';
import EducationMarimekkoChart from './EducationProportionalStackedBarChart';

// Define the order and mapping of the charts
const CHART_ORDER = [
    { id: 'age', label: 'Age', component: AgeStackedBarChart },
    { id: 'sex', label: 'Sex', component: SexMarimekkoChart },
    { id: 'civilStatus', label: 'Civil Status', component: CivilStatusStackedBarChart },
    { id: 'education', label: 'Educational Attainment', component: EducationMarimekkoChart },
];

// Map for quick component lookup
const ChartMap = CHART_ORDER.reduce((acc, chart) => {
    acc[chart.id] = chart.component;
    return acc;
}, {});

// Placeholder for when a dataset is clicked but the chart isn't mapped



function CompositionChart({ activeDataset }) {
    // State to manage which chart is currently displayed (driven by buttons)
    const [localDataset, setLocalDataset] = useState(activeDataset);

    // Sync local state when the main sidebar (activeDataset) changes
    useEffect(() => {
        setLocalDataset(activeDataset);
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
    const currentChartLabel = currentIndex !== -1 ? CHART_ORDER[currentIndex].label : 'Unknown Dataset';


    return (
        <div>
            <h2 className="content-title">Composition Analysis Charts</h2>

            {/* --- Navigation Bar --- */}
            <div className="chart-nav">
                <button 
                    onClick={() => handleNavigation(-1)} 
                    disabled={currentIndex <= 0}
                >
                    &lt; Previous
                </button>
                <span className="chart-nav-title">
                    {currentIndex !== -1 ? `${currentChartLabel} Composition Chart` : 'Select a Dataset'}
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

export default CompositionChart;
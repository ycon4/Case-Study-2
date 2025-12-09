// src/components/charts/OriginTreemapChart.js

import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { getData, collections } from '../../services/emigrantsService';

// For Vite - import and initialize inline
const initTreemap = async () => {
  const module = await import('highcharts/modules/treemap.js');
  if (module && typeof module.default === 'function') {
    module.default(Highcharts);
  } else if (module) {
    // Try calling the module itself
    module(Highcharts);
  }
};

// Initialize immediately
initTreemap().catch(console.error);

// --- NEW: Define the fields, keys, and labels from PlaceOfOriginTable.js ---
const placeLabels = [
  'ILOCOS NORTE', 'ILOCOS SUR', 'LA UNION', 'PANGASINAN', 'BATANES', 'CAGAYAN', 'ISABELA', 'NUEVA VIZCAYA', 'QUIRINO', 'AURORA', 'BATAAN', 'BULACAN', 'NUEVA ECIJA', 'PAMPANGA', 'TARLAC', 'ZAMBALES', 'BATANGAS', 'CAVITE', 'LAGUNA', 'QUEZON', 'RIZAL', 'MARINDUQUE', 'OCCIDENTAL MINDORO', 'ORIENTAL MINDORO', 'PALAWAN', 'ROMBLON', 'ALBAY', 'CAMARINES NORTE', 'CAMARINES SUR', 'CATANDUANES', 'MASBATE', 'SORSOGON', 'AKLAN', 'ANTIQUE', 'CAPIZ', 'GUIMARAS', 'ILOILO', 'NEGROS OCCIDENTAL', 'BOHOL', 'CEBU', 'NEGROS ORIENTAL', 'SIQUIJOR', 'BILIRAN', 'EASTERN SAMAR', 'LEYTE', 'NORTHERN SAMAR', 'SAMAR (WESTERN SAMAR)', 'SOUTHERN LEYTE', 'ZAMBOANGA DEL NORTE', 'ZAMBOANGA DEL SUR', 'ZAMBOANGA SIBUGAY', 'ISABELA CITY, (BASILAN) (a)', 'BUKIDNON', 'CAMIGUIN', 'LANAO DEL NORTE', 'MISAMIS OCCIDENTAL', 'MISAMIS ORIENTAL', 'COMPOSTELA VALLEY', 'DAVAO DEL NORTE', 'DAVAO DEL SUR', 'DAVAO ORIENTAL', 'COTABATO CITY (a)', 'NORTH COTABATO', 'SARANGANI', 'SOUTH COTABATO', 'SULTAN KUDARAT', 'AGUSAN DEL NORTE', 'AGUSAN DEL SUR', 'SURIGAO DEL NORTE (still includes Dinagat Islands) (b)', 'SURIGAO DEL SUR', 'BASILAN', 'LANAO DEL SUR', 'MAGUINDANAO (still includes Shariff Kabunsuan) (c)', 'SULU', 'TAWI-TAWI', 'ABRA', 'APAYAO', 'BENGUET', 'IFUGAO', 'KALINGA', 'MOUNTAIN PROVINCE', 'NCR'
];

// This sanitizing function MUST match the one in PlaceOfOriginTable.js
const sanitizeKey = (label) => label.replace(/[\s/().,-]/g, '_').replace(/_+/g, '_');

const placeFieldMap = placeLabels.map(label => ({
  label: label,
  key: sanitizeKey(label)
}));
// --- The old REGION_FIELDS constant is no longer needed ---


function OriginTreemapChart() {
    const [data, setData] = useState([]);
    const [years, setYears] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(null);
    const [chartOptions, setChartOptions] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // This correctly fetches the data from your table
                const originData = await getData(collections.placeOfOrigin);
                console.log("Fetched place of origin data:", originData); // DEBUG
                
                const sortedData = originData.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0)); // Newest first
                
                setData(sortedData);
                const sortedYears = sortedData.map(item => item.year).filter(Boolean);
                setYears(sortedYears);

                if (sortedYears.length > 0) {
                    setSelectedYear(sortedYears[0]); // Default to latest year
                }
            } catch (error) {
                console.error("Error fetching place of origin data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Re-calculate chart options when year changes
    useEffect(() => {
        if (!selectedYear || data.length === 0) return;

        const dataYear = data.find(d => d.year === selectedYear);
        if (!dataYear) return;

        // --- UPDATE: Use placeFieldMap instead of REGION_FIELDS ---
        const values = placeFieldMap.map(place => dataYear[place.key] || 0).filter(v => v > 0);

        // Prevent errors if no data exists for that year
        if (values.length === 0) {
             setChartOptions({
                title: { text: `No Place of Origin Data for ${selectedYear}` },
                series: [],
                lang: { noData: "No data to display for the selected year." },
                noData: { style: { fontWeight: 'bold', fontSize: '18px', color: '#666' } }
            });
            return;
        }

        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        
        // Helper function to generate color based on value
        const getColor = (value) => {
            // Prevent division by zero if all values are the same
            const ratio = (maxValue - minValue === 0) ? 1 : (value - minValue) / (maxValue - minValue);
            
            // Gradient from dark blue (#0B0C4A) to pink (#F095AA)
            const r = Math.round(11 + (229 * ratio)); // 11 to 240
            const g = Math.round(12 + (137 * ratio)); // 12 to 149
            const b = Math.round(74 + (96 * ratio)); // 74 to 170
            return `rgb(${r}, ${g}, ${b})`;
        };

        // --- UPDATE: Use placeFieldMap to build treemap data ---
        const treemapData = placeFieldMap.map((place, index) => {
            const value = dataYear[place.key] || 0;
            return {
                name: place.label, // Use the proper label
                value: value,
                color: value > 0 ? getColor(value) : '#cccccc'
            };
        }).filter(item => item.value > 0); // Only show places with data

        console.log("Treemap data:", treemapData);
        console.log("Min value:", minValue);
        console.log("Max value:", maxValue);

        const options = {
            chart: { 
                type: 'treemap',
                height: '600px',
                style: {
                    fontFamily: "'Montserrat', sans-serif"
                }
            },
            title: { 
                text: `Emigrant Distribution by Place of Origin in ${selectedYear}`, 
                style: { 
                    fontSize: '20px', 
                    color: '#333', 
                    fontWeight: 'bold',
                    fontFamily: "'Montserrat', sans-serif"
                } 
            },
            tooltip: {
                style: {
                    fontFamily: "'Montserrat', sans-serif"
                },
                pointFormatter: function() {
                    return `<b>${this.value.toLocaleString()}</b> emigrants`;
                }
            },
            series: [{
                type: 'treemap',
                layoutAlgorithm: 'squarified',
                alternateStartingDirection: true,
                data: treemapData,
                levels: [{
                    level: 1,
                    dataLabels: {
                        enabled: true,
                        align: 'center',
                        verticalAlign: 'middle',
                        style: {
                            fontSize: '13px',
                            fontWeight: 'bold',
                            color: 'white',
                            textOutline: '2px contrast',
                            fontFamily: "'Montserrat', sans-serif"
                        }
                    },
                    borderWidth: 3,
                    borderColor: 'white'
                }]
            }],
            credits: {
                enabled: false
            }
        };
        setChartOptions(options);

    }, [data, selectedYear]);

    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '400px',
                fontSize: '18px',
                color: '#666'
            }}>
                <p>Loading Place of Origin Data...</p>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                minHeight: '400px',
                fontSize: '18px',
                color: '#666'
            }}>
                <p>No place of origin data available.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
            <div style={{ 
                marginBottom: '20px', 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                gap: '10px'
            }}>
                <label style={{ fontWeight: 'bold', fontSize: '16px', fontFamily: "'Montserrat', sans-serif" }}>
                    Select Year:
                </label>
                <select 
                    value={selectedYear || ''} 
                    onChange={(e) => setSelectedYear(Number(e.target.value))} 
                    style={{ 
                        padding: '10px 20px', 
                        borderRadius: '6px', 
                        border: '2px solid #dee2e6',
                        fontSize: '16px',
                        cursor: 'pointer',
                        backgroundColor: 'white'
                    }}
                >
                    {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
            </div>
            
            <div style={{ minHeight: '600px' }}>
                {chartOptions ? (
                    <HighchartsReact 
                        highcharts={Highcharts} 
                        options={chartOptions}
                        containerProps={{ style: { height: '100%', width: '100%' } }}
                    />
                ) : (
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        minHeight: '400px',
                        fontSize: '18px',
                        color: '#666'
                    }}>
                        {/* This message shows before data loads or if a year has no data */}
                        <p>Select a year to view the treemap.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OriginTreemapChart;
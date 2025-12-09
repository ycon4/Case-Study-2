// src/components/charts/OccupationHeatmap.js

import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { getData, collections } from '../../services/emigrantsService';

// --- Load the heatmap module using async import() ---
const initHeatmap = async () => {
  try {
    const module = await import('highcharts/modules/heatmap.js');
    if (module && typeof module.default === 'function') {
      module.default(Highcharts);
    }
  } catch (e) {
    console.error("Failed to dynamically load Highcharts Heatmap module.", e);
  }
};
initHeatmap();
// ---------------------------------------------------

// Define the fields, keys, and labels (Y-axis categories)
const OCCUPATION_FIELDS = [
    { key: 'professional', label: "Prof'l" },
    { key: 'managerial', label: 'Managerial' },
    { key: 'clerical', label: 'Clerical' },
    { key: 'sales', label: 'Sales' },
    { key: 'service', label: 'Service' },
    { key: 'agriculture', label: 'Agriculture' },
    { key: 'production', label: 'Production' },
    { key: 'armedForces', label: 'Armed Forces' },
    { key: 'housewives', label: 'Housewives' },
    { key: 'retirees', label: 'Retirees' },
    { key: 'students', label: 'Students' },
    { key: 'minors', label: 'Minors' },
    { key: 'outOfSchoolYouth', label: 'Out of School Youth' },
    { key: 'noOccupationReported', label: 'Not Reported' },
];
const occupationLabels = OCCUPATION_FIELDS.map(field => field.label);

// Calculate Pearson correlation coefficient between two arrays of numbers
const calculateCorrelation = (arr1, arr2) => {
    const n = arr1.length;
    if (n === 0 || n !== arr2.length) return 0;

    const sum1 = arr1.reduce((a, b) => a + b, 0);
    const sum2 = arr2.reduce((a, b) => a + b, 0);
    const sum1Sq = arr1.reduce((a, b) => a + b * b, 0);
    const sum2Sq = arr2.reduce((a, b) => a + b * b, 0);
    const pSum = arr1.reduce((a, b, i) => a + b * arr2[i], 0);

    const num = pSum - (sum1 * sum2 / n);
    const den = Math.sqrt((sum1Sq - sum1 * sum1 / n) * (sum2Sq - sum2 * sum2 / n));

    if (den === 0) return 0;
    return num / den;
};

function OccupationHeatmap() {
    const [data, setData] = useState([]);
    const [chartOptions, setChartOptions] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const occupationData = await getData(collections.occupation);
                setData(occupationData);
            } catch (error) {
                console.error("Error fetching occupation data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    // Calculate correlation matrix when data changes
    useEffect(() => {
        if (data.length === 0) return;

        // Create a time series (array of numbers) for each occupation
        const occupationTimeSeries = {};
        OCCUPATION_FIELDS.forEach(field => {
            occupationTimeSeries[field.key] = data.map(yearData => yearData[field.key] || 0);
        });

        // Calculate the correlation matrix data points: [x, y, value]
        const correlationData = [];
        OCCUPATION_FIELDS.forEach((field1, i) => {
            OCCUPATION_FIELDS.forEach((field2, j) => {
                const correlation = calculateCorrelation(
                    occupationTimeSeries[field1.key],
                    occupationTimeSeries[field2.key]
                );
                correlationData.push([i, j, correlation]);
            });
        });

        const options = {
            chart: { type: 'heatmap', height: '700px', style: { fontFamily: "'Montserrat', sans-serif" } },
            title: { text: 'Occupation Emigration Pattern Correlation Matrix', style: { fontSize: '20px', color: '#333', fontWeight: 'bold', fontFamily: "'Montserrat', sans-serif" } },
            subtitle: { text: 'Shows how similar emigration patterns are between occupations over time', style: { fontSize: '14px', color: '#666', fontFamily: "'Montserrat', sans-serif" } },
            xAxis: {
                categories: occupationLabels,
                title: null,
                labels: { rotation: -45, style: { fontFamily: "'Montserrat', sans-serif", fontSize: '11px' } }
            },
            yAxis: {
                categories: occupationLabels,
                title: null,
                reversed: false,
                labels: { style: { fontFamily: "'Montserrat', sans-serif", fontSize: '11px' } }
            },
            colorAxis: {
                min: -1,
                max: 1,
                stops: [
                    [0, '#0B0C4A'],      // Dark Blue for -1 (Negative Correlation)
                    [0.5, '#FFFFFF'],    // White for 0 (No Correlation)
                    [1, '#D16498']       // Red for +1 (Positive Correlation)
                ],
                labels: { format: '{value:.2f}' }
            },
            legend: {
                align: 'right', layout: 'vertical', margin: 10, verticalAlign: 'middle', symbolHeight: 400,
                title: { text: 'Correlation<br/>Coefficient', style: { fontFamily: "'Montserrat', sans-serif", fontSize: '12px' } }
            },
            tooltip: {
                style: { fontFamily: "'Montserrat', sans-serif" },
                formatter: function() {
                    const occupation1 = this.series.xAxis.categories[this.point.x];
                    const occupation2 = this.series.yAxis.categories[this.point.y];
                    const corr = this.point.value;
                    
                    let interpretation = 'No Correlation';
                    if (corr > 0.8) interpretation = 'Very Strong Positive';
                    else if (corr > 0.6) interpretation = 'Strong Positive';
                    else if (corr > 0.4) interpretation = 'Moderate Positive';
                    else if (corr > -0.4) interpretation = 'Weak';
                    else if (corr > -0.6) interpretation = 'Moderate Negative';
                    else if (corr > -0.8) interpretation = 'Strong Negative';
                    else if (corr <= -0.8) interpretation = 'Very Strong Negative';
                    
                    return `<b>${occupation1}</b> vs <b>${occupation2}</b><br/>` +
                           `Correlation: <b>${corr.toFixed(3)}</b><br/>` +
                           `<i>${interpretation}</i>`;
                }
            },
            series: [{
                name: 'Occupation Correlation',
                borderWidth: 1,
                borderColor: '#FFFFFF',
                data: correlationData,
                dataLabels: {
                    enabled: true,
                    color: '#000000',
                    style: { textOutline: 'none', fontFamily: "'Montserrat', sans-serif", fontSize: '9px', fontWeight: 'normal' },
                    formatter: function() { return this.point.value.toFixed(2); }
                }
            }],
            credits: { enabled: false }
        };
        
        setChartOptions(options);
        setIsLoading(false);
    }, [data]);

    if (isLoading) {
        return <div className="chart-placeholder"><p className="placeholder-text">Loading Occupation Data...</p></div>;
    }

    return (
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
            <div style={{ minHeight: '700px' }}>
                {chartOptions ? (
                    <HighchartsReact 
                        highcharts={Highcharts} 
                        options={chartOptions}
                        containerProps={{ style: { height: '100%', width: '100%' } }}
                    />
                ) : (
                    <div className="chart-placeholder">No data available or calculating correlations...</div>
                )}
            </div>
        </div>
    );
}

export default OccupationHeatmap;
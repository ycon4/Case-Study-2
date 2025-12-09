// src/components/charts/EducationHeatmap.js

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

// --- FIX: Define the fields and the EXACT camelCase keys ---
const EDUCATION_FIELDS = [
  { key: 'notOfSchoolingAge', label: 'Not of Schooling Age' },
  { key: 'noFormalEducation', label: 'No Formal Education' },
  { key: 'elementaryLevel', label: 'Elementary Level' },
  { key: 'elementaryGraduate', label: 'Elementary Graduate' },
  { key: 'highSchoolLevel', label: 'High School Level' },
  { key: 'highSchoolGraduate', label: 'High School Graduate' },
  { key: 'vocationalLevel', label: 'Vocational Level' },
  { key: 'vocationalGraduate', label: 'Vocational Graduate' },
  { key: 'collegeLevel', label: 'College Level' },
  { key: 'collegeGraduate', label: 'College Graduate' },
  { key: 'postGraduateLevel', label: 'Post Graduate Level' },
  { key: 'postGraduate', label: 'Post Graduate' },
  { key: 'nonFormalEducation', label: 'Non-Formal Education' },
  { key: 'notReported', label: 'Not Reported / No Response' }
];
const educationLabels = EDUCATION_FIELDS.map(field => field.label);

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

function EducationHeatmap() {
    const [data, setData] = useState([]);
    const [chartOptions, setChartOptions] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- HOOK 1: Fetching Data ---
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true); // Set loading to true
            try {
                const educationData = await getData(collections.education);
                const sortedData = educationData.sort((a, b) => (Number(a.year) || 0) - (Number(b.year) || 0));
                setData(sortedData);
            } catch (error) {
                console.error("Error fetching education data:", error);
                setData([]); // On error, set data to empty
            } finally {
                // --- FIX: This block now runs on success OR failure ---
                setIsLoading(false); 
            }
        };
        fetchData();
    }, []); // Runs once on component mount

    // --- HOOK 2: Calculating Chart ---
    useEffect(() => {
        // --- FIX: Simplified guard. Only run if we have data ---
        if (data.length === 0) {
            setChartOptions(null); // Clear chart if no data
            return;
        }

        // Create a time series (array of numbers) for each education level
        const educationTimeSeries = {};
        EDUCATION_FIELDS.forEach(level => {
            educationTimeSeries[level.key] = data.map(yearData => 
              Number(String(yearData[level.key]).replace(/,/g, '')) || 0
            );
        });

        // Calculate the correlation matrix data points
        const correlationData = [];
        EDUCATION_FIELDS.forEach((level1, i) => {
            EDUCATION_FIELDS.forEach((level2, j) => {
                const correlation = calculateCorrelation(
                    educationTimeSeries[level1.key],
                    educationTimeSeries[level2.key]
                );
                correlationData.push([i, j, correlation]);
            });
        });

        const options = {
            chart: { type: 'heatmap', height: '700px', style: { fontFamily: "'Montserrat', sans-serif" } },
            title: { text: 'Education Attainment Correlation Matrix', style: { fontSize: '20px', color: '#333', fontWeight: 'bold', fontFamily: "'Montserrat', sans-serif" } },
            subtitle: { text: 'Shows how similar emigration patterns are between education levels over time', style: { fontSize: '14px', color: '#666', fontFamily: "'Montserrat', sans-serif" } },
            xAxis: {
                categories: educationLabels,
                title: null,
                labels: { rotation: -45, style: { fontFamily: "'Montserrat', sans-serif", fontSize: '11px' } }
            },
            yAxis: {
                categories: educationLabels,
                title: null,
                reversed: false,
                labels: { style: { fontFamily: "'Montserrat', sans-serif", fontSize: '11px' } }
            },
            colorAxis: {
                min: -1,
                max: 1,
                stops: [
                    [0, '#0B0C4A'],      // Dark Blue
                    [0.5, '#FFFFFF'],    // White
                    [1, '#D16498']       // Red
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
                    const level1 = this.series.xAxis.categories[this.point.x];
                    const level2 = this.series.yAxis.categories[this.point.y];
                    const corr = this.point.value;
                    
                    let interpretation = 'No Correlation';
                    if (corr > 0.8) interpretation = 'Very Strong Positive';
                    else if (corr > 0.6) interpretation = 'Strong Positive';
                    else if (corr > 0.4) interpretation = 'Moderate Positive';
                    else if (corr > 0.2) interpretation = 'Weak Positive';
                    else if (corr > -0.2) interpretation = 'No Correlation';
                    else if (corr > -0.4) interpretation = 'Weak Negative';
                    else if (corr > -0.6) interpretation = 'Moderate Negative';
                    else if (corr > -0.8) interpretation = 'Strong Negative';
                    else interpretation = 'Very Strong Negative';
                    
                    return `<b>${level1}</b> vs <b>${level2}</b><br/>` +
                           `Correlation: <b>${corr.toFixed(3)}</b><br/>` +
                           `<i>${interpretation}</i>`;
                }
            },
            series: [{
                name: 'Education Level Correlation',
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
        // --- FIX: No longer need to set loading false here ---
        
    }, [data]); // --- FIX: Only depends on data ---

    if (isLoading) {
        return <div className="chart-placeholder"><p className="placeholder-text">Loading Education Data...</p></div>;
    }

    // This now shows if loading is done AND data is empty
    if (data.length === 0) {
        return <div className="chart-placeholder"><p className="placeholder-text">No data available for heatmap.</p></div>;
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
                    // This will show briefly while correlations are being calculated
                    <div className="chart-placeholder">Calculating correlations...</div>
                )}
            </div>
        </div>
    );
}

export default EducationHeatmap;
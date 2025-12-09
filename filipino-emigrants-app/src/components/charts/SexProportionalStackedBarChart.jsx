// src/components/charts/SexProportionalStackedBarChart.jsx

import React, { useEffect, useState, useMemo } from 'react';
import Highcharts from 'highcharts'; // CORE LIBRARY
import HighchartsReact from 'highcharts-react-official'; // REACT WRAPPER

import { getData, collections } from '../../services/emigrantsService';

const FIELD_MAP = {
  male: { label: 'Male', key: 'male', color: '#2C2089' },      // Blue
  female: { label: 'Female', key: 'female', color: '#E17AA2' },    // Red
  notReported: { label: 'Not Reported', key: 'notReported', color: '#9ca3af' }, // Gray
};
const FIELD_KEYS = Object.keys(FIELD_MAP);

function SexProportionalStackedBarChart() {
    const [chartOptions, setChartOptions] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDataAndFormat = async () => {
            setIsLoading(true);
            
            // Fetch data
            const sexData = await getData(collections.sex);

            const sortedData = sexData.sort((a, b) => (Number(a.year) || 0) - (Number(b.year) || 0));
            if (sortedData.length === 0) {
                setIsLoading(false);
                return;
            }
            
            // Prepare Series Data
            const seriesData = FIELD_KEYS.map(key => ({
                name: FIELD_MAP[key].label,
                data: sortedData.map(item => item[key] || 0),
                color: FIELD_MAP[key].color
            }));

            // Define Highcharts Options
            const options = {
                chart: {
                    type: 'column', // Use standard column (bar) chart
                    height: '600px'
                },
                title: {
                    text: 'Gender Composition of Emigrants Over Years (Proportional Stack)',
                    style: { fontSize: '20px', color: '#333' }
                },
                xAxis: {
                    categories: sortedData.map(item => `${item.year}`), 
                    title: { text: 'Year' }
                },
                yAxis: {
                    title: { text: 'Percentage of Emigrants' },
                    min: 0,
                    max: 100,
                    labels: {
                        formatter: function() {
                            return this.value + '%';
                        }
                    }
                },
                tooltip: {
                    formatter: function() {
                        const totalYear = this.points.reduce((sum, point) => sum + point.y, 0);
                        const percentage = (this.y / totalYear) * 100;
                        return `<b>${this.series.name}</b> in **${this.x}**:<br/>` +
                               `${this.y.toLocaleString()} Emigrants (${percentage.toFixed(1)}%)`;
                    },
                    shared: true,
                },
                plotOptions: {
                    column: {
                        stacking: 'percent', // CRITICAL FIX: Stacks to 100%
                        pointPadding: 0.1, // Add slight space between columns (years)
                        groupPadding: 0.2,
                        borderWidth: 0,
                        borderColor: '#ffffff',
                    }
                },
                series: seriesData
            };

            setChartOptions(options);
            setIsLoading(false);
        };

        fetchDataAndFormat(); 
    }, []);

    if (isLoading) {
        return (
            <div className="chart-placeholder">
                <p className="placeholder-text">Loading Sex Composition Data...</p>
            </div>
        );
    }
    
    if (!chartOptions) {
        return (
             <div style={{ height: '70vh', padding: '20px', textAlign: 'center', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                <h3 className="content-title" style={{ color: '#ef4444' }}>Sex Composition: Proportional Stacked Bar Chart</h3>
                <p style={{ marginTop: '20px' }}>No data available to render the chart.</p>
            </div>
        );
    }

    // --- RENDER HIGHCHARTS ---
    return (
        <div style={{ height: '70vh', padding: '20px' }}>
             <HighchartsReact 
                highcharts={Highcharts} 
                options={chartOptions} 
                constructorType={'chart'} 
            /> 
        </div>
    );
}

export default SexProportionalStackedBarChart;
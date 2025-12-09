// src/components/charts/EducationProportionalStackedBarChart.jsx

import React, { useEffect, useState, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import Select from 'react-select'; // Import react-select

import { getData, collections } from '../../services/emigrantsService';

// Define the fields, keys, and a color palette for Education
const FIELD_MAP = {
  notOfSchoolingAge: { label: 'Not School Age', color: '#0B0C4A' },
  noFormalEducation: { label: 'No Formal Ed.', color: '#1B1766' },
  elementaryLevel: { label: 'Elem. Level', color: '#2C2089' },
  elementaryGraduate: { label: 'Elem. Graduate', color: '#4020A0' },
  highSchoolLevel: { label: 'HS Level', color: '#5620A5' },
  highSchoolGraduate: { label: 'HS Graduate', color: '#6B23A9' },
  vocationalLevel: { label: 'Voc. Level', color: '#8426A9' },
  vocationalGraduate: { label: 'Voc. Graduate', color: '#9C2DA9' },
  collegeLevel: { label: 'College Level', color: '#B23CA5' },
  collegeGraduate: { label: 'College Graduate', color: '#C14F9E' },
  postGraduateLevel: { label: 'Post-Grad Level', color: '#D16498' },
  postGraduate: { label: 'Post-Graduate', color: '#E17AA2' },
  nonFormalEducation: { label: 'Non-Formal Ed.', color: '#F095AA' },
  notReported: { label: 'Not Reported', color: '#F76B6B' },
};

const INITIAL_FIELD_KEYS = Object.keys(FIELD_MAP).filter(key => key !== 'notReported' && key !== 'notOfSchoolingAge');

// Create options array for react-select
const selectOptions = INITIAL_FIELD_KEYS.map(key => ({
    value: key,
    label: FIELD_MAP[key].label
}));

function EducationProportionalStackedBarChart() {
    const [data, setData] = useState([]);
    const [chartOptions, setChartOptions] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // State for the category filter, default to showing major fields
    const [selectedFields, setSelectedFields] = useState(selectOptions);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const educationData = await getData(collections.education);
            const sortedData = educationData.sort((a, b) => (Number(a.year) || 0) - (Number(b.year) || 0));
            setData(sortedData);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (data.length === 0 || selectedFields.length === 0) {
            setChartOptions(null);
            return;
        }

        const activeKeys = selectedFields.map(f => f.value);
        
        // Prepare Series Data based on the selected filters
        const seriesData = activeKeys.map(key => ({
            name: FIELD_MAP[key].label,
            data: data.map(item => item[key] || 0),
            color: FIELD_MAP[key].color
        }));

        // Define Highcharts Options
        const options = {
            chart: {
                type: 'column', // Standard column chart
                height: '600px'
            },
            title: {
                text: 'Educational Attainment Composition Over Years (Proportional Stack)',
                style: { fontSize: '20px', color: '#333' }
            },
            xAxis: {
                categories: data.map(item => `${item.year}`),
                title: { text: 'Year' }
            },
            yAxis: {
                title: { text: 'Percentage of Emigrants' },
                min: 0,
                max: 100,
                labels: {
                    formatter: function() { return this.value + '%'; }
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
                    stacking: 'percent', // Stacks to 100%
                    pointPadding: 0.1,
                    groupPadding: 0.2,
                    borderWidth: 0,
                }
            },
            series: seriesData
        };

        setChartOptions(options);

    }, [data, selectedFields]); // Recalculate when data or filters change

    if (isLoading) {
        return <div className="chart-placeholder"><p className="placeholder-text">Loading Educational Attainment Data...</p></div>;
    }
    
    if (data.length === 0) {
        return (
             <div style={{ height: '70vh', padding: '20px', textAlign: 'center', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                <h3 className="content-title" style={{ color: '#ef4444' }}>Educational Attainment Composition Chart</h3>
                <p style={{ marginTop: '20px' }}>No data records found in the database.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px', zIndex: 10, position: 'relative' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Filter Education Levels:</label>
                <Select
                    isMulti
                    options={selectOptions}
                    placeholder="Select education levels to display..."
                    value={selectedFields}
                    onChange={setSelectedFields}
                    menuPortalTarget={document.body} // Prevents clipping inside containers
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                />
            </div>
            
            <div style={{ height: '70vh' }}>
                {chartOptions ? (
                    <HighchartsReact 
                        highcharts={Highcharts} 
                        options={chartOptions} 
                        constructorType={'chart'} 
                    /> 
                ) : (
                    <div className="chart-placeholder">Select at least one education level to view the chart.</div>
                )}
            </div>
        </div>
    );
}

export default EducationProportionalStackedBarChart;
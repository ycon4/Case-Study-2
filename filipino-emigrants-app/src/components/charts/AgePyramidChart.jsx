// src/components/charts/AgePyramidChart.js

import React, { useEffect, useState, useMemo } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { getData, collections } from '../../services/emigrantsService';

// Define the categories (Y-axis)
const AGE_CATEGORIES = [
    '14 - Below', '15 - 19', '20 - 24', '25 - 29', '30 - 34', '35 - 39', 
    '40 - 44', '45 - 49', '50 - 54', '55 - 59', '60 - 64', '65 - 69', '70 - Above', 'Not Reported'
];

// Map data keys to the category labels
const FIELD_MAP = {
    '14 - Below': 'age14Below',
    '15 - 19': 'age15_19',
    '20 - 24': 'age20_24',
    '25 - 29': 'age25_29',
    '30 - 34': 'age30_34',
    '35 - 39': 'age35_39',
    '40 - 44': 'age40_44',
    '45 - 49': 'age45_49',
    '50 - 54': 'age50_54',
    '55 - 59': 'age55_59',
    '60 - 64': 'age60_64',
    '65 - 69': 'age65_69',
    '70 - Above': 'age70Above',
    'Not Reported': 'notReported'
};

function AgePyramidChart() {
    const [data, setData] = useState([]);
    const [years, setYears] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [year1, setYear1] = useState(null);
    const [year2, setYear2] = useState(null);
    const [chartOptions, setChartOptions] = useState(null);

    // Fetch all data and populate year selectors
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const ageData = await getData(collections.age);
            const sortedData = ageData.sort((a, b) => (Number(b.year) || 0) - (Number(a.year) || 0)); // Newest first
            
            setData(sortedData);
            const sortedYears = sortedData.map(item => item.year).filter(Boolean);
            setYears(sortedYears);

            // Set default years to compare
            if (sortedYears.length >= 2) {
                setYear1(sortedYears[1]); // e.g., 2021
                setYear2(sortedYears[0]); // e.g., 2022
            }
            
            setIsLoading(false);
        };
        fetchData();
    }, []);

    // Re-calculate chart options when years change
    useEffect(() => {
        if (!year1 || !year2 || data.length === 0) return;

        const dataYear1 = data.find(d => d.year === year1);
        const dataYear2 = data.find(d => d.year === year2);

        if (!dataYear1 || !dataYear2) return;

        const options = {
            chart: { type: 'bar' },
            title: { text: `Age Distribution Comparison: ${year1} vs ${year2}`, style: { fontSize: '20px', color: '#333' } },
            xAxis: [
                { categories: AGE_CATEGORIES, reversed: false, labels: { step: 1 } },
                { opposite: true, reversed: false, categories: AGE_CATEGORIES, linkedTo: 0, labels: { step: 1 } }
            ],
            yAxis: {
                title: { text: 'Number of Emigrants' },
                labels: {
                    formatter: function() {
                        return Math.abs(this.value); // Show positive numbers on axis
                    }
                }
            },
            plotOptions: {
                series: { stacking: 'normal' }
            },
            tooltip: {
                formatter: function() {
                    return `<b>${this.series.name} - ${this.key}</b><br/>Emigrants: ${Math.abs(this.y).toLocaleString()}`;
                }
            },
            series: [{
                name: String(year1),
                data: AGE_CATEGORIES.map(cat => (dataYear1[FIELD_MAP[cat]] || 0) * -1), // Plot as negative
                color: '#6B23A9'
            }, {
                name: String(year2),
                data: AGE_CATEGORIES.map(cat => dataYear2[FIELD_MAP[cat]] || 0), // Plot as positive
                color: '#D16498'
            }]
        };
        setChartOptions(options);

    }, [data, year1, year2]);

    if (isLoading) {
        return <div className="chart-placeholder"><p className="placeholder-text">Loading Age Data...</p></div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px', zIndex: 10, position: 'relative', display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Compare Year:</label>
                    <select value={year1} onChange={(e) => setYear1(Number(e.target.value))} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        {years.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>With Year:</label>
                    <select value={year2} onChange={(e) => setYear2(Number(e.target.value))} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}>
                        {years.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                </div>
            </div>
            
            <div style={{ height: '70vh' }}>
                {chartOptions ? (
                    <HighchartsReact highcharts={Highcharts} options={chartOptions} />
                ) : (
                    <div className="chart-placeholder">Select two years to compare.</div>
                )}
            </div>
        </div>
    );
}

export default AgePyramidChart;
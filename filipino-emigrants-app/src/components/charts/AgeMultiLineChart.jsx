// src/components/charts/AgeMultiLineChart.jsx

import React, { useEffect, useState, useMemo } from 'react';
import Select from 'react-select';
import { getData, collections } from '../../services/emigrantsService';
import LineChart from './LineChart';

const FIELD_MAP = {
    age20_24: { label: '20-24 (Prime Emigration)', color: '#ef4444' },
    age25_29: { label: '25-29 (Peak)', color: '#f59e0b' },
    age30_34: { label: '30-34', color: '#10b981' },
    age35_39: { label: '35-39', color: '#3b82f6' },
    age40_44: { label: '40-44', color: '#8b5cf6' },
    age50_54: { label: '50-54', color: '#06b6d4' },
};
const defaultSelectedOptions = Object.keys(FIELD_MAP).map(key => ({
    value: key,
    label: FIELD_MAP[key].label
}));
const selectOptions = defaultSelectedOptions;

function AgeMultiLineChart() {
    const [data, setData] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAgeGroups, setSelectedAgeGroups] = useState(defaultSelectedOptions);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const ageData = await getData(collections.age);
            const sortedData = ageData.sort((a, b) => (Number(a.year) || 0) - (Number(b.year) || 0));
            setData(sortedData);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (data.length === 0 || selectedAgeGroups.length === 0) {
            setChartData(null);
            return;
        }

        const activeKeys = selectedAgeGroups.map(group => group.value);
        const labels = data.map(item => item.year);
        
        const datasets = activeKeys.map(key => ({
            label: FIELD_MAP[key].label,
            data: data.map(item => item[key] || 0),
            borderColor: FIELD_MAP[key].color,
            backgroundColor: 'rgba(0,0,0,0)', // Transparent fill
            tension: 0.1,
            pointRadius: 4,
            pointHoverRadius: 6,
        }));

        setChartData({ labels, datasets });
    }, [data, selectedAgeGroups]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            x: { title: { display: true, text: 'Year' } },
            y: { title: { display: true, text: 'Number of Emigrants' }, beginAtZero: true },
        },
        layout: { padding: { top: 30 } }
    }), []);

    if (isLoading) {
        return <div className="chart-placeholder"><p className="placeholder-text">Loading Age Trend Data...</p></div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h3 style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                Age Group Emigration Trend Over Years
            </h3>
            <div style={{ marginBottom: '20px', zIndex: 10, position: 'relative' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Filter Age Groups:</label>
                <Select
                    isMulti
                    options={selectOptions}
                    placeholder="Select age groups to display..."
                    value={selectedAgeGroups}
                    onChange={setSelectedAgeGroups}
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                />
            </div>
            
            <div style={{ height: '70vh' }}>
                {chartData ? (
                    <LineChart chartData={chartData} options={chartOptions} />
                ) : (
                    <div className="chart-placeholder">Select at least one age group to view the trend.</div>
                )}
            </div>
        </div>
    );
}

export default AgeMultiLineChart;
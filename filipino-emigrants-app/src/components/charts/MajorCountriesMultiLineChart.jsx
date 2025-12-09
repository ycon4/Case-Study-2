// src/components/charts/MajorCountriesMultiLineChart.jsx

import React, { useEffect, useState, useMemo } from 'react';
import Select from 'react-select';
import { getData, collections } from '../../services/emigrantsService';
import LineChart from './LineChart';

const FIELD_MAP = {
    usa: { label: 'USA', color: '#ef4444' },
    canada: { label: 'Canada', color: '#3b82f6' },
    japan: { label: 'Japan', color: '#10b981' },
    australia: { label: 'Australia', color: '#f59e0b' },
    unitedKingdom: { label: 'UK', color: '#8b5cf6' },
    italy: { label: 'Italy', color: '#06b6d4' },
    others: { label: 'Others', color: '#9ca3af' },
};
const defaultSelectedOptions = Object.keys(FIELD_MAP).map(key => ({
    value: key,
    label: FIELD_MAP[key].label
}));
const selectOptions = defaultSelectedOptions;

function MajorCountriesMultiLineChart() {
    const [data, setData] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedCountries, setSelectedCountries] = useState(defaultSelectedOptions);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const countriesData = await getData(collections.majorCountries);
            const sortedData = countriesData.sort((a, b) => (Number(a.year) || 0) - (Number(b.year) || 0));
            setData(sortedData);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (data.length === 0 || selectedCountries.length === 0) {
            setChartData(null);
            return;
        }

        const activeKeys = selectedCountries.map(group => group.value);
        const labels = data.map(item => item.year);
        
        const datasets = activeKeys.map(key => ({
            label: FIELD_MAP[key].label,
            data: data.map(item => item[key] || 0),
            borderColor: FIELD_MAP[key].color,
            backgroundColor: 'rgba(0,0,0,0)',
            tension: 0.1,
            pointRadius: 4,
            pointHoverRadius: 6,
        }));

        setChartData({ labels, datasets });
    }, [data, selectedCountries]);

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
        return <div className="chart-placeholder"><p className="placeholder-text">Loading Major Countries Trend Data...</p></div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h3 style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                Major Countries Emigration Trend Over Years
            </h3>
            <div style={{ marginBottom: '20px', zIndex: 10, position: 'relative' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Filter Destination Countries:</label>
                <Select
                    isMulti
                    options={selectOptions}
                    placeholder="Select countries to display..."
                    value={selectedCountries}
                    onChange={setSelectedCountries}
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                />
            </div>
            
            <div style={{ height: '70vh' }}>
                {chartData ? (
                    <LineChart chartData={chartData} options={chartOptions} />
                ) : (
                    <div className="chart-placeholder">Select at least one country to view the trend.</div>
                )}
            </div>
        </div>
    );
}

export default MajorCountriesMultiLineChart;
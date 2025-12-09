// src/components/charts/SexBubbleTimeline.jsx

import React, { useEffect, useState, useMemo } from 'react';
import { getData, collections } from '../../services/emigrantsService';
import BubbleChart from './BubbleChart'; // Reuse the Bubble Chart component

// Define fixed Y positions for the discrete 'Sex' categories
const Y_AXIS_POSITIONS = {
    male: 1,
    female: 2,
    notReported: 3
};

const FIELD_MAP = {
    male: { label: 'Male', color: '#2C2089' },
    female: { label: 'Female', color: '#E17AA2' },
    notReported: { label: 'Not Reported', color: '#9ca3af' },
};
const FIELD_KEYS = Object.keys(FIELD_MAP);

function SexBubbleTimeline() {
    const [data, setData] = useState([]);
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const sexData = await getData(collections.sex);
            const sortedData = sexData.sort((a, b) => (Number(a.year) || 0) - (Number(b.year) || 0));
            setData(sortedData);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const chartOptions = useMemo(() => {
        if (data.length === 0) return null;

        const datasets = FIELD_KEYS.map(key => ({
            label: FIELD_MAP[key].label,
            data: data.map(item => ({
                x: Number(item.year),
                y: Y_AXIS_POSITIONS[key],
                // Scale radius by square root for better visual comparison
                r: Math.sqrt(Number(item[key]) || 0) / 10, 
                count: Number(item[key]) || 0,
            })).filter(bubble => bubble.count > 0),
            backgroundColor: FIELD_MAP[key].color,
        }));

        setChartData({ datasets });

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        // Display year and count in the tooltip
                        label: function(context) {
                            const dataPoint = context.raw;
                            return `${context.dataset.label}: ${dataPoint.count.toLocaleString()} emigrants`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Year' },
                    ticks: { stepSize: 1 },
                },
                y: {
                    title: { display: true, text: 'Gender Category' },
                    min: 0.5,
                    max: 3.5,
                    ticks: {
                        stepSize: 1,
                        callback: function(value, index, values) {
                            // Map the numeric Y position back to the label
                            const labels = ['Male', 'Female', 'Not Reported'];
                            return labels[value - 1] || '';
                        },
                    },
                },
            },
            layout: { padding: { top: 30 } }
        };
    }, [data]);

    if (isLoading) {
        return <div className="chart-placeholder"><p className="placeholder-text">Loading Sex Trend Data...</p></div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h3 style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
                Gender Emigration Trend (Bubble Timeline)
            </h3>
            <div style={{ height: '70vh' }}>
                {chartData ? (
                    <BubbleChart chartData={chartData} options={chartOptions} />
                ) : (
                    <div className="chart-placeholder">No data available to show the trend.</div>
                )}
            </div>
        </div>
    );
}

export default SexBubbleTimeline;
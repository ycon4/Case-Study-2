// src/components/charts/StackedBarChart.js

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// We need to register the components we are using
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// This component explicitly sets the 'stacked' option to true
function StackedBarChart({ chartData, options }) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Stacked Bar Chart',
        font: {
          size: 18,
        },
      },
    },
    // --- KEY FOR STACKING ---
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      }
    }
    // -----------------------
  };

  return <Bar options={options || defaultOptions} data={chartData} />;
}

export default StackedBarChart;
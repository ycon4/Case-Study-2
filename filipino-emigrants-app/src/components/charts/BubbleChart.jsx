// src/components/charts/BubbleChart.js

import React from 'react';
import { Bubble } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Bubble charts require a linear scale and point elements
ChartJS.register(
    LinearScale, 
    PointElement, 
    Tooltip, 
    Legend
);

function BubbleChart({ chartData, options }) {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Bubble Chart',
      },
    },
  };

  return <Bubble options={options || defaultOptions} data={chartData} />;
}

export default BubbleChart;
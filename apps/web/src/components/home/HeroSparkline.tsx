'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler);

interface HeroSparklineProps {
  prices: number[];
}

export function HeroSparkline({ prices }: HeroSparklineProps) {
  if (!prices.length) return null;

  const isPositive = prices[prices.length - 1] >= prices[0];
  const color = isPositive ? '#22c55e' : '#ef4444';
  const fillColor = isPositive ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)';

  const data = {
    labels: prices.map(() => ''),
    datasets: [
      {
        data: prices,
        borderColor: color,
        backgroundColor: fillColor,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 1.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false as const,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  return (
    <div style={{ height: 36, width: 100 }}>
      <Line data={data} options={options} />
    </div>
  );
}

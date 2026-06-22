import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      labels: {
        color: '#ffffff',
      },
    },
  },

  scales: {
    x: {
      ticks: {
        color: '#a3a3a3',
      },
      grid: {
        color: '#262626',
      },
    },
    y: {
      ticks: {
        color: '#a3a3a3',
      },
      grid: {
        color: '#262626',
      },
    },
  },
};

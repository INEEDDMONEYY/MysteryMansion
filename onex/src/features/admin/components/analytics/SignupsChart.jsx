import { Bar } from 'react-chartjs-2';
import { format } from 'date-fns';
import { chartOptions } from './chartOptions';

export default function SignupsChart({ data = [], loading }) {
  const barData = {
    labels: data.map((item) => {
      try { return format(new Date(item.date), 'MMM d'); } catch { return item.date; }
    }),
    datasets: [
      {
        label: 'New Sign Ups',
        data: data.map((item) => item.count),
        backgroundColor: 'rgba(244, 114, 182, 0.7)',
        borderColor: '#f472b6',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
        Sign Ups Over Time
      </h2>
      <div className="h-[240px]">
        {loading ? (
          <div className="h-full bg-neutral-800 animate-pulse rounded-xl" />
        ) : data.length ? (
          <Bar data={barData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
            No signup data available
          </div>
        )}
      </div>
    </div>
  );
}

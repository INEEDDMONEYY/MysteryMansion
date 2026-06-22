import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { chartOptions } from './chartOptions';

export default function TrafficChart({ data = [], loading }) {
  const lineData = {
    labels: data.map((item) => {
      try { return format(new Date(item.date), 'MMM d'); } catch { return item.date; }
    }),
    datasets: [
      {
        label: 'Site Traffic',
        data: data.map((item) => item.visits),
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.12)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#171717',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col h-full">
      <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4 shrink-0">
        Traffic Over Time
      </h2>
      <div className="flex-1 min-h-[260px]">
        {loading ? (
          <div className="h-full bg-neutral-800 animate-pulse rounded-xl" />
        ) : data.length ? (
          <Line data={lineData} options={chartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-500 text-sm">
            No traffic data available
          </div>
        )}
      </div>
    </div>
  );
}

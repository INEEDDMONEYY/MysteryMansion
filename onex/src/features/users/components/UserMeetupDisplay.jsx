// User Meetup Display
import { DollarSign } from "lucide-react";

const PRICE_TYPES = [
  { key: "incall", label: "Incall" },
  { key: "outcall", label: "Outcall" },
  { key: "overnights", label: "Overnights" },
  { key: "flyOut", label: "Fly-Out" },
];

export default function UserMeetupDisplay({ prices = {} }) {
  const activePrices = PRICE_TYPES.filter(
    ({ key }) => prices[key] !== "" && prices[key] != null && Number(prices[key]) > 0
  );

  if (activePrices.length === 0) return null;

  return (
    <section className="w-full px-4 py-4 md:px-6 lg:px-8">
      <h2 className="text-base md:text-lg font-semibold text-pink-700 mb-4 text-center flex items-center justify-center gap-2">
        <DollarSign className="text-pink-600" size={20} />
        Meetup Pricing
      </h2>

      <div className="flex flex-wrap justify-center gap-3">
        {activePrices.map(({ key, label }) => (
          <div
            key={key}
            className="bg-white shadow rounded-lg px-5 py-3 flex flex-col items-center text-center min-w-[110px]"
          >
            <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</span>
            <span className="text-pink-700 font-semibold text-sm">${prices[key]}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

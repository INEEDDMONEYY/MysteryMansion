//User Availability Display

import { CalendarDays, Clock } from "lucide-react";

export default function UserAvailabilityDisplay({ availability }) {
  const status =
    typeof availability === "string"
      ? availability
      : availability?.status || "Not Available";

  return (
    <section className="w-full px-4 py-4 md:px-6 lg:px-8">
      <h2 className="text-base md:text-lg font-semibold text-pink-700 mb-4 text-center flex items-center justify-center gap-2">
        <CalendarDays className="text-pink-600" size={20} />
        Availability Status
      </h2>

      {/* ✅ Flex layout instead of grid */}
      <div className="flex flex-col items-center justify-center">
        <div className="bg-white shadow rounded-lg p-4 flex flex-col items-center justify-center text-center space-y-2 w-full max-w-sm">
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <Clock size={14} className="text-pink-500" />
            <span>{status}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

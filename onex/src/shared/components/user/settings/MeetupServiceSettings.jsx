// Meetup Service Settings
import React, { useState, useEffect } from "react";
import { DollarSign, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function MeetupServiceSettings({
  incallPrice,
  setIncallPrice,
  outcallPrice,
  setOutcallPrice,
  userId, // optional: namespace values per user
}) {
  const [loadingField, setLoadingField] = useState(null);
  const [toast, setToast] = useState(null);

  // Build per-user storage keys
  const incallKey = userId ? `incallPrice_${userId}` : "incallPrice";
  const outcallKey = userId ? `outcallPrice_${userId}` : "outcallPrice";

  // Hydrate prices from localStorage when userId changes
  useEffect(() => {
    try {
      const savedIncall = localStorage.getItem(incallKey);
      if (savedIncall !== null) setIncallPrice(savedIncall);
      const savedOutcall = localStorage.getItem(outcallKey);
      if (savedOutcall !== null) setOutcallPrice(savedOutcall);
    } catch (err) {
      console.error("Failed to read meetup prices from localStorage:", err);
    }
  }, [userId, incallKey, outcallKey, setIncallPrice, setOutcallPrice]);

  // Persist prices to localStorage whenever they change
  useEffect(() => {
    try {
      if (incallPrice !== undefined && incallPrice !== null) {
        localStorage.setItem(incallKey, String(incallPrice));
      }
    } catch {}
  }, [incallPrice, incallKey]);

  useEffect(() => {
    try {
      if (outcallPrice !== undefined && outcallPrice !== null) {
        localStorage.setItem(outcallKey, String(outcallPrice));
      }
    } catch {}
  }, [outcallPrice, outcallKey]);

  const handleSave = (type) => {
    setLoadingField(type);

    setTimeout(() => {
      const price = type === "incall" ? incallPrice : outcallPrice;
      const key = type === "incall" ? incallKey : outcallKey;

      // Validate price
      if (!price || Number(price) <= 0) {
        setToast({
          type: "error",
          message: `Failed to update ${type} price. Invalid value.`,
        });
      } else {
        // Persist to localStorage
        try {
          localStorage.setItem(key, String(price));
        } catch (err) {
          console.error(`Failed to save ${type} price to localStorage:`, err);
        }

        // Update parent state (ensures UI refreshes immediately)
        if (type === "incall") setIncallPrice(price);
        else setOutcallPrice(price);

        setToast({
          type: "success",
          message: `${type === "incall" ? "Incall" : "Outcall"} price updated successfully!`,
        });
      }

      setLoadingField(null);
      setTimeout(() => setToast(null), 3000);
    }, 500);
  };

  return (
    <section className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow text-white text-sm transition-all ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Incall */}
      <div className="space-y-2">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <DollarSign size={18} className="text-pink-600" />
          Incall Price
        </h3>
        <input
          type="number"
          value={incallPrice || ""}
          onChange={(e) => setIncallPrice(e.target.value)}
          placeholder="Enter incall price"
          className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <button
          type="button"
          disabled={loadingField === "incall"}
          onClick={() => handleSave("incall")}
          className={`flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded transition ${
            loadingField === "incall" ? "opacity-70 cursor-not-allowed" : "hover:bg-pink-700"
          }`}
        >
          {loadingField === "incall" ? <Loader2 className="animate-spin" size={16} /> : "Save Incall Price"}
        </button>
        {incallPrice && (
          <p className="text-sm text-gray-600">
            Current Incall Price: <strong>${incallPrice}</strong>
          </p>
        )}
      </div>

      {/* Outcall */}
      <div className="space-y-2">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
          <DollarSign size={18} className="text-pink-600" />
          Outcall Price
        </h3>
        <input
          type="number"
          value={outcallPrice || ""}
          onChange={(e) => setOutcallPrice(e.target.value)}
          placeholder="Enter outcall price"
          className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        <button
          type="button"
          disabled={loadingField === "outcall"}
          onClick={() => handleSave("outcall")}
          className={`flex items-center justify-center gap-2 bg-pink-600 text-white px-4 py-2 rounded transition ${
            loadingField === "outcall" ? "opacity-70 cursor-not-allowed" : "hover:bg-pink-700"
          }`}
        >
          {loadingField === "outcall" ? <Loader2 className="animate-spin" size={16} /> : "Save Outcall Price"}
        </button>
        {outcallPrice && (
          <p className="text-sm text-gray-600">
            Current Outcall Price: <strong>${outcallPrice}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

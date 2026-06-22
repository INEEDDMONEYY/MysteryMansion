// Availability Settings
import React, { useEffect, useMemo, useState } from "react";
import { Loader2, CheckCircle, XCircle, Clock, DollarSign } from "lucide-react";
import api from "@/shared/utils/api";

export default function AvailabilitySettings({
  availability,
  setAvailability,
  userId,
}) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [prices, setPrices] = useState({
    incall: "",
    outcall: "",
    overnight: "",
    flyOut: "",
  });

  const storageKeys = useMemo(
    () => ({
      availability: userId ? `availability_${userId}` : null,
      incall: userId ? `incallPrice_${userId}` : null,
      outcall: userId ? `outcallPrice_${userId}` : null,
      overnight: userId ? `overnightPrice_${userId}` : null,
      flyOut: userId ? `flyOutPrice_${userId}` : null,
    }),
    [userId]
  );

  const normalizeAvailabilityStatus = (rawAvailability) => {
    if (!rawAvailability) return "";
    if (typeof rawAvailability === "string") return rawAvailability;
    if (typeof rawAvailability === "object") return rawAvailability.status || "";
    return "";
  };

  const normalizeNumberLike = (value) => {
    if (value === null || value === undefined || value === "") return "";
    const numeric = Number(value);
    if (Number.isNaN(numeric) || numeric < 0) return "";
    return String(numeric);
  };

  const toPayloadPrice = (value) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) return 0;
    return parsed;
  };

  useEffect(() => {
    async function loadFromBackend() {
      try {
        const res = await api.get("/auth/me");
        const data = res?.data || {};

        const normalizedStatus = normalizeAvailabilityStatus(data?.availability);
        setAvailability({ status: normalizedStatus });

        const nextPrices = {
          incall: normalizeNumberLike(data?.incallPrice),
          outcall: normalizeNumberLike(data?.outcallPrice),
          overnight: normalizeNumberLike(data?.overnightPrice),
          flyOut: normalizeNumberLike(data?.flyOutPrice),
        };
        setPrices(nextPrices);

        if (storageKeys.availability) {
          localStorage.setItem(
            storageKeys.availability,
            JSON.stringify({ status: normalizedStatus })
          );
        }

        Object.entries(nextPrices).forEach(([key, value]) => {
          const storageKey = storageKeys[key];
          if (!storageKey) return;
          localStorage.setItem(storageKey, value);
        });

        return;
      } catch (err) {
        console.error("Failed to load availability/pricing from backend", err);
      }

      try {
        if (!storageKeys.availability) return;

        const rawAvailability = localStorage.getItem(storageKeys.availability);
        if (rawAvailability) {
          const savedAvailability = JSON.parse(rawAvailability);
          if (savedAvailability && typeof savedAvailability === "object" && "status" in savedAvailability) {
            setAvailability(savedAvailability);
          }
        }

        setPrices((prev) => ({
          incall: localStorage.getItem(storageKeys.incall) ?? prev.incall,
          outcall: localStorage.getItem(storageKeys.outcall) ?? prev.outcall,
          overnight: localStorage.getItem(storageKeys.overnight) ?? prev.overnight,
          flyOut: localStorage.getItem(storageKeys.flyOut) ?? prev.flyOut,
        }));
      } catch (err) {
        console.error("Failed to read availability/pricing from localStorage", err);
      }
    }

    loadFromBackend();
  }, [setAvailability, storageKeys]);

  useEffect(() => {
    if (!availability || !storageKeys.availability) return;
    try {
      localStorage.setItem(storageKeys.availability, JSON.stringify(availability));
    } catch (err) {
      console.error("Failed to persist availability", err);
    }
  }, [availability, storageKeys]);

  useEffect(() => {
    try {
      if (storageKeys.incall) localStorage.setItem(storageKeys.incall, prices.incall ?? "");
      if (storageKeys.outcall) localStorage.setItem(storageKeys.outcall, prices.outcall ?? "");
      if (storageKeys.overnight) localStorage.setItem(storageKeys.overnight, prices.overnight ?? "");
      if (storageKeys.flyOut) localStorage.setItem(storageKeys.flyOut, prices.flyOut ?? "");
    } catch (err) {
      console.error("Failed to persist pricing", err);
    }
  }, [prices, storageKeys]);

  const handlePriceChange = (key, value) => {
    if (value === "") {
      setPrices((prev) => ({ ...prev, [key]: "" }));
      return;
    }

    if (!/^\d*\.?\d*$/.test(value)) return;
    setPrices((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const payload = {
        availability: { status: availability.status || "" },
        incallPrice: toPayloadPrice(prices.incall),
        outcallPrice: toPayloadPrice(prices.outcall),
        overnightPrice: toPayloadPrice(prices.overnight),
        flyOutPrice: toPayloadPrice(prices.flyOut),
      };

      const res = await api.post("/users/update-profile", payload);
      const updatedUser = res?.data?.user || {};

      const savedStatus =
        normalizeAvailabilityStatus(updatedUser?.availability) || availability.status;
      const savedPrices = {
        incall: normalizeNumberLike(updatedUser?.incallPrice),
        outcall: normalizeNumberLike(updatedUser?.outcallPrice),
        overnight: normalizeNumberLike(updatedUser?.overnightPrice),
        flyOut: normalizeNumberLike(updatedUser?.flyOutPrice),
      };

      setAvailability({ status: savedStatus });
      setPrices(savedPrices);

      if (storageKeys.availability) {
        localStorage.setItem(
          storageKeys.availability,
          JSON.stringify({ status: savedStatus })
        );
      }
      if (storageKeys.incall) localStorage.setItem(storageKeys.incall, savedPrices.incall);
      if (storageKeys.outcall) localStorage.setItem(storageKeys.outcall, savedPrices.outcall);
      if (storageKeys.overnight) localStorage.setItem(storageKeys.overnight, savedPrices.overnight);
      if (storageKeys.flyOut) localStorage.setItem(storageKeys.flyOut, savedPrices.flyOut);

      setToast({ type: "success", message: "Availability and pricing saved!" });
    } catch (err) {
      setToast({
        type: "error",
        message: err.response?.data?.error || err.message || "Failed to save settings",
      });
    }

    setLoading(false);
  };

  return (
    <section className="w-full px-4 py-6 md:px-6 lg:px-8">

      {toast && (
        <div
          className={`flex items-center justify-center gap-2 px-4 py-2 mb-4 rounded-lg shadow text-white text-sm transition-all ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={18} /> : <XCircle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-pink-100 p-4 sm:p-6 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 gap-4 sm:gap-5">
          <div className="space-y-2 text-left">
            <label className="block text-pink-600 font-medium">Availability</label>

            <select
              value={availability.status || ""}
              onChange={(e) =>
                setAvailability({ ...availability, status: e.target.value })
              }
              className="w-full border border-pink-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              <option value="">Select status</option>
              <option value="Available">Available</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Incall Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={prices.incall}
                onChange={(e) => handlePriceChange("incall", e.target.value)}
                placeholder="e.g. 220"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Outcall Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={prices.outcall}
                onChange={(e) => handlePriceChange("outcall", e.target.value)}
                placeholder="e.g. 280"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Overnight Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={prices.overnight}
                onChange={(e) => handlePriceChange("overnight", e.target.value)}
                placeholder="e.g. 900"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Fly-out Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={prices.flyOut}
                onChange={(e) => handlePriceChange("flyOut", e.target.value)}
                placeholder="e.g. 1800"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
          </div>

          <div className="rounded-lg bg-pink-50 border border-pink-100 px-3 py-2 text-left text-sm text-pink-700">
            <div className="inline-flex items-center gap-1.5 font-medium">
              <DollarSign size={14} />
              Prices are saved to your account and available across devices.
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleSave}
          className={`mt-5 w-full sm:w-auto flex items-center justify-center gap-2 bg-pink-600 text-white px-6 py-2.5 rounded-lg transition ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-pink-700"
          }`}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              <Clock size={16} />
              Save
            </>
          )}
        </button>
      </div>
    </section>
  );
}

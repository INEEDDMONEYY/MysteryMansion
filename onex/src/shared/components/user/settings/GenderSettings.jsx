import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useUser } from "@/context/useUser";

const GENDER_OPTIONS = ["Man escort", "Woman escort", "TS escort"];

export default function GenderSettings({ user }) {
  const { updateProfile } = useUser();
  const [gender, setGender] = useState(user?.gender || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setGender(user?.gender || "");
  }, [user?.gender]);

  const handleChange = (e) => {
    setGender(e.target.value);
    setMessage("");
  };

  const handleSave = async () => {
    if (!gender) {
      setMessage("Please select an option before saving.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await updateProfile({ gender });
      setMessage("Saved successfully.");
    } catch (err) {
      setMessage(err.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Select the option that best describes your escort listing. This will display on your profile.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <label className="text-sm font-medium text-gray-700 shrink-0">
          Listing Type
        </label>

        <select
          value={gender}
          onChange={handleChange}
          className="w-full sm:w-52 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="">Select type</option>
          {GENDER_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {gender && (
        <p className="text-sm text-gray-600">
          Selected: <span className="font-semibold text-pink-600">{gender}</span>
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={loading}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-white transition ${
          loading ? "bg-pink-400 cursor-not-allowed" : "bg-pink-600 hover:bg-pink-700"
        }`}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        {loading ? "Saving..." : "Save"}
      </button>

      {message && (
        <p
          className={`text-sm ${
            message.toLowerCase().includes("success") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}

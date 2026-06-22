import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useUser } from "@/context/useUser";

export default function AgeSettings({ user }) {
  const { updateProfile } = useUser();
  const [age, setAge] = useState(user?.age || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const ages = Array.from({ length: 83 }, (_, i) => i + 18); // 18–100

  useEffect(() => {
    setAge(user?.age || "");
  }, [user?.age]);

  const handleChange = (e) => {
    setAge(e.target.value);
    setMessage("");
  };

  const handleSave = async () => {
    if (!age) {
      setMessage("Please select an age before saving.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await updateProfile({ age: Number(age) });
      setMessage("Age saved successfully.");
    } catch (err) {
      setMessage(err.message || "Failed to save age.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Description */}
      <p className="text-sm text-gray-500">
        Select your age. This helps ensure platform compliance and improves profile visibility.
      </p>

      {/* Age Selector */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">

        <label className="text-sm font-medium text-gray-700 min-w-[60px]">
          Age
        </label>

        <select
          value={age}
          onChange={handleChange}
          className="w-full sm:w-40 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <option value="">Select age</option>

          {ages.map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}

        </select>

      </div>

      {/* Selected Preview */}
      {age && (
        <p className="text-sm text-gray-600">
          Selected age: <span className="font-semibold text-pink-600">{age}</span>
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
        {loading ? "Saving..." : "Save Age"}
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
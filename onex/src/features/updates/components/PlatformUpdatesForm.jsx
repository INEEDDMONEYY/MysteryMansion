import { useState } from "react";
import api from "@/shared/utils/api";

export default function PlatformUpdatesForm({ onUpdateSubmit }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await api.post("/platform-updates", {
        title,
        description,
        type: "platform",
      });

      if (onUpdateSubmit) onUpdateSubmit(data);
      setTitle("");
      setDescription("");
      setSuccess("Update posted successfully.");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to submit update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Update Title"
        className="bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-600 w-full"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        placeholder="Update Description"
        className="bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-600 min-h-[120px] w-full resize-y"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <p className="text-xs text-neutral-500 -mt-2">
        Tip: Enter one point per line — each line appears as a bullet on the updates page.
      </p>

      {error   && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-emerald-400 text-sm">{success}</p>}

      <button
        type="submit"
        className="bg-neutral-800 border border-neutral-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-neutral-700 transition disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Submitting…" : "Post Platform Update"}
      </button>
    </form>
  );
}

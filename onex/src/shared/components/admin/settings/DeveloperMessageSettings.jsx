import { useState } from "react";
import { MessageSquare, Save } from "lucide-react";
import { useDevMessage } from "@/context/DevMessageContext";

export default function DeveloperMessageSetting() {
  const { devMessage, updateDevMessage } = useDevMessage();
  const [message, setMessage] = useState(devMessage || "");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const saveMessage = async () => {
    if (!message.trim()) { setStatus({ type: 'error', msg: 'Message cannot be empty.' }); return; }
    setSaving(true);
    const success = await updateDevMessage(message.trim());
    setSaving(false);
    setStatus({ type: success ? 'success' : 'error', msg: success ? 'Message updated.' : 'Failed to update message.' });
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={16} className="text-neutral-500" />
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Homepage Developer Message</h3>
      </div>

      {status && (
        <p className={`text-sm mb-3 ${status.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>{status.msg}</p>
      )}

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        className="w-full bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500 mb-3 resize-none"
        placeholder="Enter a message to display on the homepage..."
      />

      <button
        onClick={saveMessage}
        disabled={saving}
        className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 transition disabled:opacity-50"
      >
        <Save size={15} /> {saving ? 'Saving…' : 'Save Message'}
      </button>
    </div>
  );
}
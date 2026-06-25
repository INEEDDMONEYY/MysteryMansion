import { useState, useEffect } from 'react';
import { Users, Save } from 'lucide-react';
import api from '@/shared/utils/api';

export default function VisitorCountSetting() {
  const [count, setCount]   = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    api.get('/public/settings/flags')
      .then((res) => setCount(String(res.data?.visitorCount ?? 13000)))
      .catch(() => setCount('13000'));
  }, []);

  const handleSave = async () => {
    const num = Number(count);
    if (!Number.isFinite(num) || num < 0) {
      setStatus({ type: 'error', msg: 'Enter a valid positive number.' });
      return;
    }
    setSaving(true);
    try {
      await api.put('/admin', { visitorCount: num });
      setStatus({ type: 'success', msg: 'Visitor count updated.' });
    } catch {
      setStatus({ type: 'error', msg: 'Failed to update.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Users size={16} className="text-neutral-500" />
        <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Promote Page — Visitor Count
        </h3>
      </div>
      <p className="text-xs text-neutral-500 mb-3 leading-relaxed">
        Controls the number shown in the "Get Seen First by X+ Visitors" headline on the Promote Account page. Displayed as a rounded figure (e.g. 13000 → 13k+).
      </p>

      {status && (
        <p className={`text-sm mb-3 ${status.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
          {status.msg}
        </p>
      )}

      <div className="flex items-center gap-3">
        <input
          type="number"
          min="0"
          value={count}
          onChange={(e) => { setCount(e.target.value); setStatus(null); }}
          className="flex-1 bg-neutral-800 border border-neutral-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500"
          placeholder="e.g. 13000"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-rose-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-rose-700 transition disabled:opacity-50"
        >
          <Save size={15} /> {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
}

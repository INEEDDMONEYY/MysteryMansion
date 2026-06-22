import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Percent, Tag } from 'lucide-react';
import api from '@/shared/utils/api';

const VALID_PERCENTS = [3, 5, 10, 20, 30, 50, 60, 80, 100];

const TIER_LABELS = [
  '1 Week Promotion',
  '2 Weeks Promotion',
  '2 Weeks Promotion + Verification',
  '3 Weeks Promotion',
  '3 Weeks Promotion + Verification',
  'Blue Badge Verification',
];

const PERCENT_COLORS = {
  3:   'bg-neutral-800 text-neutral-300',
  5:   'bg-neutral-800 text-neutral-300',
  10:  'bg-sky-900 text-sky-300',
  20:  'bg-sky-900 text-sky-300',
  30:  'bg-violet-900 text-violet-300',
  50:  'bg-pink-900 text-pink-300',
  60:  'bg-pink-900 text-pink-300',
  80:  'bg-rose-900 text-rose-300',
  100: 'bg-red-900 text-red-300',
};

const EMPTY_FORM = { label: '', discountPercent: '', targetTiers: [], expiresAt: '' };

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/discounts');
      setDiscounts(data?.data || []);
    } catch {
      setError('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleTier = (tier) => {
    setForm(f => ({
      ...f,
      targetTiers: f.targetTiers.includes(tier)
        ? f.targetTiers.filter(t => t !== tier)
        : [...f.targetTiers, tier],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/discounts', {
        label: form.label,
        discountPercent: Number(form.discountPercent),
        targetTiers: form.targetTiers,
        expiresAt: form.expiresAt || null,
      });
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create discount');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/discounts/${id}/toggle`);
      load();
    } catch {
      setError('Failed to toggle discount');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this discount?')) return;
    try {
      await api.delete(`/discounts/${id}`);
      load();
    } catch {
      setError('Failed to delete discount');
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-pink-500/10 flex items-center justify-center">
          <Percent size={18} className="text-pink-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Promotion Discounts</h1>
          <p className="text-xs text-neutral-500">Apply percentage discounts to promotion tiers</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      {/* Create Form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-neutral-300 mb-4">New Discount</h2>
        <form onSubmit={handleCreate} className="space-y-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Sale Label *</label>
              <input
                required
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Summer Sale, Flash Deal"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-xs text-neutral-400 mb-1">Discount % *</label>
              <div className="flex flex-wrap gap-2">
                {VALID_PERCENTS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, discountPercent: p }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      form.discountPercent === p
                        ? 'border-pink-500 bg-pink-600 text-white'
                        : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-pink-500/50'
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tier selection */}
          <div>
            <label className="block text-xs text-neutral-400 mb-2">
              Apply to Tiers
              <span className="ml-1 text-neutral-600">(leave all unchecked = applies to every tier)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TIER_LABELS.map(tier => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => toggleTier(tier)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    form.targetTiers.includes(tier)
                      ? 'border-pink-500 bg-pink-600/20 text-pink-300'
                      : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600'
                  }`}
                >
                  <Tag size={10} />
                  {tier}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:w-1/2">
            <label className="block text-xs text-neutral-400 mb-1">Expires (optional)</label>
            <input
              type="datetime-local"
              value={form.expiresAt}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || !form.discountPercent}
              className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              <Plus size={15} />
              {saving ? 'Creating…' : 'Create Discount'}
            </button>
          </div>
        </form>
      </div>

      {/* Discount Cards */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-neutral-300 mb-4">
          Active Discounts
          <span className="ml-2 text-neutral-500 font-normal">({discounts.length})</span>
        </h2>

        {loading ? (
          <div className="text-center py-10 text-neutral-500 text-sm">Loading…</div>
        ) : discounts.length === 0 ? (
          <div className="text-center py-10 text-neutral-600 text-sm">No discounts yet. Create one above.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {discounts.map((d) => {
              const colorCls = PERCENT_COLORS[d.discountPercent] || 'bg-neutral-800 text-neutral-300';
              return (
                <div
                  key={d._id}
                  className={`relative rounded-2xl border border-neutral-800 bg-neutral-950 p-5 flex flex-col gap-3 ${!d.active ? 'opacity-50' : ''}`}
                >
                  {/* Big % badge */}
                  <div className="flex items-start justify-between gap-2">
                    <span className={`inline-flex items-center gap-1 text-2xl font-black px-3 py-1.5 rounded-xl ${colorCls}`}>
                      {d.discountPercent}%
                      <span className="text-xs font-semibold mt-1">OFF</span>
                    </span>

                    <button
                      onClick={() => handleDelete(d._id)}
                      className="p-1.5 rounded-lg hover:bg-red-900/40 text-neutral-600 hover:text-red-400 transition-colors mt-1"
                      title="Delete discount"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white">{d.label}</h3>
                    {d.targetTiers && d.targetTiers.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {d.targetTiers.map(t => (
                          <span key={t} className="text-[10px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-neutral-500 mt-1">Applies to all tiers</p>
                    )}
                  </div>

                  {d.expiresAt && (
                    <p className="text-[10px] text-neutral-500">
                      Expires: {new Date(d.expiresAt).toLocaleString()}
                    </p>
                  )}

                  <button
                    onClick={() => handleToggle(d._id)}
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors mt-auto"
                  >
                    {d.active
                      ? <ToggleRight size={16} className="text-emerald-400" />
                      : <ToggleLeft size={16} />}
                    {d.active ? 'Active' : 'Inactive'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

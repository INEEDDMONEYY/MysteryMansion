import { useEffect, useState } from 'react';
import { Coins, Plus, Pencil, Trash2, Star, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '@/shared/utils/api';
import { setSEO } from '@/shared/utils/seo';

const EMPTY_FORM = { name: '', credits: '', priceCents: '', description: '', isPopular: false, isActive: true, sortOrder: 0 };

function fmt(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function PackageForm({ initial = EMPTY_FORM, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      credits: Number(form.credits),
      priceCents: Math.round(Number(form.priceCents) * 100), // dollars → cents
      sortOrder: Number(form.sortOrder || 0),
    });
  };

  // Display price in dollars for the input
  const priceDisplay = form.priceCents
    ? typeof form.priceCents === 'number' && form.priceCents >= 100
      ? (form.priceCents / 100).toFixed(2)      // stored cents → display dollars
      : form.priceCents                           // raw dollars from input
    : '';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Package name</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Starter" required maxLength={60}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500" />
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Credits</label>
          <input type="number" min="1" value={form.credits} onChange={e => set('credits', e.target.value)} placeholder="e.g. 200" required
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500" />
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Price (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
            <input type="number" min="0" step="0.01" value={priceDisplay} onChange={e => set('priceCents', e.target.value)} placeholder="9.99" required
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg pl-7 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-neutral-400 mb-1">Sort order</label>
          <input type="number" min="0" value={form.sortOrder} onChange={e => set('sortOrder', e.target.value)} placeholder="0"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-neutral-400 mb-1">Description <span className="text-neutral-600">(optional)</span></label>
        <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Best for casual browsing" maxLength={120}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500" />
      </div>
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-300">
          <input type="checkbox" checked={form.isPopular} onChange={e => set('isPopular', e.target.checked)} className="accent-pink-500" />
          Mark as Popular
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-300">
          <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} className="accent-pink-500" />
          Active (visible to clients)
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-neutral-700 text-white text-sm hover:bg-neutral-600 transition">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-pink-600 text-white text-sm font-semibold hover:bg-pink-500 disabled:opacity-50 transition">
          {saving ? 'Saving…' : 'Save Package'}
        </button>
      </div>
    </form>
  );
}

export default function AdminCreditPackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null); // package object being edited
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    setSEO('Credit Packages | Admin', '', { robots: 'noindex, nofollow' });
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/credit-packages');
      setPackages(Array.isArray(data) ? data : []);
    } catch { setPackages([]); }
    finally { setLoading(false); }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleCreate = async (form) => {
    setSaving(true);
    try {
      await api.post('/admin/credit-packages', form);
      showToast('Package created.');
      setShowForm(false);
      fetchPackages();
    } catch (err) { showToast(err?.response?.data?.error || 'Failed to create.'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (form) => {
    setSaving(true);
    try {
      await api.put(`/admin/credit-packages/${editing._id}`, form);
      showToast('Package updated.');
      setEditing(null);
      fetchPackages();
    } catch (err) { showToast(err?.response?.data?.error || 'Failed to update.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/credit-packages/${id}`);
      showToast('Package deleted.');
      setConfirmDelete(null);
      fetchPackages();
    } catch { showToast('Failed to delete.'); }
  };

  const handleToggle = async (pkg) => {
    try {
      await api.put(`/admin/credit-packages/${pkg._id}`, { isActive: !pkg.isActive });
      fetchPackages();
    } catch { showToast('Failed to toggle.'); }
  };

  return (
    <div className="p-6 space-y-6 min-h-full">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Coins size={24} className="text-yellow-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Credit Packages</h1>
            <p className="text-sm text-neutral-400">Define pricing tiers shown to clients on the credits page.</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-sm font-semibold transition-colors"
        >
          <Plus size={16} /> New Package
        </button>
      </div>

      {toast && (
        <div className="rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm text-white">{toast}</div>
      )}

      {/* Create form */}
      {showForm && !editing && (
        <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">New Package</h2>
          <PackageForm onSave={handleCreate} onCancel={() => setShowForm(false)} saving={saving} />
        </div>
      )}

      {/* Package cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-neutral-800 animate-pulse" />)}
        </div>
      ) : packages.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <Coins size={40} className="mx-auto mb-3 opacity-30" />
          <p>No packages yet. Create one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div key={pkg._id} className={`rounded-2xl border p-5 space-y-3 relative ${pkg.isActive ? 'bg-neutral-900 border-neutral-700' : 'bg-neutral-950 border-neutral-800 opacity-60'}`}>
              {pkg.isPopular && (
                <span className="absolute -top-2.5 left-4 rounded-full bg-pink-600 text-white text-[10px] font-bold px-2.5 py-0.5 flex items-center gap-1">
                  <Star size={9} fill="currentColor" /> Popular
                </span>
              )}

              {/* Edit form inline */}
              {editing?._id === pkg._id ? (
                <>
                  <h3 className="text-sm font-semibold text-white mb-3">Editing: {pkg.name}</h3>
                  <PackageForm initial={{ ...pkg, priceCents: pkg.priceCents / 100 }} onSave={handleEdit} onCancel={() => setEditing(null)} saving={saving} />
                </>
              ) : (
                <>
                  <div>
                    <p className="text-base font-bold text-white">{pkg.name}</p>
                    {pkg.description && <p className="text-xs text-neutral-400 mt-0.5">{pkg.description}</p>}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">{fmt(pkg.priceCents)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Coins size={14} className="text-yellow-400" />
                    <span className="text-sm font-semibold text-yellow-300">{pkg.credits.toLocaleString()} credits</span>
                    <span className="text-xs text-neutral-500">≈ {Math.floor(pkg.credits / 20)} messages</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button onClick={() => setEditing(pkg)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-700 hover:bg-neutral-600 text-white text-xs transition">
                      <Pencil size={12} /> Edit
                    </button>
                    <button onClick={() => handleToggle(pkg)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition ${pkg.isActive ? 'bg-neutral-700 hover:bg-neutral-600 text-white' : 'bg-green-900 hover:bg-green-800 text-green-300'}`}>
                      {pkg.isActive ? <><XCircle size={12} /> Deactivate</> : <><CheckCircle size={12} /> Activate</>}
                    </button>
                    <button onClick={() => setConfirmDelete(pkg._id)} className="ml-auto p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-900/30 transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle size={20} />
              <h2 className="font-semibold text-white">Delete package?</h2>
            </div>
            <p className="text-sm text-neutral-400">This cannot be undone. Clients will no longer see this package.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 rounded-lg bg-neutral-700 text-white text-sm hover:bg-neutral-600 transition">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import {
  Plus, Pencil, Trash2, Save, X, AlertCircle,
  Trophy, Rocket, Send, CheckSquare, Square,
} from 'lucide-react';
import api from '@/shared/utils/api';
import { setSEO } from '@/shared/utils/seo';

const ACCOUNT_TYPES = [
  { value: 'provider', label: 'Providers' },
  { value: 'client', label: 'Clients' },
];

function MilestoneForm({ initial, onSave, onCancel, saving }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), description: description.trim(), sortOrder: Number(sortOrder) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-neutral-300 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Complete 10 dates"
          required
          maxLength={80}
          className="w-full border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-300 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain what this milestone celebrates…"
          maxLength={300}
          rows={3}
          className="w-full border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>
      <div className="w-32">
        <label className="block text-xs font-medium text-neutral-300 mb-1">Sort order</label>
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          min={0}
          className="w-full border border-neutral-700 bg-neutral-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving || !title.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
        >
          <Save size={14} /> {saving ? 'Saving…' : 'Save'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-neutral-600 text-sm text-neutral-300 hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function MilestoneCard({ milestone, selected, onToggleSelect, onEdit, onDelete, onPublish, publishing }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isDraft = milestone.status === 'draft';

  return (
    <div className={`rounded-2xl border p-5 transition-all ${isDraft ? 'border-pink-100 bg-white' : 'border-gray-200 bg-gray-50'}`}>
      <div className="flex items-start gap-3">
        {isDraft && (
          <button
            type="button"
            onClick={() => onToggleSelect(milestone._id)}
            className="mt-0.5 shrink-0 text-pink-600"
            title={selected ? 'Deselect' : 'Select for publish'}
          >
            {selected ? <CheckSquare size={20} /> : <Square size={20} className="text-gray-300" />}
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 text-sm leading-snug">{milestone.title}</p>
            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
              isDraft ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isDraft ? 'Draft' : 'Published'}
            </span>
          </div>
          {milestone.description && (
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{milestone.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-1.5">Sort order: {milestone.sortOrder}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isDraft && (
            <button
              onClick={() => onPublish(milestone._id)}
              disabled={publishing}
              title="Publish now"
              className="h-8 w-8 rounded-xl flex items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
            >
              <Send size={14} />
            </button>
          )}
          <button
            onClick={() => onEdit(milestone)}
            title="Edit"
            className="h-8 w-8 rounded-xl flex items-center justify-center border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Pencil size={14} />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(milestone._id)}
                className="h-8 px-2 rounded-xl flex items-center justify-center border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold transition-colors"
                title="Confirm delete"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="h-8 w-8 rounded-xl flex items-center justify-center border border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                title="Cancel"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              title="Delete"
              className="h-8 w-8 rounded-xl flex items-center justify-center border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminMilestonesPage() {
  const [accountType, setAccountType] = useState('provider');
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editMilestone, setEditMilestone] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [confirmPublish, setConfirmPublish] = useState(null); // { ids, total, breakdown }
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    setSEO('Milestones Management | Admin', '', { robots: 'noindex, nofollow' });
  }, []);

  useEffect(() => {
    fetchMilestones();
    setSelectedIds([]);
    setShowAdd(false);
    setEditMilestone(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountType]);

  const fetchMilestones = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/milestones', { params: { accountType } });
      setMilestones(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load milestones.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await api.post('/admin/milestones', { ...data, accountType });
      setShowAdd(false);
      fetchMilestones();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create milestone.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await api.put(`/admin/milestones/${editMilestone._id}`, data);
      setEditMilestone(null);
      fetchMilestones();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update milestone.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/milestones/${id}`);
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      fetchMilestones();
    } catch {
      setError('Failed to delete milestone.');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handlePublish = async (ids) => {
    if (!ids.length) return;
    setPublishing(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post('/admin/milestones/publish', { ids });
      setSuccess(
        `Published ${data.milestones?.length ?? ids.length} milestone${data.milestones?.length === 1 ? '' : 's'} — notified ${data.notifiedUsers ?? 0} ${accountType}${data.notifiedUsers === 1 ? '' : 's'}.`
      );
      setSelectedIds([]);
      fetchMilestones();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to publish milestones.');
    } finally {
      setPublishing(false);
    }
  };

  // Publishing emails + notifies every matching user, so require an explicit
  // confirmation showing the real recipient count before it actually fires.
  const requestPublish = async (ids) => {
    if (!ids.length) return;
    setError('');
    setPreviewLoading(true);
    try {
      const { data } = await api.post('/admin/milestones/publish/preview', { ids });
      setConfirmPublish({ ids, total: data.total ?? 0, breakdown: data.breakdown || {} });
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to preview publish.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const confirmAndPublish = async () => {
    if (!confirmPublish) return;
    await handlePublish(confirmPublish.ids);
    setConfirmPublish(null);
  };

  const drafts = milestones.filter((m) => m.status === 'draft');
  const published = milestones.filter((m) => m.status === 'published');

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy size={22} className="text-pink-400" /> Milestones Management
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            {drafts.length} draft{drafts.length === 1 ? '' : 's'} · {published.length} published
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setEditMilestone(null); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-sm font-semibold transition-colors"
        >
          <Plus size={15} /> Add Milestone
        </button>
      </div>

      {/* Provider / Client toggle */}
      <div className="inline-flex rounded-xl border border-neutral-700 bg-neutral-900 p-1">
        {ACCOUNT_TYPES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setAccountType(value)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              accountType === value ? 'bg-pink-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Rocket size={13} /> {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 text-sm text-emerald-400">
          <Send size={15} /> {success}
          <button onClick={() => setSuccess('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Add form */}
      {showAdd && !editMilestone && (
        <div className="bg-neutral-900 border border-pink-500/30 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Plus size={14} className="text-pink-400" /> New {accountType} milestone (draft)
          </h2>
          <MilestoneForm onSave={handleCreate} onCancel={() => setShowAdd(false)} saving={saving} />
        </div>
      )}

      {/* Edit form */}
      {editMilestone && (
        <div className="bg-neutral-900 border border-blue-500/30 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Pencil size={14} className="text-blue-400" /> Edit milestone
          </h2>
          <MilestoneForm initial={editMilestone} onSave={handleUpdate} onCancel={() => setEditMilestone(null)} saving={saving} />
        </div>
      )}

      {/* Draft section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-neutral-300">Drafts</h2>
          {selectedIds.length > 0 && (
            <button
              onClick={() => requestPublish(selectedIds)}
              disabled={publishing || previewLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
            >
              <Send size={13} /> {previewLoading ? 'Checking…' : `Publish selected (${selectedIds.length})`}
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-20 rounded-2xl bg-neutral-800 animate-pulse" />)}
          </div>
        ) : drafts.length === 0 ? (
          <p className="text-sm text-neutral-500">No draft milestones for {accountType}s.</p>
        ) : (
          <div className="space-y-3">
            {drafts.map((m) => (
              <MilestoneCard
                key={m._id}
                milestone={m}
                selected={selectedIds.includes(m._id)}
                onToggleSelect={toggleSelect}
                onEdit={setEditMilestone}
                onDelete={handleDelete}
                onPublish={(id) => requestPublish([id])}
                publishing={publishing || previewLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Published section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-300">Published</h2>
        {!loading && published.length === 0 ? (
          <p className="text-sm text-neutral-500">No published milestones for {accountType}s yet.</p>
        ) : (
          <div className="space-y-3">
            {published.map((m) => (
              <MilestoneCard
                key={m._id}
                milestone={m}
                selected={false}
                onToggleSelect={() => {}}
                onEdit={setEditMilestone}
                onDelete={handleDelete}
                onPublish={() => {}}
                publishing={publishing}
              />
            ))}
          </div>
        )}
      </div>

      {/* Publish confirmation — prevents accidentally mass-emailing every matching user */}
      {confirmPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-neutral-900 border border-emerald-500/30 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2 mb-2">
              <Send size={16} className="text-emerald-400" /> Confirm publish
            </h3>
            <p className="text-sm text-neutral-300 mb-4">
              This will publish {confirmPublish.ids.length} milestone{confirmPublish.ids.length === 1 ? '' : 's'} and
              immediately notify (in-app + email){' '}
              <span className="font-bold text-white">{confirmPublish.total}</span> user
              {confirmPublish.total === 1 ? '' : 's'}.
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmAndPublish}
                disabled={publishing}
                className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
              >
                {publishing ? 'Publishing…' : `Notify ${confirmPublish.total} user${confirmPublish.total === 1 ? '' : 's'}`}
              </button>
              <button
                onClick={() => setConfirmPublish(null)}
                disabled={publishing}
                className="px-4 py-2 rounded-xl border border-neutral-600 text-sm text-neutral-300 hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Send, LayoutGrid, List, X, Check, ImageIcon,
} from 'lucide-react';
import api from '@/shared/utils/api';
import { UserContext } from '@/context/UserContext';
import { setSEO } from '@/shared/utils/seo';

const ALL_CATEGORIES = [
  'Restrictions 🚫', 'Only AA 🔥', 'Baddies 💝', 'Latinas ❤️‍🔥', 'BBW ⛱️',
  'Asians 🌏', 'LGBQT+ 🌈', 'Party N Play ❄️', '40+ 🔞', 'MILF 💅',
  'Request Pickup/Dropoff 💳', 'Car Dates 🚘', 'No AA ❌', 'GFE 💋',
  'Mature 💦', 'BDSM 👣', '24/7 ☀️',
];

const EMPTY_FORM = {
  title: '', description: '', categories: [], pictures: [],
  city: '', state: '', country: '', visibility: 'Both',
};

// ─── Confirm dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
        <p className="text-gray-800 text-sm mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm bg-red-600 text-white hover:bg-red-700">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Create / Edit Modal ──────────────────────────────────────────────────────
function TemplateModal({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial ?? EMPTY_FORM);
  const [pictureInput, setPictureInput] = useState('');

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleCategory = (cat) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }));
  };

  const addPicture = () => {
    const url = pictureInput.trim();
    if (!url) return;
    setForm((f) => ({ ...f, pictures: [...f.pictures, url] }));
    setPictureInput('');
  };

  const removePicture = (i) =>
    setForm((f) => ({ ...f, pictures: f.pictures.filter((_, idx) => idx !== i) }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {initial ? 'Edit Template' : 'New Post Template'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Post title..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe your post..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Categories</label>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const active = form.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                      active
                        ? 'bg-pink-600 border-pink-600 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-pink-400 hover:text-pink-600'
                    }`}
                  >
                    {active && <Check size={10} className="inline mr-1" />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Photo URLs <span className="text-gray-400 font-normal normal-case">(paste hosted image links)</span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="url"
                value={pictureInput}
                onChange={(e) => setPictureInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPicture())}
                placeholder="https://..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
              <button
                type="button"
                onClick={addPicture}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-medium"
              >Add</button>
            </div>
            {form.pictures.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.pictures.map((url, i) => (
                  <div key={i} className="relative group w-16 h-16">
                    <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                    <button
                      onClick={() => removePicture(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white hidden group-hover:flex items-center justify-center"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Location row */}
          <div className="grid grid-cols-3 gap-3">
            {[['city', 'City'], ['state', 'State'], ['country', 'Country']].map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">{label}</label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => set(key, e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
            ))}
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Visibility</label>
            <select
              value={form.visibility}
              onChange={(e) => set('visibility', e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
            >
              {['Both', 'Men', 'Women'].map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.title.trim()}
            className="px-5 py-2 rounded-xl text-sm bg-pink-600 text-white font-medium hover:bg-pink-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save Template'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Post Template Card ───────────────────────────────────────────────────────
function TemplateCard({ template, onEdit, onDelete, onPublish, publishing }) {
  const thumb = template.pictures?.[0];
  const cats = template.categories?.filter((c) => c !== 'uncategorized').slice(0, 3) ?? [];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Thumbnail */}
      <div className="h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
        {thumb
          ? <img src={thumb} alt={template.title} className="w-full h-full object-cover" />
          : <ImageIcon size={28} className="text-gray-300" />
        }
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm truncate mb-1">{template.title}</h3>
        {template.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{template.description}</p>
        )}
        {cats.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {cats.map((c) => (
              <span key={c} className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 text-[10px] font-medium">{c}</span>
            ))}
          </div>
        )}
        <p className="text-[10px] text-gray-400 mb-3">
          {new Date(template.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onPublish(template._id)}
            disabled={publishing === template._id}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600 text-white text-xs font-medium hover:bg-pink-700 disabled:opacity-50 transition-colors"
          >
            <Send size={12} />
            {publishing === template._id ? 'Posting…' : 'Post Now'}
          </button>
          <button onClick={() => onEdit(template)} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
            <Pencil size={14} />
          </button>
          <button onClick={() => onDelete(template._id)} className="p-1.5 rounded-lg border border-gray-200 text-red-400 hover:bg-red-50">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SavedPostsPage() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    setSEO('Saved Posts | Mystery Mansion', '', { robots: 'noindex, nofollow' });
    fetchTemplates();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/saved-posts');
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      // Only show an error for unexpected server failures (5xx).
      // 401/403/404 or an empty result should just render the empty state.
      const status = err?.response?.status;
      if (status && status >= 500) {
        setError('Something went wrong loading your templates. Please try again.');
      } else {
        setTemplates([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editTarget) {
        const { data } = await api.put(`/saved-posts/${editTarget._id}`, form);
        setTemplates((prev) => prev.map((t) => (t._id === data._id ? data : t)));
        showToast('Template updated.');
      } else {
        const { data } = await api.post('/saved-posts', form);
        setTemplates((prev) => [data, ...prev]);
        showToast('Template saved.');
      }
      setShowModal(false);
      setEditTarget(null);
    } catch {
      showToast('Failed to save template.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async (id) => {
    setPublishing(id);
    try {
      await api.post(`/saved-posts/${id}/publish`);
      showToast('Post published successfully!');
      navigate('/home');
    } catch {
      showToast('Failed to publish post.');
    } finally {
      setPublishing(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/saved-posts/${deleteId}`);
      setTemplates((prev) => prev.filter((t) => t._id !== deleteId));
      showToast('Template deleted.');
    } catch {
      showToast('Failed to delete.');
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (template) => {
    setEditTarget(template);
    setShowModal(true);
  };

  const openNew = () => {
    setEditTarget(null);
    setShowModal(true);
  };

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Posts</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create reusable post templates and publish them anytime.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'cards' ? 'bg-pink-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 text-sm transition-colors ${viewMode === 'table' ? 'bg-pink-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <List size={16} />
            </button>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 text-white text-sm font-medium hover:bg-pink-700 transition-colors"
          >
            <Plus size={16} />
            New Template
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 border-pink-600 border-t-transparent animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loading && templates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mb-4">
            <ImageIcon size={28} className="text-pink-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No saved templates yet</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-xs">Save a post template to reuse it anytime without retyping everything.</p>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-pink-600 text-white text-sm font-medium hover:bg-pink-700"
          >
            <Plus size={15} /> Create First Template
          </button>
        </div>
      )}

      {/* ── Cards view ── */}
      {!loading && templates.length > 0 && viewMode === 'cards' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {templates.map((t) => (
            <TemplateCard
              key={t._id}
              template={t}
              onEdit={openEdit}
              onDelete={setDeleteId}
              onPublish={handlePublish}
              publishing={publishing}
            />
          ))}
        </div>
      )}

      {/* ── Table view ── */}
      {!loading && templates.length > 0 && viewMode === 'table' && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Template</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden sm:table-cell">Categories</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">Location</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">Updated</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {templates.map((t) => {
                  const thumb = t.pictures?.[0];
                  const cats = t.categories?.filter((c) => c !== 'uncategorized') ?? [];
                  const location = [t.city, t.state, t.country].filter(Boolean).join(', ');

                  return (
                    <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                      {/* Title + thumb */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
                            {thumb
                              ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                              : <ImageIcon size={14} className="text-gray-300" />
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate max-w-[180px]">{t.title}</p>
                            {t.description && (
                              <p className="text-xs text-gray-500 truncate max-w-[180px]">{t.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Categories */}
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {cats.slice(0, 3).map((c) => (
                            <span key={c} className="px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 text-[10px] font-medium whitespace-nowrap">{c}</span>
                          ))}
                          {cats.length > 3 && <span className="text-xs text-gray-400">+{cats.length - 3}</span>}
                          {cats.length === 0 && <span className="text-xs text-gray-400">—</span>}
                        </div>
                      </td>
                      {/* Location */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-gray-600 text-xs">{location || '—'}</span>
                      </td>
                      {/* Date */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-gray-500 text-xs">
                          {new Date(t.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handlePublish(t._id)}
                            disabled={publishing === t._id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600 text-white text-xs font-medium hover:bg-pink-700 disabled:opacity-50 transition-colors"
                          >
                            <Send size={11} />
                            {publishing === t._id ? 'Posting…' : 'Post Now'}
                          </button>
                          <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => setDeleteId(t._id)} className="p-1.5 rounded-lg border border-gray-200 text-red-400 hover:bg-red-50">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <TemplateModal
          initial={editTarget}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
          saving={saving}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          message="Delete this template? This cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-sm px-4 py-3 rounded-xl shadow-lg animate-fade-in">
          {toast}
        </div>
      )}
    </div>
  );
}

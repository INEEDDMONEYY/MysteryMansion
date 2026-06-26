import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Save, X, Tag, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/shared/utils/api';
import { setSEO } from '@/shared/utils/seo';

/* ── Inline form (add / edit) ───────────────────────────────────────────── */
function CategoryForm({ initial, onSave, onCancel, saving }) {
  const [name,      setName]      = useState(initial?.name      || '');
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [isActive,  setIsActive]  = useState(initial?.isActive  !== false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), sortOrder: Number(sortOrder), isActive });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-neutral-300 mb-1">
          Category name <span className="text-neutral-500">(include emoji if desired)</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. GFE 💋"
          required
          className="w-full border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs font-medium text-neutral-300 mb-1">
            Sort order <span className="text-neutral-500">(lower = first)</span>
          </label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            min={0}
            className="w-full border border-neutral-700 bg-neutral-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
        <div className="flex items-center mt-5">
          <button
            type="button"
            onClick={() => setIsActive((v) => !v)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-colors ${
              isActive
                ? 'border-green-500/40 bg-green-500/10 text-green-400'
                : 'border-neutral-600 bg-neutral-800 text-neutral-400'
            }`}
          >
            {isActive ? <Eye size={13} /> : <EyeOff size={13} />}
            {isActive ? 'Active' : 'Hidden'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving || !name.trim()}
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

/* ── Category row card ──────────────────────────────────────────────────── */
function CategoryCard({ cat, onEdit, onDelete, onToggle }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(cat);
    setToggling(false);
  };

  return (
    <div className={`rounded-2xl border p-4 transition-all flex items-center gap-3 ${cat.isActive ? 'border-pink-100 bg-white' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
      <span className={`shrink-0 h-7 w-7 rounded-xl flex items-center justify-center text-xs font-bold ${cat.isActive ? 'bg-pink-100 text-pink-600' : 'bg-gray-200 text-gray-400'}`}>
        {cat.sortOrder}
      </span>

      <p className="flex-1 font-semibold text-gray-900 text-sm truncate">{cat.name}</p>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleToggle}
          disabled={toggling}
          title={cat.isActive ? 'Hide' : 'Show'}
          className={`h-8 w-8 rounded-xl flex items-center justify-center border transition-colors ${
            cat.isActive
              ? 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'
              : 'border-gray-200 bg-gray-100 text-gray-400 hover:bg-gray-200'
          }`}
        >
          {cat.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>

        <button
          onClick={() => onEdit(cat)}
          className="h-8 w-8 rounded-xl flex items-center justify-center border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          title="Edit"
        >
          <Pencil size={14} />
        </button>

        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDelete(cat._id)}
              className="h-8 w-8 rounded-xl flex items-center justify-center border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              title="Confirm delete"
            >
              <CheckCircle size={14} />
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
            className="h-8 w-8 rounded-xl flex items-center justify-center border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [showAdd,    setShowAdd]    = useState(false);
  const [editCat,    setEditCat]    = useState(null);
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    setSEO('Category Management | Admin', '', { robots: 'noindex, nofollow' });
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await api.post('/admin/categories', data);
      setShowAdd(false);
      fetchCategories();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await api.put(`/admin/categories/${editCat._id}`, data);
      setEditCat(null);
      fetchCategories();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch {
      setError('Failed to delete category.');
    }
  };

  const handleToggle = async (cat) => {
    try {
      await api.put(`/admin/categories/${cat._id}`, { isActive: !cat.isActive });
      fetchCategories();
    } catch {
      setError('Failed to update category.');
    }
  };

  const activeCount = categories.filter((c) => c.isActive).length;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Tag size={22} className="text-pink-400" /> Category Management
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            {categories.length} total · {activeCount} active (visible in the category bar)
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setEditCat(null); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-sm font-semibold transition-colors"
        >
          <Plus size={15} /> Add Category
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Add form */}
      {showAdd && !editCat && (
        <div className="bg-neutral-900 border border-pink-500/30 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Plus size={14} className="text-pink-400" /> New Category
          </h2>
          <CategoryForm
            onSave={handleCreate}
            onCancel={() => setShowAdd(false)}
            saving={saving}
          />
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-neutral-500">
          <Tag size={40} className="opacity-20" />
          <p className="text-sm">No categories yet — click "Add Category" to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) =>
            editCat?._id === cat._id ? (
              <div key={cat._id} className="bg-neutral-900 border border-blue-500/30 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Pencil size={14} className="text-blue-400" /> Edit Category
                </h2>
                <CategoryForm
                  initial={cat}
                  onSave={handleUpdate}
                  onCancel={() => setEditCat(null)}
                  saving={saving}
                />
              </div>
            ) : (
              <CategoryCard
                key={cat._id}
                cat={cat}
                onEdit={(c) => { setEditCat(c); setShowAdd(false); }}
                onDelete={handleDelete}
                onToggle={handleToggle}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

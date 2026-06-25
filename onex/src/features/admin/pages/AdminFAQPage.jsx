import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, CheckCircle, XCircle, Eye, EyeOff, Save, X, HelpCircle, AlertCircle } from 'lucide-react';
import api from '@/shared/utils/api';
import { setSEO } from '@/shared/utils/seo';

function FAQForm({ initial, onSave, onCancel, saving }) {
  const [question, setQuestion] = useState(initial?.question || '');
  const [answer, setAnswer]     = useState(initial?.answer || '');
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(initial?.isActive !== false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    onSave({ question: question.trim(), answer: answer.trim(), sortOrder: Number(sortOrder), isActive });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-xs font-medium text-neutral-300 mb-1">Question</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. How do I create my first post?"
          required
          className="w-full border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-300 mb-1">Answer</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Provide a clear, helpful answer…"
          required
          rows={4}
          className="w-full border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-500 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-pink-400"
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-neutral-300 mb-1">Sort order <span className="text-neutral-500">(lower = first)</span></label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            min={0}
            className="w-full border border-neutral-700 bg-neutral-800 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>
        <div className="flex items-center gap-2 mt-5">
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
          disabled={saving || !question.trim() || !answer.trim()}
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

function FAQCard({ faq, onEdit, onDelete, onToggle }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(faq);
    setToggling(false);
  };

  return (
    <div className={`rounded-2xl border p-5 transition-all ${faq.isActive ? 'border-pink-100 bg-white' : 'border-gray-200 bg-gray-50 opacity-70'}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 shrink-0 h-7 w-7 rounded-xl flex items-center justify-center text-xs font-bold ${faq.isActive ? 'bg-pink-100 text-pink-600' : 'bg-gray-200 text-gray-400'}`}>
          {faq.sortOrder}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm leading-snug">{faq.question}</p>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed line-clamp-3">{faq.answer}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleToggle}
            disabled={toggling}
            title={faq.isActive ? 'Hide from public' : 'Show on public FAQ'}
            className={`h-8 w-8 rounded-xl flex items-center justify-center border transition-colors ${
              faq.isActive
                ? 'border-green-200 bg-green-50 text-green-600 hover:bg-green-100'
                : 'border-gray-200 bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            {faq.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            onClick={() => onEdit(faq)}
            title="Edit"
            className="h-8 w-8 rounded-xl flex items-center justify-center border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            <Pencil size={14} />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(faq._id)}
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

export default function AdminFAQPage() {
  const [faqs, setFaqs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [showAdd, setShowAdd]   = useState(false);
  const [editFaq, setEditFaq]   = useState(null);
  const [saving, setSaving]     = useState(false);

  useEffect(() => {
    setSEO('FAQ Management | Admin', '', { robots: 'noindex, nofollow' });
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/faqs');
      setFaqs(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load FAQs.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await api.post('/admin/faqs', data);
      setShowAdd(false);
      fetchFaqs();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create FAQ.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await api.put(`/admin/faqs/${editFaq._id}`, data);
      setEditFaq(null);
      fetchFaqs();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to update FAQ.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/faqs/${id}`);
      fetchFaqs();
    } catch {
      setError('Failed to delete FAQ.');
    }
  };

  const handleToggle = async (faq) => {
    try {
      await api.put(`/admin/faqs/${faq._id}`, { isActive: !faq.isActive });
      fetchFaqs();
    } catch {
      setError('Failed to update FAQ.');
    }
  };

  const activeCount = faqs.filter((f) => f.isActive).length;

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <HelpCircle size={22} className="text-pink-400" /> FAQ Management
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            {faqs.length} total · {activeCount} active (visible on public FAQ page)
          </p>
        </div>
        <button
          onClick={() => { setShowAdd(true); setEditFaq(null); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-sm font-semibold transition-colors"
        >
          <Plus size={15} /> Add FAQ
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          <AlertCircle size={15} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Add form */}
      {showAdd && !editFaq && (
        <div className="bg-neutral-900 border border-pink-500/30 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Plus size={14} className="text-pink-400" /> New FAQ
          </h2>
          <FAQForm
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
            <div key={i} className="h-24 rounded-2xl bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-neutral-500">
          <HelpCircle size={40} className="opacity-20" />
          <p className="text-sm">No FAQs yet — click "Add FAQ" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) =>
            editFaq?._id === faq._id ? (
              <div key={faq._id} className="bg-neutral-900 border border-blue-500/30 rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Pencil size={14} className="text-blue-400" /> Edit FAQ
                </h2>
                <FAQForm
                  initial={faq}
                  onSave={handleUpdate}
                  onCancel={() => setEditFaq(null)}
                  saving={saving}
                />
              </div>
            ) : (
              <FAQCard
                key={faq._id}
                faq={faq}
                onEdit={(f) => { setEditFaq(f); setShowAdd(false); }}
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

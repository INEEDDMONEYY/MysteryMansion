import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight, Megaphone, Info, AlertTriangle, CheckCircle, Tag, Server, Mail } from 'lucide-react';
import api from '@/shared/utils/api';

const TYPE_META = {
  info:    { label: 'Info',        icon: Info,          ring: 'ring-sky-500/40',    bg: 'bg-sky-950',   text: 'text-sky-300',    badge: 'bg-sky-900 text-sky-300' },
  promo:   { label: 'Promo',       icon: Tag,           ring: 'ring-pink-500/40',   bg: 'bg-pink-950',  text: 'text-pink-300',   badge: 'bg-pink-900 text-pink-300' },
  warning: { label: 'Warning',     icon: AlertTriangle, ring: 'ring-amber-500/40',  bg: 'bg-amber-950', text: 'text-amber-300',  badge: 'bg-amber-900 text-amber-300' },
  success: { label: 'Success',     icon: CheckCircle,   ring: 'ring-emerald-500/40',bg: 'bg-emerald-950',text: 'text-emerald-300',badge: 'bg-emerald-900 text-emerald-300' },
};

const EMPTY_FORM = { title: '', message: '', type: 'info', expiresAt: '' };

export default function AdminBannersPage() {
  const [banners, setBanners]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  const [serverWarnEnabled, setServerWarnEnabled] = useState(
    () => localStorage.getItem('mm_server_issue_disabled') !== 'true'
  );
  const [emailEnabled, setEmailEnabled]     = useState(true);
  const [emailToggling, setEmailToggling]   = useState(false);

  // Load emailEnabled from admin settings
  useEffect(() => {
    api.get('/admin').then(({ data }) => {
      setEmailEnabled(data?.data?.emailEnabled !== false); // default true if undefined
    }).catch(() => {});
  }, []);

  const toggleServerWarn = () => {
    const next = !serverWarnEnabled;
    setServerWarnEnabled(next);
    if (next) {
      localStorage.removeItem('mm_server_issue_disabled');
    } else {
      localStorage.setItem('mm_server_issue_disabled', 'true');
    }
  };

  const toggleEmail = async () => {
    const next = !emailEnabled;
    setEmailEnabled(next); // optimistic — update UI immediately
    setEmailToggling(true);
    try {
      await api.put('/admin', { emailEnabled: next });
    } catch {
      setEmailEnabled(!next); // revert on failure
      setError('Failed to update email setting. Please try again.');
    } finally {
      setEmailToggling(false);
    }
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/banners');
      setBanners(data?.data || []);
    } catch {
      setError('Failed to load banners');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/banners', {
        title: form.title,
        message: form.message,
        type: form.type,
        expiresAt: form.expiresAt || null,
      });
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create banner');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/banners/${id}/toggle`);
      load();
    } catch {
      setError('Failed to toggle banner');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`);
      load();
    } catch {
      setError('Failed to delete banner');
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-pink-500/10 flex items-center justify-center">
          <Megaphone size={18} className="text-pink-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Site Banners</h1>
          <p className="text-xs text-neutral-500">Create announcement banners shown across the platform</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      {/* Email disabled warning banner */}
      {!emailEnabled && (
        <div className="flex items-start justify-between gap-4 bg-amber-500/10 border border-amber-500/40 rounded-2xl px-5 py-4">
          <div className="flex items-start gap-3">
            <Mail size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Transactional emails are disabled</p>
              <p className="text-xs text-amber-400/70 mt-0.5">
                Welcome emails, password resets, platform update notifications, and account deletion emails are all being skipped.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleEmail}
            disabled={emailToggling}
            className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-colors disabled:opacity-50"
          >
            Re-enable
          </button>
        </div>
      )}

      {/* System Banners — always-on safeguards */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-neutral-300 mb-1">System Banners</h2>
        <p className="text-xs text-neutral-500 mb-4">Built-in platform safeguards. These are not stored in the database — they are code-level warnings.</p>

        <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-neutral-800 border border-neutral-700">
          <div className="flex items-start gap-3">
            <Server size={16} className="text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Server Issue Warning</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Shows a red banner to all visitors if the backend does not respond within 80 seconds.
                Disable only if you are actively deploying and don't want users to see the warning.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleServerWarn}
            className="flex items-center gap-1.5 shrink-0 text-xs font-medium transition-colors"
          >
            {serverWarnEnabled
              ? <ToggleRight size={22} className="text-emerald-400" />
              : <ToggleLeft  size={22} className="text-neutral-500" />}
            <span className={serverWarnEnabled ? 'text-emerald-400' : 'text-neutral-500'}>
              {serverWarnEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </button>
        </div>

        {/* Email toggle */}
        <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-neutral-800 border border-neutral-700 mt-3">
          <div className="flex items-start gap-3">
            <Mail size={16} className="text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-white">Transactional Emails</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Controls all outgoing emails — welcome emails, password resets, platform update notifications, and account deletion emails.
                Disable before maintenance to prevent emails firing during deployments.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleEmail}
            disabled={emailToggling}
            className="flex items-center gap-1.5 shrink-0 text-xs font-medium transition-colors disabled:opacity-50"
          >
            {emailEnabled
              ? <ToggleRight size={22} className="text-emerald-400" />
              : <ToggleLeft  size={22} className="text-neutral-500" />}
            <span className={emailEnabled ? 'text-emerald-400' : 'text-neutral-500'}>
              {emailEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </button>
        </div>
      </div>

      {/* Create Form */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-neutral-300 mb-4">New Banner</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Title *</label>
              <input
                required
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Summer Sale Live Now"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1">Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500"
              >
                {Object.entries(TYPE_META).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1">Message *</label>
            <textarea
              required
              rows={3}
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Enter the banner message shown to all visitors…"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-pink-500 resize-none"
            />
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
              disabled={saving}
              className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              <Plus size={15} />
              {saving ? 'Creating…' : 'Create Banner'}
            </button>
          </div>
        </form>
      </div>

      {/* Banner List */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6">
        <h2 className="text-sm font-semibold text-neutral-300 mb-4">
          All Banners
          <span className="ml-2 text-neutral-500 font-normal">({banners.length})</span>
        </h2>

        {loading ? (
          <div className="text-center py-10 text-neutral-500 text-sm">Loading…</div>
        ) : banners.length === 0 ? (
          <div className="text-center py-10 text-neutral-600 text-sm">No banners yet. Create one above.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((b) => {
              const meta = TYPE_META[b.type] || TYPE_META.info;
              const Icon = meta.icon;
              return (
                <div
                  key={b._id}
                  className={`relative rounded-2xl border border-neutral-800 ${meta.bg} p-4 ring-1 ${meta.ring} ${!b.active ? 'opacity-50' : ''}`}
                >
                  {/* Type badge */}
                  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-3 ${meta.badge}`}>
                    <Icon size={11} />
                    {meta.label}
                  </span>

                  <h3 className={`text-sm font-semibold ${meta.text} mb-1`}>{b.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-3">{b.message}</p>

                  {b.expiresAt && (
                    <p className="text-[10px] text-neutral-500 mb-3">
                      Expires: {new Date(b.expiresAt).toLocaleString()}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(b._id)}
                      title={b.active ? 'Deactivate' : 'Activate'}
                      className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                      {b.active
                        ? <ToggleRight size={18} className="text-emerald-400" />
                        : <ToggleLeft size={18} />}
                      {b.active ? 'Active' : 'Inactive'}
                    </button>

                    <button
                      onClick={() => handleDelete(b._id)}
                      className="ml-auto p-1.5 rounded-lg hover:bg-red-900/40 text-neutral-500 hover:text-red-400 transition-colors"
                      title="Delete banner"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

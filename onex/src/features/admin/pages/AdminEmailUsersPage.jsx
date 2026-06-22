import { useState, useEffect } from 'react';
import { Send, Users, User, Search, CheckCircle2, XCircle, Loader2, Mail, Tag } from 'lucide-react';
import api from '@/shared/utils/api';

export default function AdminEmailUsersPage() {
  // Form state
  const [target, setTarget] = useState('all');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // User picker state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Promo code picker state
  const [promoCodes, setPromoCodes] = useState([]);
  const [promoPickerOpen, setPromoPickerOpen] = useState(false);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { sent, failed, total } | null
  const [error, setError] = useState('');

  // Load users for individual picker
  useEffect(() => {
    setUsersLoading(true);
    api.get('/admin/users')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.data || data?.users || [];
        setUsers(list.filter((u) => u.role !== 'admin'));
      })
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false));
  }, []);

  // Load active promo codes
  useEffect(() => {
    api.get('/admin/promo-codes')
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data?.promoCodes || [];
        setPromoCodes(list.filter((p) => p.isActive));
      })
      .catch(() => setPromoCodes([]));
  }, []);

  const filteredUsers = users.filter((u) =>
    !search ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleUser = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!subject.trim()) return setError('Subject is required.');
    if (!message.trim()) return setError('Message body is required.');
    if (target === 'individual' && selectedUserIds.length === 0)
      return setError('Select at least one recipient.');

    setSubmitting(true);
    try {
      const { data } = await api.post('/admin/email-users', {
        target,
        userIds: target === 'individual' ? selectedUserIds : undefined,
        subject: subject.trim(),
        message: message.trim(),
        promoCode: promoCode.trim() || undefined,
      });
      setResult(data);
      // Reset form on success
      setSubject('');
      setMessage('');
      setPromoCode('');
      setSelectedUserIds([]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send emails. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const recipientCount =
    target === 'all'
      ? users.length
      : selectedUserIds.length;

  return (
    <div className="space-y-6 pb-10 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-white">Email Users</h2>
        <p className="text-sm text-neutral-400 mt-0.5">
          Compose and send a custom email to all users or specific individuals.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Target selector */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <p className="text-sm font-medium text-white">Recipients</p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'all',        label: 'All Users',        icon: Users,  desc: `${users.length} users` },
              { value: 'individual', label: 'Individual Users', icon: User,   desc: `${selectedUserIds.length} selected` },
            ].map(({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTarget(value)}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                  target === value
                    ? 'border-pink-500/60 bg-pink-500/10 text-white'
                    : 'border-neutral-700 bg-neutral-800/50 text-neutral-400 hover:border-neutral-600 hover:text-white'
                }`}
              >
                <span className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                  target === value ? 'bg-pink-500/20' : 'bg-neutral-700/50'
                }`}>
                  <Icon size={16} className={target === value ? 'text-pink-400' : ''} />
                </span>
                <div>
                  <p className="text-sm font-medium leading-tight">{label}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Individual user picker */}
          {target === 'individual' && (
            <div className="space-y-3">

              {/* Selected chips */}
              {selectedUserIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedUserIds.map((id) => {
                    const u = users.find((x) => x._id === id);
                    if (!u) return null;
                    return (
                      <span
                        key={id}
                        className="flex items-center gap-1.5 bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs px-2.5 py-1 rounded-full"
                      >
                        {u.username}
                        <button
                          type="button"
                          onClick={() => toggleUser(id)}
                          className="hover:text-white transition-colors ml-0.5"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => setSelectedUserIds([])}
                    className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors px-1"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Search + list */}
              <div className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden">
                {/* Search bar */}
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-neutral-700">
                  <Search size={13} className="text-neutral-500 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search by username or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-white placeholder-neutral-500 outline-none"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="text-neutral-500 hover:text-neutral-300 transition-colors text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* User list — always visible */}
                <div className="max-h-64 overflow-y-auto divide-y divide-neutral-700/50">
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 size={18} className="animate-spin text-neutral-500" />
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <p className="text-center text-sm text-neutral-500 py-10">No users found</p>
                  ) : (
                    filteredUsers.map((u) => {
                      const checked = selectedUserIds.includes(u._id);
                      return (
                        <button
                          key={u._id}
                          type="button"
                          onClick={() => toggleUser(u._id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            checked
                              ? 'bg-pink-500/10 hover:bg-pink-500/15'
                              : 'hover:bg-neutral-700/40'
                          }`}
                        >
                          {u.profilePic ? (
                            <img src={u.profilePic} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-neutral-700 shrink-0 flex items-center justify-center text-xs text-neutral-400 font-semibold">
                              {u.username?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${checked ? 'text-pink-300' : 'text-white'}`}>
                              {u.username}
                            </p>
                            <p className="text-xs text-neutral-500 truncate">{u.email}</p>
                          </div>
                          <div className={`h-5 w-5 rounded-md border shrink-0 flex items-center justify-center transition-all ${
                            checked ? 'bg-pink-500 border-pink-500' : 'border-neutral-600'
                          }`}>
                            {checked && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Footer: select all / count */}
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-neutral-700 bg-neutral-900/40">
                  <button
                    type="button"
                    onClick={() => setSelectedUserIds(filteredUsers.map((u) => u._id))}
                    className="text-xs text-pink-400 hover:text-pink-300 transition-colors"
                  >
                    Select all {search ? 'filtered' : ''}
                  </button>
                  <span className="text-xs text-neutral-600">
                    {selectedUserIds.length} / {users.length} selected
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Email content */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
          <p className="text-sm font-medium text-white">Email Content</p>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 flex items-center gap-1.5">
              <Mail size={12} />
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Important Update from Mystery Mansion"
              maxLength={150}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500/60 transition-colors"
            />
          </div>

          {/* Message body */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here. Each line break will become a paragraph."
              rows={7}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500/60 transition-colors resize-none"
            />
            <p className="text-xs text-neutral-600 text-right">{message.length} chars</p>
          </div>
        </div>

        {/* Optional promo code */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white flex items-center gap-1.5">
                <Tag size={14} className="text-violet-400" />
                Promo Code
                <span className="text-xs text-neutral-600 font-normal ml-1">optional</span>
              </p>
              <p className="text-xs text-neutral-500 mt-0.5">Attach a promo code — it will appear highlighted in the email.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER25"
              maxLength={30}
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/60 transition-colors font-mono uppercase tracking-wide"
            />
            {promoCodes.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setPromoPickerOpen((v) => !v)}
                  className="h-full px-4 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-neutral-400 hover:text-white hover:border-neutral-500 transition-colors flex items-center gap-1.5"
                >
                  Pick
                  <ChevronDown size={12} className={`transition-transform ${promoPickerOpen ? 'rotate-180' : ''}`} />
                </button>
                {promoPickerOpen && (
                  <div className="absolute right-0 top-full mt-1 w-56 bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden shadow-xl z-10">
                    {promoCodes.map((p) => (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => { setPromoCode(p.code); setPromoPickerOpen(false); }}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-700 transition-colors text-left"
                      >
                        <span className="text-sm font-mono text-white font-semibold">{p.code}</span>
                        <span className="text-xs text-neutral-500">{p.durationDays}d</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
            <XCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Success result */}
        {result && (
          <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-4">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-400">Emails sent!</p>
              <p className="text-sm text-emerald-300/70 mt-0.5">
                {result.sent} sent successfully
                {result.failed > 0 && `, ${result.failed} failed`}
                {' '}out of {result.total} recipient{result.total !== 1 ? 's' : ''}.
              </p>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-sm text-neutral-500">
            {recipientCount > 0
              ? `Sending to ${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}`
              : 'No recipients selected'}
          </p>
          <button
            type="submit"
            disabled={submitting || recipientCount === 0}
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
          >
            {submitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
            {submitting ? 'Sending…' : 'Send Email'}
          </button>
        </div>
      </form>
    </div>
  );
}

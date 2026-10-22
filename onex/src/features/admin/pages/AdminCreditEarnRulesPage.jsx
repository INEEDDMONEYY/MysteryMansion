import { useCallback, useEffect, useState } from 'react';
import { Coins, Plus, Pencil, Trash2, Gift, X, AlertCircle } from 'lucide-react';
import api from '@/shared/utils/api';
import { setSEO } from '@/shared/utils/seo';

const ROLE_OPTIONS = [
  { value: 'provider', label: 'Providers' },
  { value: 'client', label: 'Clients' },
  { value: 'admin', label: 'Admins' },
];

const EMPTY_FORM = {
  key: '',
  label: '',
  description: '',
  credits: '',
  roles: ['provider', 'client'],
  limitPerDay: 0,
  lifetimeLimit: 0,
  trigger: 'manual',
  isActive: true,
  notify: true,
};

const inputClass =
  'w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-pink-500';

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-neutral-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function RuleForm({ initial, isEdit, saving, error, onSave, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const isSystem = Boolean(initial?.isSystem);

  const toggleRole = (role) =>
    set('roles', form.roles.includes(role) ? form.roles.filter((r) => r !== role) : [...form.roles, role]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      credits: Number(form.credits),
      limitPerDay: Number(form.limitPerDay || 0),
      lifetimeLimit: Number(form.lifetimeLimit || 0),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!isEdit && (
        <div>
          <label className="mb-1 block text-xs text-neutral-400">
            Key <span className="text-neutral-600">(lowercase, numbers, underscores — used by code to award it)</span>
          </label>
          <input
            value={form.key}
            onChange={(e) => set('key', e.target.value.toLowerCase())}
            placeholder="e.g. photo_contest_winner"
            required
            maxLength={40}
            className={inputClass}
          />
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-neutral-400">Name</label>
          <input value={form.label} onChange={(e) => set('label', e.target.value)} required maxLength={80} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-400">Credits awarded</label>
          <input type="number" min="1" max="10000" value={form.credits} onChange={(e) => set('credits', e.target.value)} required className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-400">Max per day <span className="text-neutral-600">(0 = unlimited)</span></label>
          <input type="number" min="0" value={form.limitPerDay} onChange={(e) => set('limitPerDay', e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-neutral-400">Max per account <span className="text-neutral-600">(0 = unlimited)</span></label>
          <input type="number" min="0" value={form.lifetimeLimit} onChange={(e) => set('lifetimeLimit', e.target.value)} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-neutral-400">Description <span className="text-neutral-600">(shown to members)</span></label>
        <input value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={300} className={inputClass} />
      </div>

      <div>
        <p className="mb-1 text-xs text-neutral-400">Who can earn this</p>
        <div className="flex flex-wrap gap-4">
          {ROLE_OPTIONS.map((role) => (
            <label key={role.value} className="flex cursor-pointer items-center gap-2 text-sm text-neutral-300">
              <input type="checkbox" checked={form.roles.includes(role.value)} onChange={() => toggleRole(role.value)} className="accent-pink-500" />
              {role.label}
            </label>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-neutral-600">Admin accounts can always earn from every active rule.</p>
      </div>

      {!isEdit && (
        <div>
          <label className="mb-1 block text-xs text-neutral-400">Trigger</label>
          <select value={form.trigger} onChange={(e) => set('trigger', e.target.value)} className={inputClass}>
            <option value="manual">Manual — I grant it to a member</option>
            <option value="automatic">Automatic — awarded by code using this key</option>
          </select>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-300">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} className="accent-pink-500" />
          Active
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-300">
          <input type="checkbox" checked={form.notify} onChange={(e) => set('notify', e.target.checked)} className="accent-pink-500" />
          Notify member when awarded
        </label>
      </div>

      {isSystem && (
        <p className="text-[11px] text-neutral-500">Built-in rule: the key and trigger are fixed, but everything else can be tuned.</p>
      )}

      {error && (
        <p className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle size={14} /> {error}
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="rounded-lg bg-neutral-700 px-4 py-2 text-sm text-white transition hover:bg-neutral-600">Cancel</button>
        <button type="submit" disabled={saving || form.roles.length === 0} className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-500 disabled:opacity-50">
          {saving ? 'Saving…' : 'Save Rule'}
        </button>
      </div>
    </form>
  );
}

function GrantForm({ rule, saving, error, onGrant, onCancel }) {
  const [username, setUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onGrant({ username: username.trim(), amount: amount === '' ? null : Number(amount), note });
      }}
      className="space-y-3"
    >
      <p className="text-sm text-neutral-400">
        Pays <strong className="text-white">{rule.label}</strong> to one member now. Role and limits are ignored.
      </p>
      <div>
        <label className="mb-1 block text-xs text-neutral-400">Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} required className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-neutral-400">Credits <span className="text-neutral-600">(blank = {rule.credits})</span></label>
        <input type="number" min="1" max="10000" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-xs text-neutral-400">Note <span className="text-neutral-600">(optional)</span></label>
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} className={inputClass} />
      </div>
      {error && (
        <p className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle size={14} /> {error}
        </p>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="rounded-lg bg-neutral-700 px-4 py-2 text-sm text-white transition hover:bg-neutral-600">Cancel</button>
        <button type="submit" disabled={saving} className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-500 disabled:opacity-50">
          {saving ? 'Granting…' : 'Grant Credits'}
        </button>
      </div>
    </form>
  );
}

function limitSummary(rule) {
  const parts = [];
  parts.push(rule.limitPerDay > 0 ? `${rule.limitPerDay}/day` : 'no daily cap');
  if (rule.lifetimeLimit > 0) parts.push(`${rule.lifetimeLimit} per account`);
  return parts.join(' · ');
}

export default function AdminCreditEarnRulesPage() {
  const [rules, setRules] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('rules');
  const [modal, setModal] = useState(null); // { type: 'create' | 'edit' | 'grant', rule? }
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rulesRes, txRes] = await Promise.all([
        api.get('/admin/credit-earn-rules'),
        api.get('/admin/credit-earn-rules/transactions', { params: { limit: 100 } }),
      ]);
      setRules(Array.isArray(rulesRes.data) ? rulesRes.data : []);
      setTransactions(Array.isArray(txRes.data) ? txRes.data : []);
    } catch {
      setRules([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setSEO('Earn Rules | Admin', '', { robots: 'noindex, nofollow' });
    load();
  }, [load]);

  const closeModal = () => {
    setModal(null);
    setFormError('');
  };

  const run = async (request, successMessage) => {
    setSaving(true);
    setFormError('');
    try {
      const res = await request();
      showToast(res?.data?.message || successMessage);
      closeModal();
      load();
    } catch (err) {
      setFormError(err?.response?.data?.error || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (rule) => {
    try {
      await api.put(`/admin/credit-earn-rules/${rule._id}`, { isActive: !rule.isActive });
      setRules((prev) => prev.map((r) => (r._id === rule._id ? { ...r, isActive: !r.isActive } : r)));
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to update.');
    }
  };

  const handleDelete = async (rule) => {
    try {
      await api.delete(`/admin/credit-earn-rules/${rule._id}`);
      showToast('Rule deleted.');
      setConfirmDelete(null);
      load();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to delete.');
      setConfirmDelete(null);
    }
  };

  return (
    <div className="max-w-5xl space-y-5 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-white">
            <Coins size={20} className="text-yellow-400" /> Earn Rules
          </h1>
          <p className="mt-0.5 text-sm text-neutral-400">
            Choose how members earn credits, how much, and which roles qualify.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal({ type: 'create' })}
          className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-pink-500"
        >
          <Plus size={15} /> New rule
        </button>
      </div>

      {toast && (
        <div role="status" className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-neutral-200">
          {toast}
        </div>
      )}

      <div className="flex gap-2">
        {[
          { key: 'rules', label: 'Rules' },
          { key: 'history', label: 'Recent awards' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              tab === t.key ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-neutral-900" />)}
        </div>
      ) : tab === 'rules' ? (
        <div className="space-y-3">
          {rules.length === 0 && (
            <p className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center text-sm text-neutral-500">
              No rules yet. Restart the backend to seed the built-in rules, or create one.
            </p>
          )}

          {rules.map((rule) => (
            <div key={rule._id} className={`rounded-2xl border bg-neutral-900 p-4 ${rule.isActive ? 'border-neutral-800' : 'border-neutral-800/60 opacity-70'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{rule.label}</h3>
                    <span className="rounded-full bg-yellow-400/10 px-2 py-0.5 text-xs font-bold text-yellow-400">+{rule.credits}</span>
                    <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-400">
                      {rule.isSystem ? 'Built-in' : 'Custom'} · {rule.trigger}
                    </span>
                    {rule.trigger === 'automatic' && !rule.hooked && (
                      <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-400">
                        Not connected yet
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-neutral-600">{rule.key}</p>
                  {rule.description && <p className="mt-1 text-sm text-neutral-400">{rule.description}</p>}
                  <p className="mt-2 text-xs text-neutral-500">
                    {rule.roles.join(', ')} · {limitSummary(rule)} · {rule.totalAwards.toLocaleString()} awards ({rule.totalCredits.toLocaleString()} credits)
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2 text-xs text-neutral-300">
                    <input type="checkbox" checked={rule.isActive} onChange={() => toggleActive(rule)} className="accent-pink-500" />
                    Active
                  </label>
                  {rule.trigger === 'manual' && (
                    <button type="button" onClick={() => setModal({ type: 'grant', rule })} title="Grant to a member" aria-label="Grant to a member" className="rounded-lg bg-neutral-800 p-2 text-neutral-300 transition hover:text-white">
                      <Gift size={15} />
                    </button>
                  )}
                  <button type="button" onClick={() => setModal({ type: 'edit', rule })} title="Edit" aria-label="Edit rule" className="rounded-lg bg-neutral-800 p-2 text-neutral-300 transition hover:text-white">
                    <Pencil size={15} />
                  </button>
                  {!rule.isSystem && (
                    <button type="button" onClick={() => setConfirmDelete(rule)} title="Delete" aria-label="Delete rule" className="rounded-lg bg-neutral-800 p-2 text-red-400 transition hover:text-red-300">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
          {transactions.length === 0 ? (
            <p className="p-6 text-center text-sm text-neutral-500">No credits have been awarded yet.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-800 text-xs uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Rule</th>
                  <th className="px-4 py-3 text-right">Credits</th>
                  <th className="px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="text-neutral-300">
                    <td className="px-4 py-2.5">{tx.userId?.username || 'Deleted user'}</td>
                    <td className="px-4 py-2.5">
                      {tx.ruleKey}
                      {tx.source === 'admin_grant' && (
                        <span className="ml-2 text-[10px] uppercase text-neutral-500">granted{tx.grantedBy?.username ? ` by ${tx.grantedBy.username}` : ''}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-green-400">+{tx.amount}</td>
                    <td className="px-4 py-2.5 text-neutral-500">{new Date(tx.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal?.type === 'create' && (
        <Modal title="New earn rule" onClose={closeModal}>
          <RuleForm
            saving={saving}
            error={formError}
            onCancel={closeModal}
            onSave={(form) => run(() => api.post('/admin/credit-earn-rules', form), 'Rule created.')}
          />
        </Modal>
      )}

      {modal?.type === 'edit' && (
        <Modal title={`Edit: ${modal.rule.label}`} onClose={closeModal}>
          <RuleForm
            isEdit
            initial={modal.rule}
            saving={saving}
            error={formError}
            onCancel={closeModal}
            onSave={(form) => run(() => api.put(`/admin/credit-earn-rules/${modal.rule._id}`, form), 'Rule updated.')}
          />
        </Modal>
      )}

      {modal?.type === 'grant' && (
        <Modal title="Grant credits" onClose={closeModal}>
          <GrantForm
            rule={modal.rule}
            saving={saving}
            error={formError}
            onCancel={closeModal}
            onGrant={(body) => run(() => api.post(`/admin/credit-earn-rules/${modal.rule._id}/grant`, body), 'Credits granted.')}
          />
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="Delete rule?" onClose={() => setConfirmDelete(null)}>
          <p className="text-sm text-neutral-400">
            Delete <strong className="text-white">{confirmDelete.label}</strong>? Past awards stay in the history.
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-lg bg-neutral-700 px-4 py-2 text-sm text-white transition hover:bg-neutral-600">Cancel</button>
            <button type="button" onClick={() => handleDelete(confirmDelete)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500">Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

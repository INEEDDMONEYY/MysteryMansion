import { useEffect, useState } from 'react';
import { Coins, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react';
import api from '@/shared/utils/api';
import { setSEO } from '@/shared/utils/seo';

const STATUS_TABS = ['pending', 'approved', 'rejected', 'all'];

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Clock },
  approved: { label: 'Approved', color: 'text-green-600 bg-green-50 border-green-200',   icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'text-red-600 bg-red-50 border-red-200',         icon: XCircle },
};

function RequestCard({ req, onApprove, onReject, acting }) {
  const [note, setNote] = useState('');
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        {/* User avatar stub */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {req.userId?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-gray-900">{req.userId?.username ?? 'Unknown'}</span>
            <span className="text-xs text-gray-400">{req.userId?.email}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-lg font-bold text-gray-900">+{req.amount} credits</span>
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
              <Icon size={11} /> {cfg.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Current balance: <strong>{req.userId?.credits ?? '—'}</strong> credits
          </p>
          {req.note && (
            <p className="text-xs text-gray-600 mt-1 bg-gray-50 rounded-lg px-2 py-1">
              "{req.note}"
            </p>
          )}
          {req.adminNote && (
            <p className="text-xs text-gray-400 mt-1 italic">Admin note: "{req.adminNote}"</p>
          )}
          <p className="text-[11px] text-gray-400 mt-1.5">
            {new Date(req.createdAt).toLocaleString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Actions — only for pending */}
      {req.status === 'pending' && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-2">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
          >
            <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            Add note (optional)
          </button>
          {open && (
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Admin note…"
              maxLength={500}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-purple-400"
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(req._id, note)}
              disabled={acting === req._id}
              className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle size={14} /> Approve
            </button>
            <button
              onClick={() => onReject(req._id, note)}
              disabled={acting === req._id}
              className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <XCircle size={14} /> Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCreditRequestsPage() {
  const [tab, setTab]         = useState('pending');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState(null); // id currently being actioned
  const [toast, setToast]     = useState('');

  useEffect(() => {
    setSEO('Credit Requests | Admin', '', { robots: 'noindex, nofollow' });
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [tab]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = tab !== 'all' ? `?status=${tab}` : '';
      const { data } = await api.get(`/admin/credit-requests${params}`);
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleApprove = async (id, note) => {
    setActing(id);
    try {
      const { data } = await api.post(`/admin/credit-requests/${id}/approve`, { adminNote: note });
      showToast(data.message || 'Approved.');
      fetchRequests();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to approve.');
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (id, note) => {
    setActing(id);
    try {
      await api.post(`/admin/credit-requests/${id}/reject`, { adminNote: note });
      showToast('Rejected.');
      fetchRequests();
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to reject.');
    } finally {
      setActing(null);
    }
  };

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="p-6 space-y-6 min-h-full">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Coins size={24} className="text-yellow-500" />
        <div>
          <h1 className="text-xl font-bold text-white">Credit Requests</h1>
          <p className="text-sm text-neutral-400">Review and approve client credit top-up requests.</p>
        </div>
        {tab === 'pending' && pendingCount > 0 && (
          <span className="ml-auto rounded-full bg-yellow-500 text-black text-xs font-bold px-2.5 py-1">
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="rounded-xl bg-neutral-800 border border-neutral-700 px-4 py-3 text-sm text-white">
          {toast}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-900 rounded-xl p-1 w-fit">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'bg-white text-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 text-neutral-500">
          <Coins size={40} className="mx-auto mb-3 opacity-30" />
          <p>No {tab === 'all' ? '' : tab} requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <RequestCard
              key={r._id}
              req={r}
              onApprove={handleApprove}
              onReject={handleReject}
              acting={acting}
            />
          ))}
        </div>
      )}
    </div>
  );
}

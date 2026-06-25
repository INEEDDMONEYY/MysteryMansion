import { useContext, useEffect, useState } from 'react';
import { Coins, Plus, Clock, CheckCircle, XCircle, AlertCircle, Star, Zap } from 'lucide-react';
import { UserContext } from '@/context/UserContext';
import api from '@/shared/utils/api';
import { setSEO } from '@/shared/utils/seo';

function fmt(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function PackageCard({ pkg, onSelect, selected }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(pkg)}
      className={`relative flex flex-col items-start p-4 rounded-2xl border-2 text-left transition-all w-full ${
        selected
          ? 'border-purple-500 bg-purple-50 shadow-md'
          : pkg.isPopular
          ? 'border-pink-400 bg-pink-50'
          : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/40'
      }`}
    >
      {pkg.isPopular && (
        <span className="absolute -top-3 left-3 flex items-center gap-1 rounded-full bg-pink-600 text-white text-[10px] font-bold px-2.5 py-0.5">
          <Star size={9} fill="currentColor" /> Popular
        </span>
      )}
      <p className="font-bold text-gray-900 text-sm">{pkg.name}</p>
      {pkg.description && <p className="text-xs text-gray-500 mt-0.5">{pkg.description}</p>}
      <p className="text-2xl font-extrabold text-gray-900 mt-2 leading-none">{fmt(pkg.priceCents)}</p>
      <div className="flex items-center gap-1.5 mt-2">
        <Coins size={13} className="text-yellow-500" />
        <span className="text-sm font-semibold text-yellow-700">{pkg.credits.toLocaleString()} credits</span>
      </div>
      <p className="text-[11px] text-gray-400 mt-0.5">≈ {Math.floor(pkg.credits / 20)} messages</p>
      {selected && (
        <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-purple-600">
          <Zap size={11} /> Selected — fill your payment note below
        </div>
      )}
    </button>
  );
}

const CREDITS_PER_MESSAGE = 20;

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  approved: { label: 'Approved', icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-50 border-green-200'  },
  rejected: { label: 'Rejected', icon: XCircle,      color: 'text-red-600',    bg: 'bg-red-50 border-red-200'      },
};

function RequestRow({ req }) {
  const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg}`}>
      <Icon size={18} className={`shrink-0 mt-0.5 ${cfg.color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900">+{req.amount} credits</span>
          <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
        </div>
        {req.note && <p className="text-xs text-gray-500 mt-0.5 truncate">{req.note}</p>}
        {req.adminNote && (
          <p className="text-xs text-gray-500 mt-1 italic">Admin: "{req.adminNote}"</p>
        )}
        <p className="text-[11px] text-gray-400 mt-1">
          {new Date(req.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
}

export default function ClientCreditsPage() {
  const { user } = useContext(UserContext);
  const [credits, setCredits]           = useState(null);
  const [requests, setRequests]         = useState([]);
  const [packages, setPackages]         = useState([]);
  const [selectedPkg, setSelectedPkg]   = useState(null);
  const [loadingData, setLoadingData]   = useState(true);
  const [amount, setAmount]             = useState('');
  const [note, setNote]                 = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [success, setSuccess]           = useState('');
  const [error, setError]               = useState('');

  useEffect(() => {
    setSEO('My Credits | Mystery Mansion', '', { robots: 'noindex, nofollow' });
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    const [balR, reqR, pkgR] = await Promise.allSettled([
      api.get('/credits/balance'),
      api.get('/credits/requests'),
      api.get('/credits/packages'),
    ]);
    if (balR.status === 'fulfilled') {
      setCredits(balR.value.data?.credits ?? 200);
    }
    if (reqR.status === 'fulfilled') {
      setRequests(Array.isArray(reqR.value.data) ? reqR.value.data : []);
    }
    if (pkgR.status === 'fulfilled') {
      setPackages(Array.isArray(pkgR.value.data) ? pkgR.value.data : []);
    }
    setLoadingData(false);
  };

  const handleSelectPackage = (pkg) => {
    setSelectedPkg(pkg);
    setAmount(String(pkg.credits));
    setNote(`Requesting ${pkg.credits} credits — ${pkg.name} package (${fmt(pkg.priceCents)}). `);
    setError('');
    setSuccess('');
    // Scroll to form
    setTimeout(() => document.getElementById('topup-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const amt = Number(amount);
    if (!amt || amt < 1 || !Number.isInteger(amt)) {
      setError('Please enter a whole number of credits.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/credits/request', { amount: amt, note: note.trim() });
      setSuccess('Request submitted! An admin will review it shortly.');
      setAmount('');
      setNote('');
      setSelectedPkg(null);
      fetchData();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const messages = credits !== null ? Math.floor(credits / CREDITS_PER_MESSAGE) : null;
  const isLow    = credits !== null && credits < CREDITS_PER_MESSAGE;

  return (
    <div className="min-h-full -m-4 md:-m-6 p-4 md:p-6 space-y-6 bg-gradient-to-br from-purple-50 via-pink-50 to-white">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Coins size={24} className="text-purple-500" /> My Credits
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Credits are required to message providers. Each message costs {CREDITS_PER_MESSAGE} credits.
        </p>
      </div>

      {/* Balance card */}
      <div className={`rounded-2xl p-6 shadow-sm border flex items-center gap-5 ${
        isLow ? 'bg-red-50 border-red-200' : 'bg-white border-purple-100'
      }`}>
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
          isLow ? 'bg-gradient-to-br from-red-400 to-rose-500' : 'bg-gradient-to-br from-purple-500 to-violet-600'
        }`}>
          <Coins size={30} className="text-white" />
        </div>
        <div>
          {loadingData ? (
            <div className="h-10 w-28 rounded-lg bg-gray-200 animate-pulse" />
          ) : (
            <>
              <p className="text-4xl font-extrabold text-gray-900 leading-none">
                {credits?.toLocaleString() ?? '—'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {messages !== null ? `≈ ${messages} message${messages !== 1 ? 's' : ''} remaining` : ''}
              </p>
            </>
          )}
        </div>
        {isLow && (
          <div className="ml-auto flex items-center gap-1.5 text-red-600 text-sm font-medium">
            <AlertCircle size={16} /> Insufficient credits
          </div>
        )}
      </div>

      {/* Pricing packages */}
      {packages.length > 0 && (
        <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Coins size={15} className="text-yellow-500" /> Credit Packages
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Choose a package below — it will pre-fill your request. Then add your payment details and submit.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {packages.map((pkg) => (
              <PackageCard
                key={pkg._id}
                pkg={pkg}
                onSelect={handleSelectPackage}
                selected={selectedPkg?._id === pkg._id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Request top-up */}
      <div id="topup-form" className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Plus size={16} className="text-purple-500" />
          <h2 className="text-sm font-semibold text-gray-900">Request a Top-Up</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Submit a request for additional credits. Include your payment reference (Venmo, CashApp handle, etc.)
          and an admin will approve and add the credits to your account.
        </p>

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            <CheckCircle size={16} /> {success}
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Credits requested
            </label>
            <input
              type="number"
              min="1"
              max="10000"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 200"
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Payment note <span className="text-gray-400">(payment method, reference, etc.)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Sent $10 via Venmo to @mysterymansion"
              rows={2}
              maxLength={500}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>
      </div>

      {/* Request history */}
      <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock size={15} className="text-purple-400" /> Request History
        </h2>
        {loadingData ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : requests.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No requests yet.</p>
        ) : (
          <div className="space-y-2">
            {requests.map((r) => <RequestRow key={r._id} req={r} />)}
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Gift, CheckCircle2, Clock } from 'lucide-react';
import api from '@/shared/utils/api';

const formatLimit = (rule) => {
  if (rule.trigger === 'manual') return 'Awarded by the team';
  const parts = [];
  if (rule.lifetimeLimit > 0) parts.push(rule.lifetimeLimit === 1 ? 'One time' : `Up to ${rule.lifetimeLimit} times`);
  if (rule.limitPerDay > 0) parts.push(rule.limitPerDay === 1 ? 'Once a day' : `Up to ${rule.limitPerDay}x a day`);
  return parts.length ? parts.join(' · ') : 'No limit';
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export default function EarnCreditsPanel() {
  const [rules, setRules] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get('/credits/earn/rules')
      .then((res) => setRules(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRules([]));
    api.get('/credits/earn/history', { params: { limit: 8 } })
      .then((res) => setHistory(Array.isArray(res.data) ? res.data : []))
      .catch(() => setHistory([]));
  }, []);

  if (rules !== null && rules.length === 0 && history.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2">
        <Gift size={15} className="text-pink-500" /> Earn Free Credits
      </h2>
      <p className="text-xs text-gray-500 mb-4">Complete these activities to earn credits automatically.</p>

      {rules === null ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rules.map((rule) => (
            <div
              key={rule.key}
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                rule.available ? 'border-slate-200 bg-slate-50' : 'border-green-200 bg-green-50'
              }`}
            >
              <div className="shrink-0 rounded-lg bg-yellow-100 px-2.5 py-1.5 text-sm font-bold text-yellow-700">
                +{rule.credits}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{rule.label}</p>
                <p className="text-xs text-gray-500">
                  {formatLimit(rule)}
                  {rule.limitPerDay > 0 && ` · ${rule.earnedToday}/${rule.limitPerDay} today`}
                </p>
              </div>
              {!rule.available && <CheckCircle2 size={16} className="shrink-0 text-green-600" />}
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Clock size={12} /> Recent earnings
          </h3>
          <ul className="divide-y divide-slate-100">
            {history.map((tx) => (
              <li key={tx._id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-gray-700">{tx.label}</span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{formatDate(tx.createdAt)}</span>
                  <span className="font-semibold text-green-600">+{tx.amount}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { X, Info, Tag, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '@/shared/utils/api';

const TYPE_META = {
  info:    { icon: Info,          bar: 'bg-sky-600',     text: 'text-sky-100',    bg: 'bg-sky-950 border-sky-800' },
  promo:   { icon: Tag,           bar: 'bg-pink-600',    text: 'text-pink-100',   bg: 'bg-pink-950 border-pink-800' },
  warning: { icon: AlertTriangle, bar: 'bg-amber-500',   text: 'text-amber-100',  bg: 'bg-amber-950 border-amber-800' },
  success: { icon: CheckCircle,   bar: 'bg-emerald-600', text: 'text-emerald-100',bg: 'bg-emerald-950 border-emerald-800' },
};

export default function SiteBanner() {
  const [banners, setBanners] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('dismissedBanners') || '[]'); }
    catch { return []; }
  });

  useEffect(() => {
    api.get('/banners/public')
      .then(res => setBanners(res.data?.data || []))
      .catch(() => {});
  }, []);

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    try { sessionStorage.setItem('dismissedBanners', JSON.stringify(next)); } catch {}
  };

  const visible = banners.filter(b => !dismissed.includes(b._id));
  if (visible.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-1">
      {visible.map(b => {
        const meta = TYPE_META[b.type] || TYPE_META.info;
        const Icon = meta.icon;
        return (
          <div key={b._id} className={`relative flex items-start gap-3 px-4 py-3 border-b ${meta.bg}`}>
            {/* Accent bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-r ${meta.bar}`} />

            <Icon size={15} className={`${meta.text} shrink-0 mt-0.5 ml-2`} />

            <div className="flex-1 min-w-0">
              <span className={`text-xs font-semibold ${meta.text}`}>{b.title}</span>
              {' — '}
              <span className="text-xs text-neutral-300">{b.message}</span>
            </div>

            <button
              onClick={() => dismiss(b._id)}
              className="shrink-0 text-neutral-500 hover:text-white transition-colors ml-2"
              aria-label="Dismiss banner"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

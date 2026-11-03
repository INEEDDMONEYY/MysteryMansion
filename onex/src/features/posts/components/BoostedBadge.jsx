import { Zap } from "lucide-react";

export default function BoostedBadge({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-md ring-1 ring-amber-300 sm:px-2 sm:text-[10px] ${className}`}
      title="Boosted post"
      aria-label="Boosted post"
    >
      <Zap size={11} className="fill-current" />
      Boosted
    </span>
  );
}

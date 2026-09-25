// 🧭 Post Detail Header

import { BadgeCheck, Rocket, Star, ArrowLeft } from "lucide-react";

export default function PostDetailHeader({
  badgeType = "",
  isTrustedProvider = false,
  isPermanentProvider = false,
  onBack,
}) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
        >
          <ArrowLeft size={16} />
          <span>Back to posts</span>
        </button>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${
              badgeType === "blue"
                ? "bg-blue-600 text-white"
                : badgeType === "pink"
                  ? "bg-gradient-to-r from-purple-500 via-pink-500 to-fuchsia-500 text-white"
                  : "bg-gray-200 text-gray-400"
            }`}
            aria-label={
              badgeType === "blue"
                ? "Verified"
                : badgeType === "pink"
                  ? "Paid Promo"
                  : "Unverified"
            }
            title={
              badgeType === "blue"
                ? "Verified (Monthly Badge)"
                : badgeType === "pink"
                  ? "Paid Promo"
                  : "Unverified"
            }
          >
            <BadgeCheck
              size={16}
              className={
                badgeType === "blue" || badgeType === "pink"
                  ? "text-white"
                  : "text-gray-400"
              }
            />

            {badgeType === "blue" && "Verified"}
            {badgeType === "pink" && "Paid Promo"}
          </span>

          {isTrustedProvider ? (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-2.5 py-1 text-xs font-semibold text-yellow-950 shadow-sm ring-1 ring-yellow-300"
              aria-label="Trusted provider"
              title="Trusted provider"
            >
              <Rocket size={14} className="text-yellow-900" />
              Trusted provider
            </span>
          ) : isPermanentProvider ? (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm"
              aria-label="Founding Provider"
              title="Founding Provider"
            >
              <Star size={14} className="fill-current" />
              Founding Provider
            </span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
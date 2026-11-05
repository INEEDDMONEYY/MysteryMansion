import { useEffect, useState } from "react";
import { Award } from "lucide-react";
import { fetchProfileBadges } from "@/features/users/services/badgeService";
import { getBadgeArtwork } from "@/features/users/utils/badgeArtwork";

export default function ProfileBadgesPanel({ userId }) {
  const [state, setState] = useState({ status: "loading", data: null });

  useEffect(() => {
    if (!userId) return undefined;
    const controller = new AbortController();
    setState({ status: "loading", data: null });
    fetchProfileBadges(userId, controller.signal)
      .then((data) => setState({ status: "ready", data }))
      .catch((err) => {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        setState({ status: "error", data: null });
      });
    return () => controller.abort();
  }, [userId]);

  const { status, data } = state;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-bold text-gray-900"><Award size={18} className="text-pink-600" />Badges</h2>
        {data && <span className="text-xs font-medium text-gray-500">{data.badges.length} of {data.totalBadges} earned</span>}
      </div>

      {status === "loading" && <p className="mt-4 text-sm text-gray-500" role="status">Loading badges...</p>}
      {status === "error" && <p className="mt-4 text-sm text-red-600" role="alert">Badges could not be loaded.</p>}

      {status === "ready" && data.badges.length === 0 && (
        <p className="mt-4 text-sm text-gray-500">No badges earned yet.</p>
      )}

      {status === "ready" && data.badges.length > 0 && (
        <ul className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {data.badges.map((badge) => {
            const artwork = getBadgeArtwork(badge);
            return (
              <li key={badge.id} title={`${badge.title} — ${badge.description}`} className="flex flex-col items-center gap-1 text-center">
                {artwork ? (
                  <img src={artwork} alt={badge.title} loading="lazy" className="aspect-square w-full max-w-16 object-contain" />
                ) : (
                  <span className="flex aspect-square w-full max-w-16 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                    <Award size={24} />
                  </span>
                )}
                <span className="line-clamp-1 w-full text-[11px] font-medium text-gray-700">{badge.title}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

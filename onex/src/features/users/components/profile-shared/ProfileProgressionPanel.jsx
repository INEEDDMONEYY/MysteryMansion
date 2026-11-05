import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { fetchProgression } from "@/features/users/services/progressionService";

const CATEGORY_LABELS = {
  onboarding: "Onboarding",
  activity: "Daily activity",
  content: "Posts & listings",
  community: "Community",
  forum: "Forum",
  milestones: "Milestones",
  referrals: "Referrals",
  achievements: "Achievements",
};

export default function ProfileProgressionPanel({ userId }) {
  const [state, setState] = useState({ status: "loading", data: null });

  useEffect(() => {
    if (!userId) return undefined;
    const controller = new AbortController();
    setState({ status: "loading", data: null });
    fetchProgression(userId, controller.signal)
      .then((data) => setState({ status: "ready", data }))
      .catch((err) => {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        setState({ status: "error", data: null });
      });
    return () => controller.abort();
  }, [userId]);

  const { status, data } = state;
  const percent = data ? Math.round((data.levelProgress || 0) * 100) : 0;

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-bold text-gray-900"><TrendingUp size={18} className="text-violet-600" />Progression</h2>
        {data && <span className="text-xs font-medium text-gray-500">Level {data.level} of {data.maxLevel}</span>}
      </div>

      {status === "loading" && <p className="mt-4 text-sm text-gray-500" role="status">Loading progression...</p>}
      {status === "error" && <p className="mt-4 text-sm text-red-600" role="alert">Progression could not be loaded.</p>}

      {status === "ready" && (
        <>
          <p className="mt-4 text-2xl font-bold text-gray-900">{data.rp.toLocaleString()} <span className="text-sm font-medium text-gray-500">RP</span></p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="Progress to next level">
            <div className="h-full rounded-full bg-violet-600" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {data.nextLevelRp
              ? `${(data.nextLevelRp - data.rp).toLocaleString()} RP to level ${data.level + 1}`
              : "Maximum level reached"}
          </p>

          {data.breakdown.length > 0 && (
            <ul className="mt-4 space-y-1.5 text-sm">
              {data.breakdown.map((row) => (
                <li key={row.category} className="flex items-center justify-between gap-2">
                  <span className="text-gray-700">{CATEGORY_LABELS[row.category] || row.category}</span>
                  <span className="font-medium text-gray-900">{row.points.toLocaleString()} RP</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

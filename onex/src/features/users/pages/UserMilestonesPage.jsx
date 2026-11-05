import BrandLoader from "@/shared/components/Loaders/BrandLoader";
import { useEffect, useState } from "react";
import { CircleCheck, Sparkles, Trophy, Lock } from "lucide-react";
import api from "@/shared/utils/api";
import { setSEO } from "@/shared/utils/seo";

const THEMES = {
  user: {
    page: "bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100",
    card: "bg-white/40 backdrop-blur-md border border-white/60 shadow-md",
    iconAchieved: "bg-gradient-to-br from-pink-500 to-purple-600",
    iconLocked: "bg-gray-300",
    reward: "text-purple-600",
    bar: "from-pink-500 to-purple-500",
    pill: "bg-pink-100 text-pink-700",
    sectionAchieved: "text-pink-500",
    sectionNew: "text-purple-500",
  },
  client: {
    page: "bg-gradient-to-br from-gray-100 via-white to-gray-200",
    card: "bg-white border border-gray-200 shadow-sm",
    iconAchieved: "bg-gradient-to-br from-gray-900 to-black",
    iconLocked: "bg-gray-300",
    reward: "text-gray-900",
    bar: "from-gray-700 to-black",
    pill: "bg-gray-900 text-white",
    sectionAchieved: "text-gray-900",
    sectionNew: "text-gray-700",
  },
};

function ProgressBar({ progress = 0, target = 1, barClass }) {
  const pct = Math.min(100, Math.round((progress / Math.max(target, 1)) * 100));
  return (
    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mt-2">
      <div className={`h-full bg-gradient-to-r ${barClass} rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function MilestoneCard({ milestone, achieved, theme }) {
  return (
    <div className={`${theme.card} rounded-2xl p-5 flex gap-4`}>
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
          achieved ? theme.iconAchieved : theme.iconLocked
        }`}
      >
        {achieved ? <CircleCheck size={20} className="text-white" /> : <Lock size={18} className="text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-900">{milestone.title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{milestone.description}</p>
        {achieved && typeof milestone.rewardPoints === "number" && (
          <p className={`text-xs font-semibold mt-1 ${theme.reward}`}>+{milestone.rewardPoints} RP earned</p>
        )}
        {!achieved && Array.isArray(milestone.rewardRange) && (
          <p className="text-xs text-gray-500 mt-1">Reward: {milestone.rewardRange[0]}–{milestone.rewardRange[1]} RP</p>
        )}
        {!achieved && typeof milestone.target === "number" && (
          <>
            <ProgressBar progress={milestone.progress} target={milestone.target} barClass={theme.bar} />
            <p className="text-[11px] text-gray-400 mt-1">
              {milestone.progress ?? 0} / {milestone.target}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function UserMilestonesPage({ variant = "user" }) {
  const theme = THEMES[variant] ?? THEMES.user;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const total = (data?.recent?.length ?? 0) + (data?.new?.length ?? 0);

  useEffect(() => {
    setSEO("Milestones | Mystery Mansion", "", { robots: "noindex, nofollow" });
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/milestones/me");
        if (alive) setData(data);
      } catch (err) {
        if (alive) setError(err?.response?.data?.error || "Failed to load milestones.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className={`min-h-full -m-4 md:-m-6 p-4 md:p-6 space-y-6 ${theme.page}`}>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Milestones</h1>
          {!loading && !error && (
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${theme.pill}`}>
              {total} total
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm mt-0.5">Track your progress on Mystery Mansion.</p>
      </div>

      {loading ? (
        <BrandLoader size="sm" />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Trophy size={16} className={theme.sectionAchieved} />
              <h2 className="text-sm font-semibold text-gray-900">Recent Milestones</h2>
            </div>
            {!data?.recent?.length ? (
              <div className={`${theme.card} rounded-2xl p-5 text-sm text-gray-500`}>
                No milestones achieved yet — keep going!
              </div>
            ) : (
              data.recent.map((m) => <MilestoneCard key={m.id} milestone={m} achieved theme={theme} />)
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className={theme.sectionNew} />
              <h2 className="text-sm font-semibold text-gray-900">New Milestones</h2>
            </div>
            {!data?.new?.length ? (
              <div className={`${theme.card} rounded-2xl p-5 text-sm text-gray-500`}>
                You've achieved every milestone available right now. 🎉
              </div>
            ) : (
              data.new.map((m) => <MilestoneCard key={m.id} milestone={m} achieved={false} theme={theme} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}

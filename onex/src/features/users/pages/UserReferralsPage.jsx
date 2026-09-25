import { useContext, useEffect, useState } from "react";
import {
  Link2, Copy, Check, Users, TrendingUp, Gift, Lock, Share2,
} from "lucide-react";
import { UserContext } from "@/context/UserContext";
import api from "@/shared/utils/api";
import { setSEO } from "@/shared/utils/seo";
import { FEATURE_FLAGS } from "@/config/featureFlags";

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-md flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color} shadow-lg`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      </div>
    </div>
  );
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function UserReferralsPage() {
  const { user } = useContext(UserContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSEO("Referrals | Mystery Mansion", "", { robots: "noindex, nofollow" });
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/referrals/me");
        if (alive) setData(data);
      } catch (err) {
        if (alive) setError(err?.response?.data?.error || "Failed to load your referral link.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const isProvider = user?.accountType === "provider";
  const referralUrl = data?.code ? `${window.location.origin}/referral/${data.code}` : "";

  const handleCopy = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — nothing to fall back to safely.
    }
  };

  const handleShare = async () => {
    if (!referralUrl) return;
    if (navigator.share) {
      navigator.share({ title: "Join me on Mystery Mansion", url: referralUrl }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-full -m-4 md:-m-6 p-4 md:p-6 space-y-6 bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Referrals</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Invite potential clients to Mystery Mansion with your personal referral link.
        </p>
      </div>

      {!isProvider ? (
        <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-8 shadow-md flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gray-300 flex items-center justify-center">
            <Lock size={24} className="text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Referral links are for providers</h2>
          <p className="text-sm text-gray-500 max-w-sm">
            Referral links let providers invite potential clients to Mystery Mansion. Switch to a provider account to start referring.
          </p>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          <div className="h-28 bg-white/30 rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-24 bg-white/30 rounded-2xl animate-pulse" />
            <div className="h-24 bg-white/30 rounded-2xl animate-pulse" />
          </div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">{error}</div>
      ) : (
        <>
          {/* Referral link card */}
          <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl p-5 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Link2 size={16} className="text-pink-500" />
              <h2 className="text-sm font-semibold text-gray-900">Your referral link</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                readOnly
                value={referralUrl}
                onFocus={(e) => e.target.select()}
                className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 truncate"
              />
              <button
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-500 transition-colors"
              >
                <Share2 size={16} />
                Share
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Share this link with a potential client. When they open it, Mystery Mansion shows them a welcome page inviting them to sign up — and it's tied back to your account.
            </p>
          </div>

          {/* Stats */}
          {FEATURE_FLAGS.ENABLE_REFERRAL_ANALYTICS && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard label="Link Clicks" value={data?.clickCount ?? 0} icon={TrendingUp} color="bg-blue-500" />
                <StatCard label="Client Signups" value={data?.signupCount ?? 0} icon={Gift} color="bg-emerald-500" />
              </div>

              {/* Referred users */}
              <div className="bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl shadow-md overflow-hidden">
                <div className="flex items-center gap-2 px-5 pt-5 pb-3">
                  <Users size={16} className="text-pink-500" />
                  <h2 className="text-sm font-semibold text-gray-900">Clients you've referred</h2>
                </div>
                {!data?.referredUsers?.length ? (
                  <div className="px-5 pb-6 text-sm text-gray-500">
                    No signups yet. Share your link to start building your referral activity.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {data.referredUsers.map((u) => (
                      <li key={u._id} className="flex items-center gap-3 px-5 py-3">
                        <img
                          src={u.profilePic || "/default-avatar.png"}
                          alt={u.username}
                          className="w-9 h-9 rounded-full object-cover bg-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{u.username}</p>
                          <p className="text-xs text-gray-500">Joined {fmtDate(u.createdAt)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

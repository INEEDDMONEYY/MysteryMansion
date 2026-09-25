import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

import ReviewsPanel from "@/features/reviews/components/ReviewsPanel";
import { setSEO } from "@/shared/utils/seo";

export default function ReviewsPage() {
  const navigate = useNavigate();
  const { userId: targetUserId } = useParams();

  const [reviewCount, setReviewCount] = useState(0);
  const [targetUsername, setTargetUsername] =
    useState("this user");

  // ─────────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────────

  const handleReturnToProfile = () => {
    if (!targetUserId) return;

    navigate(`/user/${targetUserId}`);
  };

  const handlePanelMeta = ({ count, targetUsername: username }) => {
    setReviewCount(count);
    setTargetUsername(username);

    if (username && username !== "this user") {
      setSEO(
        `Client Reviews for ${username} | Mystery Mansion`,
        `Read verified client reviews for ${username} on Mystery Mansion. See honest feedback from real clients.`
      );
    }
  };

  // ─────────────────────────────────────────────────────────────
  // PAGE
  // ─────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-gray-50 pb-32">

      {/* ═══════════════════════════════════════════════════════
          FULL WIDTH HERO
      ═══════════════════════════════════════════════════════ */}

      <section className="relative overflow-hidden bg-black">

        {/* Decorative gradients */}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-pink-600/30 via-transparent to-yellow-400/20" />

        <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl" />

        <div className="pointer-events-none absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-yellow-400/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

          {/* Back */}

          <button
            type="button"
            onClick={handleReturnToProfile}
            className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 backdrop-blur-sm transition-all hover:border-pink-500/50 hover:bg-pink-500/10 hover:text-white"
          >
            <ArrowLeft size={16} />

            Back to profile
          </button>

          {/* Hero content */}

          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

            <div className="max-w-3xl">

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-500/30 bg-pink-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-pink-300">
                <MessageSquare size={14} />

                Community Reviews
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                Reviews for{" "}
                <span className="text-pink-400">
                  @{targetUsername}
                </span>
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
                See what members of the Mystery
                Mansion community have shared about
                this profile.
              </p>

            </div>

            {/* Review count */}

            <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm sm:min-w-[190px]">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-500/15 text-pink-400">
                  <MessageSquare size={20} />
                </div>

                <div>
                  <p className="text-2xl font-bold text-white">
                    {reviewCount}
                  </p>

                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {reviewCount === 1
                      ? "Review"
                      : "Reviews"}
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CONTENT
      ═══════════════════════════════════════════════════════ */}

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        <div className="-mt-6 relative z-10">
          <ReviewsPanel
            targetUserId={targetUserId}
            onMeta={handlePanelMeta}
          />
        </div>


        {/* ═════════════════════════════════════════════════════
            LOWER INFORMATION SECTION
        ═════════════════════════════════════════════════════ */}

        <section className="mt-10">

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                <ShieldCheck size={22} />
              </div>

              <div className="flex-1">

                <h3 className="font-semibold text-gray-900">
                  Community-driven profiles
                </h3>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                  Reviews help members understand
                  experiences shared by the Mystery
                  Mansion community.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  handleReturnToProfile
                }
                className="shrink-0 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600"
              >
                View Profile
              </button>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}
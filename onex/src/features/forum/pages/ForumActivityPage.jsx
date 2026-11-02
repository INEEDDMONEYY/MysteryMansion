import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { setSEO } from "@/shared/utils/seo";
import { UserContext } from "@/context/UserContext";
import ForumAnalyticsPanel from "../components/ForumAnalyticsPanel";
import ForumNotificationsPanel from "../components/ForumNotificationsPanel";

const sections = {
  engagement: {
    title: "Forum Engagement",
    description: "A dedicated space for your discussions, replies, and community interactions.",
  },
  notifications: {
    title: "Forum Notifications",
    description: "Replies to your discussions, comments, and threads with notifications enabled.",
  },
};

export default function ForumActivityPage({ section }) {
  const { title, description } = sections[section];
  const { user } = useContext(UserContext) || {};

  useEffect(() => {
    setSEO(`${title} | Mystery Mansion`, description, {
      canonicalPath: `/forum/${section}`,
      robots: "noindex, nofollow",
    });
  }, [title, description, section]);

  return (
    <main className="min-h-[65vh] bg-neutral-950 px-4 py-12 text-white sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-pink-400">Your Community Hub</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400">{description}</p>
        <div className="mt-10">
          {!user?._id ? (
            <section className="rounded-2xl border border-white/10 bg-neutral-900 p-8 text-center">
              <h2 className="text-lg font-bold">Sign in to view your {section}</h2>
              <p className="mt-3 text-sm text-gray-400">Your forum activity and alerts are private to your account.</p>
              <Link to="/signin" className="mt-5 inline-block rounded-xl bg-pink-600 px-5 py-3 text-sm font-semibold text-white">Sign In</Link>
            </section>
          ) : section === "engagement" ? (
            <ForumAnalyticsPanel key={user._id} />
          ) : (
            <ForumNotificationsPanel key={user._id} />
          )}
        </div>
      </div>
    </main>
  );
}

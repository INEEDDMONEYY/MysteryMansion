import { MessageSquareText } from "lucide-react";

import ForumThreadCard from "./ForumThreadCard";

export default function ForumThreadList({
  threads = [],
  loading = false,
  error = "",
  emptyTitle = "No discussions found",
  emptyDescription = "Try another category or search term, or start a new discussion.",
}) {
  if (loading) {
    return (
      <div className="space-y-4" aria-label="Loading discussions">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-2xl border border-gray-200 bg-white p-6"
          >
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="mt-4 h-6 w-3/4 rounded bg-gray-200" />
            <div className="mt-3 h-4 w-full rounded bg-gray-100" />
            <div className="mt-2 h-4 w-2/3 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center"
      >
        <h3 className="text-lg font-bold text-red-800">
          Unable to load discussions
        </h3>

        <p className="mt-2 text-sm leading-6 text-red-700">
          {error}
        </p>
      </div>
    );
  }

  if (!threads.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50 text-pink-600">
          <MessageSquareText className="h-7 w-7" />
        </div>

        <h3 className="mt-5 text-xl font-bold text-gray-950">
          {emptyTitle}
        </h3>

        <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-gray-500">
          {emptyDescription}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {threads.map((thread, index) => (
        <ForumThreadCard
          key={thread?._id || thread?.id || index}
          thread={thread}
        />
      ))}
    </div>
  );
}
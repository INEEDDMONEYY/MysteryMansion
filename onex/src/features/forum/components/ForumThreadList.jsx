import BrandLoader from "@/shared/components/Loaders/BrandLoader";
import { MessageSquareText } from "lucide-react";

import ForumThreadCard from "./ForumThreadCard";
import ForumThreadTable from "./ForumThreadTable";

export default function ForumThreadList({
  threads = [],
  loading = false,
  error = "",
  emptyTitle = "No discussions found",
  emptyDescription = "Try another category or search term, or start a new discussion.",
  variant = "cards",
  showPinned = false,
}) {
  if (loading) {
    return (
      <BrandLoader size="sm" label="Loading discussions..." />
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

  if (variant === "table") {
    return <ForumThreadTable threads={threads} />;
  }

  return (
    <div className="space-y-4">
      {threads.map((thread, index) => (
        <ForumThreadCard
          key={thread?._id || thread?.id || index}
          thread={thread}
          showPinned={showPinned}
        />
      ))}
    </div>
  );
}
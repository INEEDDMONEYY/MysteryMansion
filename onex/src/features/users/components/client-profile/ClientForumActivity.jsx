import { Link } from "react-router-dom";
import { ArrowUp, MessageCircle } from "lucide-react";

import usePagedProfileData from "../../hooks/usePagedProfileData";
import { fetchProfileForumActivity } from "../../services/profileActivityService";
import AttachmentGallery from "@/shared/components/attachments/AttachmentGallery";
import ProfileDataState from "../profile-shared/ProfileDataState";
import { formatProfileDateTime } from "../profile-shared/formatters";

const TYPE_BADGES = {
  thread: { label: "Thread", className: "bg-pink-50 text-pink-700" },
  reply: { label: "Reply", className: "bg-purple-50 text-purple-700" },
};

/** Forum threads and replies a member has written. */
export default function ClientForumActivity({ userId }) {
  const { items, pagination, loading, loadingMore, error, loadMore } =
    usePagedProfileData(fetchProfileForumActivity, { userId }, { limit: 15 });

  return (
    <ProfileDataState
      loading={loading}
      error={error}
      empty={items.length === 0}
      emptyTitle="No forum activity yet"
      emptyDescription="Discussions this member starts and replies they post will appear here."
      hasMore={pagination.hasNextPage}
      loadingMore={loadingMore}
      onLoadMore={loadMore}
    >
      <ul className="space-y-3">
        {items.map((item) => {
          const badge = TYPE_BADGES[item.type];

          return (
            <li key={`${item.type}-${item.id}`} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`rounded-full px-2.5 py-1 font-semibold ${badge.className}`}>
                  {badge.label}
                </span>
                <time dateTime={item.createdAt} className="text-gray-500">
                  {formatProfileDateTime(item.createdAt)}
                </time>
              </div>

              {item.title && (
                <h3 className="mt-2 break-words text-base font-bold text-gray-950">
                  <Link to={item.link} className="transition hover:text-pink-600">
                    {item.title}
                  </Link>
                </h3>
              )}

              {item.text && (
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                  {item.text}
                </p>
              )}

              <AttachmentGallery attachments={item.attachments} className="mt-3" />

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                {item.context && (
                  <span>
                    {item.type === "thread" ? "Category" : "In thread"}{" "}
                    <Link to={item.context.link} className="font-semibold text-pink-600 hover:underline">
                      {item.context.label}
                    </Link>
                  </span>
                )}

                {item.stats?.score != null && (
                  <span className="inline-flex items-center gap-1">
                    <ArrowUp className="h-3.5 w-3.5" />
                    {item.stats.score}
                  </span>
                )}

                {item.stats?.replies != null && (
                  <span className="inline-flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {item.stats.replies}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </ProfileDataState>
  );
}

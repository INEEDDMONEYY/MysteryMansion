import { useState } from "react";
import { Link } from "react-router-dom";

import usePagedProfileData from "../../hooks/usePagedProfileData";
import { fetchAdminActivity } from "../../services/adminProfileService";
import AttachmentGallery from "@/shared/components/attachments/AttachmentGallery";
import ProfileDataState, { chipClass } from "../profile-shared/ProfileDataState";

const TYPE_FILTERS = [
  { id: "all", label: "All" },
  { id: "threads", label: "Thread posts", countKey: "threads" },
  { id: "replies", label: "Thread replies", countKey: "replies" },
  { id: "comments", label: "Post comments", countKey: "comments" },
];

const TYPE_BADGES = {
  thread: { label: "Thread", className: "bg-pink-50 text-pink-700" },
  reply: { label: "Reply", className: "bg-purple-50 text-purple-700" },
  comment: { label: "Comment", className: "bg-yellow-50 text-yellow-700" },
};

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

/** Every forum thread, forum reply and post comment on the platform, newest first. */
export default function AdminActivityFeed() {
  const [type, setType] = useState("all");

  const { items, extra, pagination, loading, loadingMore, error, loadMore } =
    usePagedProfileData(fetchAdminActivity, { type });

  const counts = extra.counts || {};

  return (
    <div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter activity">
        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setType(filter.id)}
            aria-pressed={type === filter.id}
            className={chipClass(type === filter.id)}
          >
            {filter.label}
            {filter.countKey && counts[filter.countKey] != null && type === "all" && (
              <span className="opacity-70">{counts[filter.countKey]}</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-5">
        <ProfileDataState
          loading={loading}
          error={error}
          empty={items.length === 0}
          emptyTitle="No activity yet"
          emptyDescription="Forum threads, replies and post comments will appear here as members post them."
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
                    <span className="font-semibold text-gray-900">{item.author.username}</span>
                    <span className="text-gray-400" aria-hidden="true">·</span>
                    <time dateTime={item.createdAt} className="text-gray-500">
                      {formatDateTime(item.createdAt)}
                    </time>
                  </div>

                  {item.title && (
                    <h3 className="mt-2 break-words text-base font-bold text-gray-950">
                      {item.link ? (
                        <Link to={item.link} className="transition hover:text-pink-600">
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </h3>
                  )}

                  {item.text && (
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-700">
                      {item.text}
                    </p>
                  )}

                  <AttachmentGallery attachments={item.attachments} className="mt-3" />

                  {item.context && !item.title && (
                    <p className="mt-3 text-xs text-gray-500">
                      {item.type === "comment" ? "On post" : "In thread"}{" "}
                      <Link to={item.context.link} className="font-semibold text-pink-600 hover:underline">
                        {item.context.label}
                      </Link>
                    </p>
                  )}

                  {item.context && item.title && (
                    <p className="mt-3 text-xs text-gray-500">
                      Category{" "}
                      <Link to={item.context.link} className="font-semibold text-pink-600 hover:underline">
                        {item.context.label}
                      </Link>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </ProfileDataState>
      </div>
    </div>
  );
}

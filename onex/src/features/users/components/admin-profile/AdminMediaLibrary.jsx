import { useState } from "react";
import { Link } from "react-router-dom";

import usePagedProfileData from "../../hooks/usePagedProfileData";
import { fetchAdminMedia } from "../../services/adminProfileService";
import { ImageLightbox } from "@/shared/components/attachments/AttachmentGallery";
import ProfileDataState, { chipClass } from "../profile-shared/ProfileDataState";

const SOURCE_FILTERS = [
  { id: "all", label: "All sources" },
  { id: "threads", label: "Thread posts", countKey: "threads" },
  { id: "replies", label: "Thread replies", countKey: "replies" },
];

const KIND_FILTERS = [
  { id: "all", label: "Images & GIFs" },
  { id: "image", label: "Images" },
  { id: "gif", label: "GIFs" },
];

const SOURCE_LABELS = { thread: "Thread post", reply: "Thread reply" };

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "";

/** Every image and GIF members uploaded through comments, forum threads and replies. */
export default function AdminMediaLibrary() {
  const [source, setSource] = useState("all");
  const [kind, setKind] = useState("all");
  const [active, setActive] = useState(null);

  const { items, extra, pagination, loading, loadingMore, error, loadMore } =
    usePagedProfileData(fetchAdminMedia, { source, kind }, { limit: 24 });

  const counts = extra.counts || {};

  return (
    <div>
      <div className="flex flex-col gap-3">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter by source">
          {SOURCE_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setSource(filter.id)}
              aria-pressed={source === filter.id}
              className={chipClass(source === filter.id)}
            >
              {filter.label}
              {filter.countKey && counts[filter.countKey] != null && source === "all" && (
                <span className="opacity-70">{counts[filter.countKey]}</span>
              )}
            </button>
          ))}
        </div>

        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter by file type">
          {KIND_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setKind(filter.id)}
              aria-pressed={kind === filter.id}
              className={chipClass(kind === filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <ProfileDataState
          loading={loading}
          error={error}
          empty={items.length === 0}
          emptyTitle="No uploads yet"
          emptyDescription="Images and GIFs attached to post comments, forum threads and replies will be collected here."
          hasMore={pagination.hasNextPage}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        >
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <li key={item.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={() => setActive({ url: item.url, alt: `Upload by ${item.uploader.username}` })}
                  className="relative block aspect-square w-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <img
                    src={item.url}
                    alt={`Upload by ${item.uploader.username}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  {item.kind === "gif" && (
                    <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      GIF
                    </span>
                  )}
                </button>

                <div className="space-y-0.5 p-2.5 text-xs">
                  <p className="truncate font-semibold text-gray-900">{item.uploader.username}</p>
                  <p className="text-gray-500">
                    {SOURCE_LABELS[item.source]} · {formatDate(item.uploadedAt)}
                  </p>
                  {item.context && (
                    <Link to={item.context.link} className="block truncate font-medium text-pink-600 hover:underline">
                      {item.context.label}
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </ProfileDataState>
      </div>

      <ImageLightbox image={active} onClose={() => setActive(null)} />
    </div>
  );
}

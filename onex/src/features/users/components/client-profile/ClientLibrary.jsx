import { useState } from "react";
import { Link } from "react-router-dom";

import usePagedProfileData from "../../hooks/usePagedProfileData";
import { fetchProfileLibrary } from "../../services/profileActivityService";
import { ImageLightbox } from "@/shared/components/attachments/AttachmentGallery";
import ProfileDataState, { chipClass } from "../profile-shared/ProfileDataState";
import { formatProfileDate } from "../profile-shared/formatters";

const KIND_FILTERS = [
  { id: "all", label: "Images & GIFs" },
  { id: "image", label: "Images" },
  { id: "gif", label: "GIFs" },
];

const SOURCE_LABELS = { thread: "Thread post", reply: "Thread reply" };

/** Images and GIFs a member uploaded in the forum. */
export default function ClientLibrary({ userId }) {
  const [kind, setKind] = useState("all");
  const [active, setActive] = useState(null);

  const { items, pagination, loading, loadingMore, error, loadMore } =
    usePagedProfileData(fetchProfileLibrary, { userId, kind }, { limit: 24 });

  return (
    <div>
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

      <div className="mt-5">
        <ProfileDataState
          loading={loading}
          error={error}
          empty={items.length === 0}
          emptyTitle="Nothing in the library yet"
          emptyDescription="Images and GIFs uploaded in forum discussions and comments will be collected here."
          hasMore={pagination.hasNextPage}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        >
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <li key={item.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <button
                  type="button"
                  onClick={() => setActive({ url: item.url, alt: "Uploaded image" })}
                  className="relative block aspect-square w-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <img src={item.url} alt="Uploaded image" loading="lazy" className="h-full w-full object-cover" />
                  {item.kind === "gif" && (
                    <span className="absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      GIF
                    </span>
                  )}
                </button>

                <div className="space-y-0.5 p-2.5 text-xs">
                  <p className="text-gray-500">
                    {SOURCE_LABELS[item.source]} · {formatProfileDate(item.uploadedAt)}
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

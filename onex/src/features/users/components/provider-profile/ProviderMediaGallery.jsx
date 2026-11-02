import { useEffect, useState } from "react";
import { Play, X } from "lucide-react";

import usePagedProfileData from "../../hooks/usePagedProfileData";
import { fetchProfileMedia } from "../../services/profileActivityService";
import { ImageLightbox } from "@/shared/components/attachments/AttachmentGallery";
import ProfileDataState, { chipClass } from "../profile-shared/ProfileDataState";

const TYPE_FILTERS = [
  { id: "all", label: "All" },
  { id: "image", label: "Photos" },
  { id: "video", label: "Videos" },
];

function VideoModal({ video, onClose }) {
  useEffect(() => {
    if (!video) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [video, onClose]);

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Video player"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close video"
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </button>
      <video
        src={video.url}
        poster={video.thumbnailUrl || undefined}
        controls
        autoPlay
        playsInline
        className="max-h-[85vh] max-w-full rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

/** Photos and videos a provider chose to show on their profile. */
export default function ProviderMediaGallery({ userId }) {
  const [type, setType] = useState("all");
  const [activeImage, setActiveImage] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  const { items, pagination, loading, loadingMore, error, loadMore } =
    usePagedProfileData(fetchProfileMedia, { userId, type }, { limit: 24 });

  return (
    <div>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter by media type">
        {TYPE_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setType(filter.id)}
            aria-pressed={type === filter.id}
            className={chipClass(type === filter.id)}
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
          emptyTitle="No media yet"
          emptyDescription="Photos and videos shared to this profile will appear here."
          hasMore={pagination.hasNextPage}
          loadingMore={loadingMore}
          onLoadMore={loadMore}
        >
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item) => {
              const isVideo = item.mediaType === "video";
              const preview = isVideo ? item.thumbnailUrl : item.url;

              return (
                <li key={item.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <button
                    type="button"
                    onClick={() =>
                      isVideo
                        ? setActiveVideo(item)
                        : setActiveImage({ url: item.url, backupUrl: item.backupUrl, alt: "Profile photo" })
                    }
                    aria-label={isVideo ? "Play video" : "View photo"}
                    className="relative block aspect-square w-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  >
                    {preview ? (
                      <img
                        src={preview}
                        alt={isVideo ? "Video thumbnail" : "Profile photo"}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          if (!isVideo && item.backupUrl && e.currentTarget.src !== item.backupUrl) {
                            e.currentTarget.src = item.backupUrl;
                          }
                        }}
                      />
                    ) : (
                      // "#t=0.1" makes mobile Safari paint the first frame as a preview.
                      <video src={`${item.url}#t=0.1`} preload="metadata" muted playsInline className="h-full w-full object-cover" />
                    )}
                    {isVideo && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <span className="rounded-full bg-black/60 p-3 text-white">
                          <Play className="h-5 w-5 fill-current" />
                        </span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </ProfileDataState>
      </div>

      <ImageLightbox image={activeImage} onClose={() => setActiveImage(null)} />
      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
}

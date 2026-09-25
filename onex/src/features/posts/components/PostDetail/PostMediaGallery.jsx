// 🖼️ Post Media Gallery

export default function PostMediaGallery({ mediaItems = [], fallbackImage = "" }) {
  if (mediaItems.length === 0 && !fallbackImage) {
    return (
      <div className="flex min-h-[320px] w-full items-center justify-center rounded-2xl border border-gray-200 bg-gray-100 text-sm text-gray-500">
        No Media Available
      </div>
    );
  }

  if (mediaItems.length === 0 && fallbackImage) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
        <img
          src={fallbackImage}
          alt="Post"
          className="h-auto max-h-[720px] w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {mediaItems.map((media, index) => {
        if (media.type === "video") {
          return (
            <div
              key={`video-${index}`}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-black shadow-sm"
            >
              <video
                src={media.url}
                controls
                className="h-full max-h-[620px] w-full object-cover"
              />
            </div>
          );
        }

        return (
          <div
            key={`image-${index}`}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm"
          >
            <img
              src={media.url}
              alt={`Post image ${index + 1}`}
              className="h-full max-h-[620px] w-full object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
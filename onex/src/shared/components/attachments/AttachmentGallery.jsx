import { useEffect, useState } from "react";
import { X } from "lucide-react";

/** Full-size image viewer that stays in the current tab; closes on Escape or backdrop click. */
export function ImageLightbox({ image, onClose }) {
  useEffect(() => {
    if (!image) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/85 p-3 sm:p-6"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close preview"
        className="absolute right-3 top-[calc(env(safe-area-inset-top,0px)+0.75rem)] flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
      >
        <X className="h-5 w-5" />
      </button>

      <img
        src={image.url}
        alt={image.alt || "Uploaded image"}
        className="max-h-full max-w-full rounded-lg object-contain"
      />
    </div>
  );
}

/** Thumbnail grid for comment/thread attachments; clicking opens the lightbox. */
export default function AttachmentGallery({ attachments = [], className = "" }) {
  const [active, setActive] = useState(null);

  if (!attachments.length) return null;

  return (
    <>
      <ul className={`flex flex-wrap gap-2 ${className}`}>
        {attachments.map((attachment, index) => (
          <li key={`${attachment.url}-${index}`}>
            <button
              type="button"
              onClick={() => setActive({ url: attachment.url, alt: `Attachment ${index + 1}` })}
              className="relative block overflow-hidden rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <img
                src={attachment.url}
                alt={`Attachment ${index + 1}`}
                loading="lazy"
                className="h-28 w-28 object-cover sm:h-32 sm:w-32"
              />
              {attachment.kind === "gif" && (
                <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  GIF
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <ImageLightbox image={active} onClose={() => setActive(null)} />
    </>
  );
}

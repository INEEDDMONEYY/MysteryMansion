import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

export const MAX_ATTACHMENTS = 4;
export const MAX_ATTACHMENT_MB = 5;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Image/GIF picker with previews. Controlled: files is a File[] owned by the parent,
 * which sends them as multipart "images" fields.
 */
export default function AttachmentPicker({
  files = [],
  onChange,
  disabled = false,
  label = "Add image or GIF",
  className = "",
}) {
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files]
  );

  useEffect(
    () => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)),
    [previews]
  );

  const handleSelect = (event) => {
    const picked = Array.from(event.target.files || []);
    event.target.value = "";

    const accepted = [];
    let message = "";

    for (const file of picked) {
      if (!ACCEPTED.includes(file.type)) {
        message = "Only JPG, PNG, WebP and GIF images are allowed.";
      } else if (file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
        message = `Each image must be under ${MAX_ATTACHMENT_MB} MB.`;
      } else if (files.length + accepted.length >= MAX_ATTACHMENTS) {
        message = `You can attach up to ${MAX_ATTACHMENTS} images.`;
      } else {
        accepted.push(file);
      }
    }

    setError(message);
    if (accepted.length) onChange?.([...files, ...accepted]);
  };

  const remove = (index) => {
    setError("");
    onChange?.(files.filter((_, i) => i !== index));
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        onChange={handleSelect}
        className="hidden"
        aria-label={label}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || files.length >= MAX_ATTACHMENTS}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-600 transition hover:border-pink-300 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ImagePlus className="h-4 w-4" />
        {label}
      </button>

      {previews.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {previews.map((preview, index) => (
            <li key={preview.url} className="relative">
              <img
                src={preview.url}
                alt={`Attachment ${index + 1}`}
                className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={disabled}
                aria-label={`Remove attachment ${index + 1}`}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white shadow transition hover:bg-pink-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

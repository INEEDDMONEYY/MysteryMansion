import { useState } from "react";
import { Link } from "react-router-dom";

import AttachmentPicker from "@/shared/components/attachments/AttachmentPicker";

const MAX_LENGTH = 5000;

export default function ForumReplyForm({
  onSubmit,
  onCancel,
  submitting = false,
  initialValue = "",
  placeholder = "Write a reply...",
  submitLabel = "Post reply",
  autoFocus = false,
  signedIn = true,
  lockedMessage = "",
  allowAttachments = true,
  showUploadHint = false,
}) {
  const [value, setValue] = useState(initialValue);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  if (lockedMessage) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-600">
        {lockedMessage}
      </div>
    );
  }

  if (!signedIn) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-600">
        <Link to="/signin" className="font-semibold text-pink-600 underline underline-offset-4">
          Sign in
        </Link>{" "}
        to join the conversation.
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const content = value.trim();

    if (!content && files.length === 0) {
      setError("Write something or attach an image before posting.");
      return;
    }

    setError("");

    try {
      await onSubmit?.(content, files);
      setValue("");
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to post your reply.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="sr-only" htmlFor="forum-reply-input">
        Reply
      </label>

      <textarea
        id="forum-reply-input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        maxLength={MAX_LENGTH}
        rows={4}
        autoFocus={autoFocus}
        disabled={submitting}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 disabled:opacity-60"
      />

      {allowAttachments && (
        <AttachmentPicker files={files} onChange={setFiles} disabled={submitting} />
      )}

      {!allowAttachments && showUploadHint && (
        <p className="text-xs text-gray-500">
          Image and GIF uploads are an Elite membership perk.{" "}
          <Link to="/membership" className="font-semibold text-pink-600 underline underline-offset-4">
            See membership
          </Link>
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-gray-400">
          {value.length}/{MAX_LENGTH}
        </span>

        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="min-h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={submitting || (!value.trim() && files.length === 0)}
            className="min-h-10 rounded-lg bg-black px-5 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Posting..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

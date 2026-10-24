// 💬 Comment Form

import { Send } from "lucide-react";

import AttachmentPicker from "@/shared/components/attachments/AttachmentPicker";

export default function CommentForm({
  commentText,
  setCommentText,
  files = [],
  setFiles,
  onSubmit,
  busy,
}) {
  return (
    <form onSubmit={onSubmit} className="mb-5">
      <textarea
        value={commentText}
        onChange={(e) =>
          setCommentText(e.target.value)
        }
        rows={3}
        placeholder="Add your comment..."
        className="w-full rounded-lg border border-pink-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-300"
      />

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        {setFiles ? (
          <AttachmentPicker
            files={files}
            onChange={setFiles}
            disabled={busy}
          />
        ) : (
          <span />
        )}

        <button
          type="submit"
          disabled={
            (!String(commentText || "").trim() &&
              files.length === 0) ||
            busy
          }
          className="inline-flex items-center gap-2 rounded-lg bg-pink-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-pink-500 disabled:opacity-60 sm:text-sm"
        >
          <Send size={14} />

          {busy ? "Posting..." : "Post Comment"}
        </button>
      </div>
    </form>
  );
}
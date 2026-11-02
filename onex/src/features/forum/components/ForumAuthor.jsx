import { useState } from "react";
import { Link } from "react-router-dom";
import { UserRound } from "lucide-react";

export default function ForumAuthor({ author, fallbackName = "Community Member" }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const name = author?.username || author?.name || fallbackName;
  const content = (
    <>
      {author?.profilePic && failedSrc !== author.profilePic ? (
        <img
          src={author.profilePic}
          alt=""
          width={32}
          height={32}
          loading="lazy"
          onError={() => setFailedSrc(author.profilePic)}
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <UserRound size={16} aria-hidden="true" />
        </span>
      )}
      <span className="break-words font-semibold">{name}</span>
    </>
  );

  return author?.id ? (
    <Link
      to={`/user/${encodeURIComponent(author.id)}`}
      className="inline-flex min-w-0 items-center gap-2 text-gray-800 transition hover:text-pink-600"
    >
      {content}
    </Link>
  ) : (
    <span className="inline-flex min-w-0 items-center gap-2 text-gray-700">{content}</span>
  );
}

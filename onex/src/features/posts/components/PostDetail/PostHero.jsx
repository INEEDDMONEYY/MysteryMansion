// 🎀 Post Detail Hero

import { Link } from "react-router-dom";

export default function PostHero({
  image = "",
  title = "",
  username = "",
  createdLabel = "",
  profileHref = "",
}) {
  return (
    <section className="bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {image && (
          <div className="mb-6 flex items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
            <img
              src={image}
              alt={title || "Post image"}
              className="max-h-[420px] w-auto max-w-full object-contain sm:max-h-[560px] lg:max-h-[720px]"
            />
          </div>
        )}

        <div className="border-b border-gray-200 pb-6">
          {profileHref ? (
            <Link
              to={profileHref}
              className="block text-3xl font-bold tracking-tight text-pink-600 transition-colors hover:text-pink-700 sm:text-4xl lg:text-5xl"
            >
              {title || "Untitled Post"}
            </Link>
          ) : (
            <h1 className="text-3xl font-bold tracking-tight text-pink-600 sm:text-4xl lg:text-5xl">
              {title || "Untitled Post"}
            </h1>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
            <span>
              by{" "}
              {profileHref ? (
                <Link
                  to={profileHref}
                  className="font-semibold text-gray-700 transition-colors hover:text-pink-600"
                >
                  {username || "Anonymous"}
                </Link>
              ) : (
                <span className="font-semibold text-gray-700">
                  {username || "Anonymous"}
                </span>
              )}
            </span>

            {createdLabel && (
              <>
                <span className="text-gray-300">•</span>
                <span>{createdLabel}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
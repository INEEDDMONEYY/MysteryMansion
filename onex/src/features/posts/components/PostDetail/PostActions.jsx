// 🔘 Post Actions

export default function PostActions({
  onReturn,
  onViewProfile,
  showProfile = false,
}) {
  return (
    <section className="py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onReturn}
          className="rounded-lg bg-gradient-to-r from-yellow-400 via-black to-pink-500 px-4 py-2 text-[12px] font-medium text-white shadow-md transition-all hover:opacity-90"
        >
          Return to posts
        </button>

        {showProfile && (
          <button
            type="button"
            onClick={onViewProfile}
            className="rounded-lg bg-gradient-to-r from-pink-500 via-black to-yellow-400 px-4 py-2 text-[12px] font-medium text-white shadow-md transition-all hover:opacity-90"
          >
            View profile
          </button>
        )}
      </div>
    </section>
  );
}
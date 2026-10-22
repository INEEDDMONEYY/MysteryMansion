import { Search, X } from "lucide-react";

export default function ForumSearch({
  query = "",
  onQueryChange,
  onSearch,
  placeholder = "Search discussions, questions, and topics...",
}) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch?.(query.trim());
  };

  const handleClear = () => {
    onQueryChange?.("");
    onSearch?.("");
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="w-full"
    >
      <label
        htmlFor="forum-search"
        className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500"
      >
        Search the forum
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search
            size={19}
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            id="forum-search"
            type="search"
            value={query}
            onChange={(event) =>
              onQueryChange?.(event.target.value)
            }
            placeholder={placeholder}
            className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-11 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear forum search"
              className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
        >
          <Search size={17} />
          Search
        </button>
      </div>
    </form>
  );
}
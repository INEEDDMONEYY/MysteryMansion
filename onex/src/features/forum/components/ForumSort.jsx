import { ArrowDownUp } from "lucide-react";

import {
  DEFAULT_FORUM_SORT,
  FORUM_SORT_OPTIONS,
} from "../data/forumSortOptions";

export default function ForumSort({
  sort = DEFAULT_FORUM_SORT,
  onChange,
  disabled = false,
}) {
  return (
    <label className="block w-full sm:w-56">
      <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
        <ArrowDownUp className="h-3.5 w-3.5" />
        Sort discussions
      </span>

      <select
        value={sort}
        onChange={(event) =>
          onChange?.(event.target.value)
        }
        disabled={disabled}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 outline-none transition hover:border-pink-300 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {FORUM_SORT_OPTIONS.map((option) => (
          <option
            key={option.id}
            value={option.id}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
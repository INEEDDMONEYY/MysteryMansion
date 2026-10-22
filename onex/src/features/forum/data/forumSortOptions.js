export const FORUM_SORT_OPTIONS = Object.freeze([
  {
    id: "latest",
    label: "Latest",
    description: "Most recently updated threads.",
  },
  {
    id: "newest",
    label: "Newest",
    description: "Most recently created threads.",
  },
  {
    id: "active",
    label: "Most Active",
    description: "Threads with the most recent activity.",
  },
  {
    id: "popular",
    label: "Popular",
    description: "Threads with the highest community engagement.",
  },
  {
    id: "most_replied",
    label: "Most Replied",
    description: "Threads with the most replies.",
  },
]);

export const DEFAULT_FORUM_SORT = "latest";

export const getForumSortOption = (
  sortId,
  options = FORUM_SORT_OPTIONS
) =>
  options.find((option) => option.id === sortId) ||
  options.find(
    (option) => option.id === DEFAULT_FORUM_SORT
  ) ||
  null;
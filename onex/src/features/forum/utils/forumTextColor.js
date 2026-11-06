// Title and description colours for the membership "forum text colour" perk (ids match the backend).
// Solid entries use the same colour for title and description.
export const FORUM_TEXT_COLOR_OPTIONS = [
  { id: "raspberry-lime", label: "Raspberry & Lime", title: "#DB2763", description: "#B0DB43" },
  { id: "ember-lemon", label: "Ember & Lemon", title: "#E43D00", description: "#FFE900" },
  { id: "mint-sky", label: "Mint & Sky", title: "#E4F3E3", description: "#5CA9B9" },
  { id: "midnight-plum", label: "Midnight & Plum", title: "#212130", description: "#39304A" },
  { id: "frost-orchid", label: "Frost & Orchid", title: "#BCE7FC", description: "#C491B1" },
  { id: "solid-black", label: "Black", title: "#000000", description: "#000000" },
  { id: "solid-green", label: "Green", title: "#22C55E", description: "#22C55E" },
  { id: "solid-yellow", label: "Yellow", title: "#FACC15", description: "#FACC15" },
  { id: "solid-red", label: "Red", title: "#EF4444", description: "#EF4444" },
  { id: "solid-orange", label: "Orange", title: "#F97316", description: "#F97316" },
  { id: "solid-purple", label: "Purple", title: "#A855F7", description: "#A855F7" },
  { id: "solid-pink", label: "Pink", title: "#EC4899", description: "#EC4899" },
];

export const getForumTextColor = (id) => FORUM_TEXT_COLOR_OPTIONS.find((option) => option.id === id) || null;

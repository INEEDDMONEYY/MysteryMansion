// Gradient border colours for the Elite "forum card border customization" perk (ids match the backend).
export const FORUM_BORDER_OPTIONS = [
  { id: "pink", label: "Pink", gradient: "bg-gradient-to-br from-pink-400 via-pink-500 to-rose-500" },
  { id: "yellow", label: "Yellow", gradient: "bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500" },
  { id: "green", label: "Green", gradient: "bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500" },
  { id: "blue", label: "Blue", gradient: "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500" },
  { id: "red", label: "Red", gradient: "bg-gradient-to-br from-red-400 via-red-500 to-rose-600" },
  { id: "orange", label: "Orange", gradient: "bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500" },
  { id: "purple", label: "Purple", gradient: "bg-gradient-to-br from-purple-400 via-violet-500 to-fuchsia-500" },
  { id: "gray", label: "Gray", gradient: "bg-gradient-to-br from-gray-300 via-gray-400 to-slate-500" },
];

export const getForumBorderGradient = (id) =>
  FORUM_BORDER_OPTIONS.find((option) => option.id === id)?.gradient || "";

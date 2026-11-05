// Progression ring colors. Ids must match membershipCatalog.js on the backend.
export const PROGRESSION_COLORS = [
  { id: "orange", label: "Orange", kind: "solid", stops: ["#f97316"] },
  { id: "yellow", label: "Yellow", kind: "solid", stops: ["#facc15"] },
  { id: "pink", label: "Pink", kind: "solid", stops: ["#ec4899"] },
  { id: "blue", label: "Blue", kind: "solid", stops: ["#3b82f6"] },
  { id: "green", label: "Green", kind: "solid", stops: ["#22c55e"] },
  { id: "purple", label: "Purple", kind: "solid", stops: ["#a855f7"] },
  { id: "brown", label: "Brown", kind: "solid", stops: ["#8b5a2b"] },
  { id: "peach", label: "Peach", kind: "solid", stops: ["#ffb88c"] },
  { id: "watermelon-crush", label: "Watermelon Crush", kind: "gradient", stops: ["#ff6b81", "#2ed573"] },
  { id: "sedona-sunrise", label: "Sedona Sunrise", kind: "gradient", stops: ["#ff512f", "#f09819"] },
  { id: "seascape", label: "Seascape", kind: "gradient", stops: ["#0ea5e9", "#14b8a6"] },
  { id: "blackcurrant", label: "Blackcurrant", kind: "gradient", stops: ["#2e1437", "#8e2de2"] },
  { id: "cotton-candy", label: "Cotton Candy", kind: "gradient", stops: ["#ffafbd", "#a1c4fd"] },
  { id: "carrot", label: "Carrot", kind: "gradient", stops: ["#fdba74", "#ea580c"] },
  { id: "honeydew", label: "Honeydew", kind: "gradient", stops: ["#d4fc79", "#96e6a1"] },
];

const DEFAULT_RING_COLOR = "#a855f7";
const TRACK_COLOR = "#374151";

export const getProgressionColor = (id) =>
  PROGRESSION_COLORS.find((color) => color.id === id) || null;

/** Conic-gradient for the level ring: the color fills the progress arc over the grey track. */
export function progressionRingBackground(colorId, progress) {
  const arc = Math.round(Math.min(Math.max(progress || 0, 0), 1) * 360);
  const color = getProgressionColor(colorId);
  const stops = color ? color.stops : [DEFAULT_RING_COLOR];
  const last = stops.length - 1;
  const parts = stops.map((stop, index) => {
    const position = last === 0 ? arc : Math.round((arc * index) / last);
    return `${stop} ${position}deg`;
  });
  return `conic-gradient(${parts.join(", ")}, ${TRACK_COLOR} ${arc}deg)`;
}

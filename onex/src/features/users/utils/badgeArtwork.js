const forumArtwork = import.meta.glob("/src/assets/icons/forum/*.svg", { eager: true, query: "?url", import: "default" });
const timeArtwork = import.meta.glob("/src/assets/icons/time/*.svg", { eager: true, query: "?url", import: "default" });

const basename = (path) => path.split("/").pop();

// Forum files are named "<id>-<slug>.svg" (e.g. posts-1-fresh-quill.svg), time files "<id>.svg".
export function getBadgeArtwork(badge) {
  if (badge.set === "time") {
    const match = Object.entries(timeArtwork).find(([path]) => basename(path) === `${badge.id}.svg`);
    return match?.[1] ?? null;
  }
  const match = Object.entries(forumArtwork).find(([path]) => basename(path).startsWith(`${badge.id}-`));
  return match?.[1] ?? null;
}

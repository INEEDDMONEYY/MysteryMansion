import { getForumBorderGradient } from "../utils/forumBorder";

/** Wraps a card in the thread's chosen gradient border; renders the card untouched when none is set. */
export default function ForumBorderFrame({ color, children }) {
  const gradient = getForumBorderGradient(color);
  if (!gradient) return children;

  return <div className={`rounded-2xl p-[3px] shadow-sm ${gradient}`}>{children}</div>;
}

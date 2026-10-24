import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { useContext } from "react";
import { UserContext } from "@/context/UserContext";

/** Starts a new thread; signed-out visitors are sent to sign in first. */
export default function NewThreadButton({
  categorySlug = "",
  label = "New Discussion",
  className = "",
}) {
  const { user } = useContext(UserContext) || {};
  const navigate = useNavigate();

  const target = categorySlug
    ? `/forum/create?category=${encodeURIComponent(categorySlug)}`
    : "/forum/create";

  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 text-sm font-semibold text-white shadow-lg shadow-pink-600/20 transition hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2";

  if (!user?._id) {
    return (
      <button
        type="button"
        onClick={() => navigate("/signin")}
        className={`${base} ${className}`}
      >
        <Plus className="h-4 w-4" />
        {label}
      </button>
    );
  }

  return (
    <Link to={target} className={`${base} ${className}`}>
      <Plus className="h-4 w-4" />
      {label}
    </Link>
  );
}

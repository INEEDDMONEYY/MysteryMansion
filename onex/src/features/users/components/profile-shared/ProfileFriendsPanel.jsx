import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, UserRound, ShieldCheck } from "lucide-react";
import useProfileConnections from "../../hooks/useProfileConnections";

export default function ProfileFriendsPanel({ userId }) {
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [userId]);
  const { data, loading, error, reload } = useProfileConnections(userId, page);
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="flex items-center gap-2 font-bold text-gray-900"><Users size={18} className="text-pink-600" />
          Friends {data && <span className="text-sm font-medium text-pink-600">{data.friendCount}</span>}
        </h2>
        {data && <p className="mt-1 text-xs text-gray-500">{data.followerCount} followers · {data.followingCount} following</p>}
      </div>
      <div className="max-h-80 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        tabIndex={0} role="region" aria-label="Friends list">
        {loading ? <p className="p-5 text-sm text-gray-500" role="status">Loading friends...</p> :
          error ? <p className="p-5 text-sm text-red-600" role="alert">{error} <button type="button" onClick={reload} className="underline">Retry</button></p> :
          data?.friends.length ? (
            <ul className="divide-y divide-gray-100 p-3">
              {data.friends.map((friend) => (
                <li key={friend._id}>
                  <Link to={`/user/${friend._id}`} className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-pink-50">
                    {friend.profilePic ? <img src={friend.profilePic} alt="" loading="lazy" className="h-10 w-10 shrink-0 rounded-full object-cover" /> :
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-400"><UserRound size={20} /></span>}
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-gray-900">{friend.username}</span>
                      {friend.role === "admin" && <span className="flex items-center gap-1 text-xs text-blue-600"><ShieldCheck size={12} />Admin</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="p-5 text-sm text-gray-500">Follow each other to become friends.</p>}
      </div>
      {data && (page > 1 || data.pagination.hasNextPage) && (
        <div className="flex justify-between border-t border-gray-100 p-3 text-sm">
          <button type="button" disabled={page === 1 || loading} onClick={() => setPage((value) => value - 1)} className="disabled:opacity-40">Previous</button>
          <span>Page {page}</span>
          <button type="button" disabled={!data.pagination.hasNextPage || loading} onClick={() => setPage((value) => value + 1)} className="disabled:opacity-40">Next</button>
        </div>
      )}
    </section>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, BadgeCheck, Rocket, Star, ArrowLeft } from 'lucide-react';
import api from '@/shared/utils/api';
import { setSEO } from '@/shared/utils/seo';

function LikedPostCard({ post }) {
  const username = post.userId?.username || 'Unknown';
  const profilePic = post.userId?.profilePic || '';
  const badgeType = post.badgeType || post.userId?.badgeType || '';
  const thumbnail = Array.isArray(post.pictures) && post.pictures[0]
    ? post.pictures[0]
    : null;
  const locationParts = [post.city, post.state, post.country].filter(Boolean);

  const likedAgo = (() => {
    if (!post.likedAt) return '';
    const diff = Date.now() - new Date(post.likedAt).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'today';
    if (days === 1) return 'yesterday';
    return `${days}d ago`;
  })();

  return (
    <Link
      to={`/posts/${post._id}`}
      className="group flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-pink-200 transition-all"
    >
      {/* Thumbnail */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {thumbnail ? (
          <img src={thumbnail} alt={post.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-300 text-2xl">📷</div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-gray-900 truncate group-hover:text-pink-600 transition-colors">
            {post.title || 'Untitled Post'}
          </h3>
          {badgeType === 'blue' && (
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
              <BadgeCheck size={10} /> Verified
            </span>
          )}
          {badgeType === 'pink' && (
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-[10px] font-semibold text-white">
              <Star size={10} /> Promo
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          {profilePic && (
            <img src={profilePic} alt={username} className="h-5 w-5 rounded-full object-cover border border-pink-200" />
          )}
          <span className="text-xs text-gray-500 truncate">{username}</span>
        </div>

        {locationParts.length > 0 && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{locationParts.join(', ')}</p>
        )}

        <p className="text-xs text-gray-300 mt-1">Liked {likedAgo}</p>
      </div>
    </Link>
  );
}

export default function LikedPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setSEO('Liked Posts | Mystery Mansion', '', { robots: 'noindex, nofollow' });
    api.get('/users/me/liked-posts')
      .then(({ data }) => setPosts(Array.isArray(data) ? data : []))
      .catch((err) => setError(err?.response?.data?.error || 'Failed to load liked posts.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full -m-4 md:-m-6 p-4 md:p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-white">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-pink-100 flex items-center justify-center">
          <Heart size={18} className="text-pink-600 fill-pink-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Liked Posts</h1>
          <p className="text-sm text-gray-500">Provider posts you've saved for later</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 text-sm mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/60 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-pink-200 bg-white p-10 text-center">
          <Heart size={40} className="mx-auto mb-3 text-pink-200" />
          <p className="text-gray-500 font-medium">No liked posts yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Browse provider listings and tap the heart to save them here.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-500 transition-colors"
          >
            <ArrowLeft size={14} /> Browse Listings
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-gray-400 mb-4">{posts.length} saved {posts.length === 1 ? 'listing' : 'listings'}</p>
          {posts.map((post) => (
            <LikedPostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare, Star, Settings, ChevronRight,
  Trash2, Mail, ExternalLink,
} from 'lucide-react';
import { UserContext } from '@/context/UserContext';
import api from '@/shared/utils/api';
import { setSEO } from '@/shared/utils/seo';
import UpdateProfileSettings from '@/shared/components/user/settings/UpdateProfileSettings';
import EmailSettings from '@/shared/components/user/settings/EmailSettings';
import DeleteAccountSettings from '@/shared/components/user/settings/DeleteAccountSettings';
import { FEATURE_FLAGS } from '@/config/featureFlags';

// ── helpers ───────────────────────────────────────────────────────────────────
function timeAgo(iso) {
  if (!iso) return '';
  const secs = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (secs < 60)  return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60)  return `${mins}m ago`;
  const hrs  = Math.floor(mins / 60);
  if (hrs  < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Tab button ────────────────────────────────────────────────────────────────
function Tab({ active, onClick, icon: Icon, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
        active
          ? 'bg-purple-600 text-white shadow-sm'
          : 'text-gray-600 hover:bg-purple-50 hover:text-purple-700'
      }`}
    >
      <Icon size={15} />
      {label}
      {typeof count === 'number' && (
        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
          active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

// ── Comment card ─────────────────────────────────────────────────────────────
function CommentCard({ comment }) {
  const postTitle = comment.postId?.title || 'Deleted post';
  const postId    = comment.postId?._id   || comment.postId;
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-purple-100 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare size={14} className="text-purple-400 shrink-0" />
          {postId ? (
            <Link
              to={`/posts/${postId}`}
              className="text-xs font-semibold text-purple-700 truncate hover:underline"
            >
              {postTitle}
            </Link>
          ) : (
            <span className="text-xs font-semibold text-gray-400 truncate">{postTitle}</span>
          )}
          {postId && (
            <ExternalLink size={11} className="shrink-0 text-purple-300" />
          )}
        </div>
        <span className="text-[11px] text-gray-400 shrink-0">{timeAgo(comment.createdAt)}</span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{comment.text}</p>
    </div>
  );
}

// ── Review card (authored) ───────────────────────────────────────────────────
function AuthoredReviewCard({ review }) {
  const targetUsername = review.targetUserId?.username || 'Unknown provider';
  const targetId       = review.targetUserId?._id      || review.targetUserId;
  const profilePic     = review.targetUserId?.profilePic || '';
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-purple-100 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-full overflow-hidden bg-purple-100 shrink-0 flex items-center justify-center">
            {profilePic
              ? <img src={profilePic} alt={targetUsername} className="h-full w-full object-cover" />
              : <Star size={12} className="text-purple-400" />
            }
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Review for</p>
            {targetId ? (
              <Link
                to={`/profile/${targetUsername}`}
                className="text-xs font-semibold text-purple-700 hover:underline truncate"
              >
                {targetUsername}
              </Link>
            ) : (
              <span className="text-xs font-semibold text-gray-500 truncate">{targetUsername}</span>
            )}
          </div>
        </div>
        <span className="text-[11px] text-gray-400 shrink-0">{timeAgo(review.createdAt)}</span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{review.text}</p>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, description, cta }) {
  return (
    <div className="py-12 text-center">
      <Icon size={36} className="mx-auto mb-3 text-purple-200" />
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <p className="text-xs text-gray-400 mb-4">{description}</p>
      {cta}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const TABS = ['settings', 'comments', 'reviews'];

export default function ClientProfilePage() {
  const { user } = useContext(UserContext);
  const [tab, setTab]                   = useState('settings');
  const [activity, setActivity]         = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError]     = useState('');

  useEffect(() => {
    setSEO('My Profile | Mystery Mansion', '', { robots: 'noindex, nofollow' });
  }, []);

  // Fetch activity lazily when switching to comments or reviews tab
  useEffect(() => {
    if (tab === 'settings' || activity !== null) return;
    let active = true;
    setActivityLoading(true);
    setActivityError('');
    api.get('/users/me/activity')
      .then(({ data }) => { if (active) setActivity(data); })
      .catch(() => { if (active) setActivityError('Failed to load activity. Please try again.'); })
      .finally(() => { if (active) setActivityLoading(false); });
    return () => { active = false; };
  }, [tab, activity]);

  const comments       = activity?.comments?.items       ?? [];
  const authoredReviews = activity?.authoredReviews?.items ?? [];

  return (
    <div className="min-h-full -m-4 md:-m-6 p-4 md:p-6 space-y-6 bg-gradient-to-br from-purple-50 via-pink-50 to-white">

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your account and see your activity on the platform.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-2">
        <Tab
          active={tab === 'settings'}
          onClick={() => setTab('settings')}
          icon={Settings}
          label="Profile Settings"
        />
        <Tab
          active={tab === 'comments'}
          onClick={() => setTab('comments')}
          icon={MessageSquare}
          label="My Comments"
          count={activity?.comments?.total ?? undefined}
        />
        <Tab
          active={tab === 'reviews'}
          onClick={() => setTab('reviews')}
          icon={Star}
          label="My Reviews"
          count={activity?.authoredReviews?.total ?? undefined}
        />
      </div>

      {/* ── Settings tab ── */}
      {tab === 'settings' && (
        <div className="max-w-2xl space-y-8">
          {/* Basic profile */}
          <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
            <UpdateProfileSettings user={user} />
          </div>

          {/* Email */}
          <div className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Mail size={16} className="text-purple-500" />
              <h2 className="text-sm font-semibold text-gray-900">Email Settings</h2>
            </div>
            <EmailSettings user={user} />
          </div>

          {/* Delete account */}
          {FEATURE_FLAGS.DELETE_ACCOUNT_SETTINGS && (
            <div className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Trash2 size={16} className="text-red-500" />
                <h2 className="text-sm font-semibold text-red-600">Danger Zone</h2>
              </div>
              <DeleteAccountSettings />
            </div>
          )}
        </div>
      )}

      {/* ── Comments tab ── */}
      {tab === 'comments' && (
        <div className="max-w-2xl space-y-3">
          {activityLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-white/60 animate-pulse" />
              ))}
            </div>
          )}
          {activityError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {activityError}
            </p>
          )}
          {!activityLoading && !activityError && comments.length === 0 && (
            <div className="bg-white border border-purple-100 rounded-2xl shadow-sm">
              <EmptyState
                icon={MessageSquare}
                title="No comments yet"
                description="When you comment on a provider listing, it will appear here."
                cta={
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:underline"
                  >
                    Browse listings <ChevronRight size={14} />
                  </Link>
                }
              />
            </div>
          )}
          {!activityLoading && !activityError && comments.length > 0 && (
            <>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {activity.comments.total} comment{activity.comments.total !== 1 ? 's' : ''} total
              </p>
              {comments.map((c) => <CommentCard key={c._id} comment={c} />)}
            </>
          )}
        </div>
      )}

      {/* ── Reviews tab ── */}
      {tab === 'reviews' && (
        <div className="max-w-2xl space-y-3">
          {activityLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-white/60 animate-pulse" />
              ))}
            </div>
          )}
          {activityError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {activityError}
            </p>
          )}
          {!activityLoading && !activityError && authoredReviews.length === 0 && (
            <div className="bg-white border border-purple-100 rounded-2xl shadow-sm">
              <EmptyState
                icon={Star}
                title="No reviews written yet"
                description="After visiting a provider, leave a review on their profile."
                cta={
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-purple-600 hover:underline"
                  >
                    Browse listings <ChevronRight size={14} />
                  </Link>
                }
              />
            </div>
          )}
          {!activityLoading && !activityError && authoredReviews.length > 0 && (
            <>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                {activity.authoredReviews.total} review{activity.authoredReviews.total !== 1 ? 's' : ''} written
              </p>
              {authoredReviews.map((r) => <AuthoredReviewCard key={r._id} review={r} />)}
            </>
          )}
        </div>
      )}

    </div>
  );
}

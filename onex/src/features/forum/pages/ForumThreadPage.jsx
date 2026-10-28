import { useContext, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import { UserContext } from "@/context/UserContext";
import { setSEO } from "@/shared/utils/seo";

import ForumPostCard from "../components/ForumPostCard";
import ForumReplyForm from "../components/replies/ForumReplyForm";
import ForumReplyList from "../components/replies/ForumReplyList";

import useForumThread from "../hooks/useForumThread";
import useForumReplies from "../hooks/useForumReplies";
import useMembership from "@/features/membership/hooks/useMembership";
import { MEMBERSHIP_UPDATED_EVENT } from "@/features/membership/context/MembershipContext";
import {
  deleteForumThread,
  updateForumThread,
  boostForumThread,
} from "../services/forumThreadService";

export default function ForumThreadPage() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext) || {};
  const { membership } = useMembership();
  const perks = membership.perks;

  const { thread, loading, error, patchThread } = useForumThread({ threadId });

  const {
    replies,
    pagination,
    loading: repliesLoading,
    loadingMore,
    submitting,
    error: repliesError,
    loadMore,
    addReply,
    editReply,
    removeReply,
    patchReply,
    setSolution,
  } = useForumReplies({ threadId });

  useEffect(() => {
    if (!thread) return;

    setSEO(
      `${thread.title} | Mystery Mansion Forum`,
      thread.excerpt || thread.title,
      { robots: "index, follow", canonicalPath: `/forum/thread/${thread.id}` }
    );
  }, [thread]);

  const requireAuth = () => navigate("/signin");

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-4xl animate-pulse space-y-4" aria-label="Loading discussion">
          <div className="h-4 w-48 rounded bg-gray-200" />
          <div className="h-64 rounded-2xl bg-gray-200" />
        </div>
      </main>
    );
  }

  if (error || !thread) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <h1 className="text-2xl font-black text-gray-950">Discussion not found</h1>
        <p className="mt-2 text-sm text-gray-500">
          {error || "This discussion may have been removed."}
        </p>
        <Link
          to="/forum/discussions"
          className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-pink-600"
        >
          Browse all discussions
        </Link>
      </main>
    );
  }

  const saveThread = async ({ title, content }) => {
    const updated = await updateForumThread({ thread, updates: { title, content } });
    patchThread(updated);
  };

  const moderateThread = async (updates) => {
    try {
      patchThread(await updateForumThread({ thread, updates }));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Unable to update the discussion.");
    }
  };

  const boostThread = async () => {
    try {
      const result = await boostForumThread({ thread });
      patchThread(result.thread);
      window.dispatchEvent(new Event(MEMBERSHIP_UPDATED_EVENT));
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Unable to boost the discussion.");
    }
  };

  const removeThread = async () => {
    try {
      await deleteForumThread({ thread });
      navigate("/forum/discussions", { replace: true });
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Unable to delete the discussion.");
    }
  };

  const postReply = async (content, parentReplyId = null, attachments = []) => {
    await addReply({ content, parentReplyId, attachments });
    patchThread({ replyCount: thread.replyCount + 1 });
  };

  const deleteReply = async (reply) => {
    try {
      await removeReply(reply);
      patchThread({
        replyCount: Math.max(0, thread.replyCount - 1),
        ...(reply.isSolution ? { isSolved: false, solutionReplyId: null } : {}),
      });
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Unable to delete the reply.");
    }
  };

  const changeSolution = (replyId) => {
    setSolution(replyId);
    patchThread({ isSolved: Boolean(replyId), solutionReplyId: replyId });
  };

  const locked = thread.locked;

  return (
    <main className="min-h-screen w-full bg-gray-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-4xl">
        <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-sm text-gray-500">
          <Link to="/forum" className="transition hover:text-pink-600">
            Forum
          </Link>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <Link to="/forum/discussions" className="transition hover:text-pink-600">
            Discussions
          </Link>
          {thread.category && (
            <>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <Link
                to={`/forum/category/${thread.category.slug}`}
                className="transition hover:text-pink-600"
              >
                {thread.category.name}
              </Link>
            </>
          )}
        </nav>

        <ForumPostCard
          thread={thread}
          user={user}
          onSave={saveThread}
          onDelete={removeThread}
          onModerate={moderateThread}
          perks={perks}
          boostsRemaining={membership.boostsRemaining}
          onBoost={boostThread}
          onRequireAuth={requireAuth}
        />

        <section className="mt-10" aria-labelledby="replies-heading">
          <h2 id="replies-heading" className="text-xl font-black tracking-tight text-gray-950">
            {thread.replyCount} {thread.replyCount === 1 ? "Reply" : "Replies"}
          </h2>

          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <ForumReplyForm
              signedIn={Boolean(user?._id)}
              allowAttachments={perks.forumUploads}
              showUploadHint
              lockedMessage={locked ? "This discussion is locked. New replies are disabled." : ""}
              submitting={submitting}
              placeholder="Share your thoughts..."
              onSubmit={(content, files) => postReply(content, null, files)}
            />
          </div>

          <div className="mt-6">
            <ForumReplyList
              replies={replies}
              loading={repliesLoading}
              error={repliesError}
              thread={thread}
              user={user}
              canReply={!locked}
              canEditPosts={perks.editForumPosts}
              allowAttachments={perks.forumUploads}
              hasMore={pagination.hasNextPage}
              loadingMore={loadingMore}
              onLoadMore={loadMore}
              onReply={(parentId, content, files) => postReply(content, parentId, files)}
              onEdit={editReply}
              onDelete={deleteReply}
              onSolutionChange={changeSolution}
              onVoteChange={(replyId, result) =>
                patchReply(replyId, { upvoteCount: result.score, viewerVote: result.value })
              }
              onRequireAuth={requireAuth}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

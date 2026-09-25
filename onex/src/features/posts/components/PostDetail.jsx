// 📦 External Libraries
import {
  useState,
  useEffect,
  useContext,
} from "react";
import {
  useParams,
  useNavigate,
} from "react-router-dom";
import { Phone, Clock3, Image as ImageIcon, Video as VideoIcon, DollarSign } from "lucide-react";

import { FEATURE_FLAGS } from "@/config/featureFlags";
import api from "@/shared/utils/api";
import { UserContext } from "@/context/UserContext";
import { hasPermanentProviderBadge } from "@/features/users/services/providerBadgeEligibility";
import { getPostCategories } from "../services/postCategories";

// 🌀 Loaders
import PostDetailLoader from "@/shared/components/Loaders/PostDetailLoader";

// 🧩 Post Detail Components
import PostDetailHeader from "../components/PostDetail/PostDetailHeader";
import PostHero from "../components/PostDetail/PostHero";
import PostOverview from "../components/PostDetail/PostOverview";
import PostContact from "../components/PostDetail/PostContact";
import PostDescription from "../components/PostDetail/PostDescription";
import PostAvailability from "../components/PostDetail/PostAvailability";
import PostPricing from "../components/PostDetail/PostPricing";
import PostMediaGallery from "../components/PostDetail/PostMediaGallery";
import PostEngagement from "../components/PostDetail/PostEngagement";
import CommentSection from "../components/PostDetail/Comments/CommentSection";

// 🛠️ Utilities
import {
  formatPhoneNumber,
  getPhoneHref,
  getPostedAgoLabel,
} from "../utils/PostFormatter";

const postRequestCache = new Map();

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } =
    useContext(UserContext);

  const [post, setPost] = useState(null);
  const [loading, setLoading] =
    useState(true);
  const [fetchError, setFetchError] =
    useState("");

  // ── Detail tabs ──────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] =
    useState("contact");

  // ── Comments ────────────────────────────────────────────────────────────
  const [comments, setComments] =
    useState([]);
  const [commentsLoading, setCommentsLoading] =
    useState(false);
  const [commentText, setCommentText] =
    useState("");
  const [
    editingCommentId,
    setEditingCommentId,
  ] = useState("");
  const [editingText, setEditingText] =
    useState("");
  const [commentBusyId, setCommentBusyId] =
    useState("");
  const [commentError, setCommentError] =
    useState("");

  // ── Likes ────────────────────────────────────────────────────────────────
  const [liked, setLiked] =
    useState(false);
  const [likeCount, setLikeCount] =
    useState(0);
  const [likeBusy, setLikeBusy] =
    useState(false);

  // ── Derived post data ────────────────────────────────────────────────────
  const photoItems = Array.isArray(post?.pictures)
    ? post.pictures.map((url) => ({ type: "image", url }))
    : [];

  const videoItems = Array.isArray(post?.videos)
    ? post.videos.map((url) => ({ type: "video", url }))
    : [];

  // The hero shows the first uploaded photo; the Photos tab lists every photo, including that one.
  const heroImage = photoItems[0]?.url || post?.picture || "";

  const postOwnerId =
    post?.userId?._id ||
    post?.userId?.id ||
    "";

  const currentUserId =
    currentUser?._id ||
    currentUser?.id ||
    "";

  const effectiveUser =
    postOwnerId &&
    currentUserId &&
    postOwnerId === currentUserId
      ? {
          ...post?.userId,
          ...currentUser,
        }
      : post?.userId;

  const locationParts = [
    post?.city,
    post?.state,
    post?.country,
  ].filter(Boolean);

  const displayLocation =
    locationParts.length > 0
      ? locationParts.join(", ")
      : "";

  const displayCategories =
    getPostCategories(post);

  const displayPhoneNumber =
    effectiveUser?.phoneNumber
      ? formatPhoneNumber(
          effectiveUser.phoneNumber
        )
      : "";

  const phoneHref = getPhoneHref(
    effectiveUser?.phoneNumber || ""
  );

  const displayEmail =
    typeof effectiveUser?.email ===
    "string"
      ? effectiveUser.email.trim()
      : "";

  const emailHref = displayEmail
    ? `mailto:${displayEmail}`
    : "";

  const badgeType =
    post?.badgeType ||
    effectiveUser?.badgeType ||
    "";

  // ── Badge logic ──────────────────────────────────────────────────────────
  const hasTrustedAccountAge = () => {
    const createdAt =
      effectiveUser?.createdAt;

    if (!createdAt) return false;

    const createdDate = new Date(
      createdAt
    );

    if (
      Number.isNaN(
        createdDate.getTime()
      )
    ) {
      return false;
    }

    const oneYearMs =
      365 * 24 * 60 * 60 * 1000;

    return (
      Date.now() -
        createdDate.getTime() >=
      oneYearMs
    );
  };

  const isTrustedProvider =
    hasTrustedAccountAge();

  const isPermanentProvider =
    hasPermanentProviderBadge(
      effectiveUser?.createdAt
    );

  // ── Availability ─────────────────────────────────────────────────────────
  const availability =
    effectiveUser?.availability || {
      status: "",
    };

  // ── Pricing ──────────────────────────────────────────────────────────────
  const prices = {
    incall:
      effectiveUser?.incallPrice !=
      null
        ? String(
            effectiveUser.incallPrice
          )
        : "",

    outcall:
      effectiveUser?.outcallPrice !=
      null
        ? String(
            effectiveUser.outcallPrice
          )
        : "",

    overnights:
      effectiveUser?.overnightPrice !=
      null
        ? String(
            effectiveUser.overnightPrice
          )
        : "",

    flyOut:
      effectiveUser?.flyOutPrice !=
      null
        ? String(
            effectiveUser.flyOutPrice
          )
        : "",
  };

  const hasPrices =
    Object.values(prices).some(
      (value) =>
        value !== "" &&
        Number(value) > 0
    );

  // ── Detail tabs ──────────────────────────────────────────────────────────
  const profileHref =
    FEATURE_FLAGS.ENABLE_PUBLIC_PROFILE &&
    postOwnerId
      ? `/user/${postOwnerId}`
      : "";

  const detailTabs = [
    { key: "contact", label: "Contact", icon: Phone, show: true },
    { key: "availability", label: "Availability", icon: Clock3, show: Boolean(availability?.status) },
    { key: "photos", label: "Photos", icon: ImageIcon, show: true, count: photoItems.length },
    { key: "videos", label: "Videos", icon: VideoIcon, show: true, count: videoItems.length },
    { key: "donations", label: "Donations", icon: DollarSign, show: hasPrices },
  ];

  const visibleDetailTabs = detailTabs.filter((tab) => tab.show);

  const currentTab = visibleDetailTabs.some((tab) => tab.key === activeTab)
    ? activeTab
    : visibleDetailTabs[0]?.key;

  // ── Load comments ────────────────────────────────────────────────────────
  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      setCommentError("");

      const { data } = await api.get(
        `/posts/${postId}/comments`
      );

      setComments(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(
        "Failed to fetch comments:",
        err
      );

      setComments([]);

      setCommentError(
        err?.response?.data?.error ||
          "Failed to load comments."
      );
    } finally {
      setCommentsLoading(false);
    }
  };

  // ── Fetch post ───────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchPost = async () => {
      try {
        setFetchError("");

        let request =
          postRequestCache.get(postId);

        if (!request) {
          request = api
            .get(`/posts/${postId}`)
            .then((res) => res.data)
            .finally(() => {
              postRequestCache.delete(
                postId
              );
            });

          postRequestCache.set(
            postId,
            request
          );
        }

        const data = await request;

        if (!cancelled) {
          setPost(data);
        }
      } catch (err) {
        console.error(
          "Failed to fetch post:",
          err
        );

        if (!cancelled) {
          setPost(null);

          const status =
            err?.response?.status;

          const backendMessage =
            err?.response?.data?.error;

          if (!status) {
            setFetchError(
              "Unable to reach the server. Please check your connection or deployment API URL."
            );
          } else if (
            status === 404
          ) {
            setFetchError(
              "This post could not be found. It may have been deleted or the link is invalid."
            );
          } else {
            setFetchError(
              backendMessage ||
                `Failed to load post details (HTTP ${status}).`
            );
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  // ── Fetch comments ───────────────────────────────────────────────────────
  useEffect(() => {
    if (
      !FEATURE_FLAGS.ENABLE_COMMENTS
    ) {
      return;
    }

    loadComments();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  // ── Fetch like status ────────────────────────────────────────────────────
  useEffect(() => {
    if (!postId) return;

    api
      .get(
        `/posts/${postId}/like/status`
      )
      .then(({ data }) => {
        setLiked(data.liked);
        setLikeCount(
          data.likeCount ?? 0
        );
      })
      .catch(() => {});
  }, [postId]);

  // ── Toggle like ──────────────────────────────────────────────────────────
  const handleToggleLike = async () => {
    if (!currentUserId) {
      navigate("/signin");
      return;
    }

    if (likeBusy) return;

    setLikeBusy(true);

    try {
      const { data } = await api.post(
        `/posts/${postId}/like`
      );

      setLiked(data.liked);
      setLikeCount(
        data.likeCount ?? 0
      );
    } catch (err) {
      console.error(
        "Failed to toggle like:",
        err
      );
    } finally {
      setLikeBusy(false);
    }
  };

  // ── Create comment ───────────────────────────────────────────────────────
  const handleCreateComment = async (
    e
  ) => {
    e.preventDefault();

    const text = String(
      commentText || ""
    ).trim();

    if (!text) return;

    try {
      setCommentBusyId("new");
      setCommentError("");

      const { data } = await api.post(
        `/posts/${postId}/comments`,
        { text }
      );

      setComments((prev) => [
        data,
        ...prev,
      ]);

      setCommentText("");
    } catch (err) {
      console.error(
        "Failed to create comment:",
        err
      );

      setCommentError(
        err?.response?.data?.error ||
          "Failed to add comment."
      );
    } finally {
      setCommentBusyId("");
    }
  };

  // ── Edit comment ─────────────────────────────────────────────────────────
  const startEditingComment = (
    comment
  ) => {
    setEditingCommentId(
      comment?._id || ""
    );

    setEditingText(
      comment?.text || ""
    );
  };

  const cancelEditingComment = () => {
    setEditingCommentId("");
    setEditingText("");
  };

  // ── Update comment ───────────────────────────────────────────────────────
  const handleUpdateComment = async (
    commentId
  ) => {
    const text = String(
      editingText || ""
    ).trim();

    if (!text) return;

    try {
      setCommentBusyId(commentId);
      setCommentError("");

      const { data } = await api.put(
        `/posts/${postId}/comments/${commentId}`,
        { text }
      );

      setComments((prev) =>
        prev.map((comment) =>
          comment._id === commentId
            ? data
            : comment
        )
      );

      cancelEditingComment();
    } catch (err) {
      console.error(
        "Failed to update comment:",
        err
      );

      setCommentError(
        err?.response?.data?.error ||
          "Failed to update comment."
      );
    } finally {
      setCommentBusyId("");
    }
  };

  // ── Delete comment ───────────────────────────────────────────────────────
  const handleDeleteComment = async (
    commentId
  ) => {
    try {
      setCommentBusyId(commentId);
      setCommentError("");

      await api.delete(
        `/posts/${postId}/comments/${commentId}`
      );

      setComments((prev) =>
        prev.filter(
          (comment) =>
            comment._id !== commentId
        )
      );

      if (
        editingCommentId ===
        commentId
      ) {
        cancelEditingComment();
      }
    } catch (err) {
      console.error(
        "Failed to delete comment:",
        err
      );

      setCommentError(
        err?.response?.data?.error ||
          "Failed to delete comment."
      );
    } finally {
      setCommentBusyId("");
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return <PostDetailLoader />;
  }

  // ── Missing post ─────────────────────────────────────────────────────────
  if (!post) {
    return (
      <div className="py-10 text-center text-red-500">
        <p className="font-semibold">
          Post not found.
        </p>

        {fetchError && (
          <p className="mt-2 text-sm text-red-400">
            {fetchError}
          </p>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <PostDetailHeader
        badgeType={badgeType}
        isTrustedProvider={
          isTrustedProvider
        }
        isPermanentProvider={
          isPermanentProvider
        }
        onBack={() => navigate("/home")}
      />

      <PostHero
        image={heroImage}
        title={post.title}
        username={
          effectiveUser?.username
        }
        createdLabel={getPostedAgoLabel(
          post.createdAt
        )}
        profileHref={profileHref}
      />

      <PostOverview
        gender={effectiveUser?.gender}
        age={effectiveUser?.age}
        location={displayLocation}
        categories={displayCategories}
      />

      <PostDescription
        description={post.description}
      />

      {/* ── Detail tabs ──────────────────────────────────────────────── */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex overflow-x-auto scrollbar-none">
            {visibleDetailTabs.map(({ key, label, icon: Icon, count }) => {
              const isActive = currentTab === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-4 text-sm transition-colors ${
                    isActive
                      ? "border-pink-500 font-semibold text-pink-600"
                      : "border-transparent font-medium text-gray-500 hover:border-pink-300 hover:text-pink-600"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                  {typeof count === "number" && count > 0 && (
                    <span
                      className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                        isActive ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </section>

      {currentTab === "contact" && (
        <PostContact
          phoneNumber={
            displayPhoneNumber
          }
          phoneHref={phoneHref}
          email={displayEmail}
          emailHref={emailHref}
        />
      )}

      {currentTab === "availability" && (
        <PostAvailability
          availability={availability}
        />
      )}

      {currentTab === "photos" && (
        <section className="border-b border-gray-200 py-8">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-4 text-xl font-semibold text-pink-500">
              Photos
            </h2>

            <PostMediaGallery
              mediaItems={photoItems}
            />
          </div>
        </section>
      )}

      {currentTab === "videos" && (
        <section className="border-b border-gray-200 py-8">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-4 text-xl font-semibold text-pink-500">
              Videos
            </h2>

            <PostMediaGallery
              mediaItems={videoItems}
            />
          </div>
        </section>
      )}

      {currentTab === "donations" && (
        <PostPricing
          prices={prices}
          hasPrices={hasPrices}
        />
      )}

      <PostEngagement
        liked={liked}
        likeCount={likeCount}
        likeBusy={likeBusy}
        currentUserId={
          currentUserId
        }
        postedLabel={getPostedAgoLabel(
          post.createdAt
        )}
        onToggleLike={
          handleToggleLike
        }
      />

      {FEATURE_FLAGS.ENABLE_COMMENTS && (
        <CommentSection
          comments={comments}
          commentsLoading={
            commentsLoading
          }
          commentText={commentText}
          setCommentText={
            setCommentText
          }
          editingCommentId={
            editingCommentId
          }
          editingText={editingText}
          setEditingText={
            setEditingText
          }
          commentBusyId={
            commentBusyId
          }
          commentError={commentError}
          currentUserId={
            currentUserId
          }
          currentUser={currentUser}
          onCreateComment={
            handleCreateComment
          }
          onStartEditing={
            startEditingComment
          }
          onCancelEditing={
            cancelEditingComment
          }
          onUpdateComment={
            handleUpdateComment
          }
          onDeleteComment={
            handleDeleteComment
          }
          onSignIn={() =>
            navigate("/signin")
          }
          onSignUp={() =>
            navigate("/signup")
          }
        />
      )}
    </main>
  );
}
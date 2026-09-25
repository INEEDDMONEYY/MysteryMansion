import Post from "../../models/Post.js";
import Review from "../../models/Review.js";
import Referral from "../../models/Referral.js";
import SavedPost from "../../models/SavedPost.js";
import PostLike from "../../models/PostLike.js";
import Message from "../../models/Message.js";
import Milestone from "../../models/Milestone.js";

function profileCompleteness(user) {
  let filled = 0;
  if (user.bio?.trim()) filled += 1;
  if (user.profilePic) filled += 1;
  if (user.bannerPic) filled += 1;
  if (user.age) filled += 1;
  if (user.location?.trim()) filled += 1;
  if (user.gender) filled += 1;
  if (Object.values(user.socialLinks || {}).some((v) => v?.trim())) filled += 1;
  return filled;
}

/**
 * Computes a user's milestone definitions from real account activity, split into
 * "recent" (achieved) and "new" (not yet achieved) buckets.
 * Shared by the GET /milestones/me route and the milestone achievement email job.
 */
export async function computeUserMilestones(user) {
  const isProvider = user.accountType === "provider";

  const [postCount, reviewCount, referral, savedCount, likedCount, messageCount] = await Promise.all([
    Post.countDocuments({ userId: user._id }),
    Review.countDocuments({ targetUserId: user._id }),
    Referral.findOne({ providerId: user._id }).lean(),
    SavedPost.countDocuments({ userId: user._id }),
    PostLike.countDocuments({ userId: user._id }),
    Message.countDocuments({ senderId: user._id }),
  ]);

  const completeness = profileCompleteness(user);
  const memberDays = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000);
  const referralSignups = referral?.signupCount ?? 0;

  const definitions = isProvider
    ? [
        {
          id: "get-started",
          title: "Get Started",
          description: "Create your account and establish your presence on Mystery Mansion.",
          achieved: true,
          achievedAt: user.createdAt,
        },
        {
          id: "build-profile",
          title: "Build Your Profile",
          description: "Fill out your bio, photos, and details so clients can get to know you.",
          achieved: completeness >= 4,
          progress: completeness,
          target: 4,
        },
        {
          id: "stay-active",
          title: "Stay Active",
          description: "Publish at least 3 posts to stay visible on the platform.",
          achieved: postCount >= 3,
          progress: postCount,
          target: 3,
        },
        {
          id: "build-recognition",
          title: "Build Recognition",
          description: "Earn your first review or referral signup to start building recognition.",
          achieved: reviewCount >= 1 || referralSignups >= 1,
          progress: reviewCount + referralSignups,
          target: 1,
        },
      ]
    : [
        {
          id: "get-started",
          title: "Get Started",
          description: "Create your account and begin exploring Mystery Mansion.",
          achieved: true,
          achievedAt: user.createdAt,
        },
        {
          id: "discover",
          title: "Discover",
          description: "Save or like your first post to start exploring providers.",
          achieved: savedCount + likedCount >= 1,
          progress: savedCount + likedCount,
          target: 1,
        },
        {
          id: "engage",
          title: "Engage",
          description: "Send your first message to start engaging on the platform.",
          achieved: messageCount >= 1,
          progress: messageCount,
          target: 1,
        },
        {
          id: "build-progress",
          title: "Build Progress",
          description: "Stick around for 30 days to build your platform progress.",
          achieved: memberDays >= 30,
          progress: memberDays,
          target: 30,
        },
      ];

  // Admin-authored milestone announcements for this account type — always shown
  // as "new" since they have no computed achievement criteria.
  const customMilestones = await Milestone.find({ accountType: user.accountType, status: "published" })
    .sort({ sortOrder: 1, publishedAt: 1 })
    .lean();

  const customDefinitions = customMilestones.map((m) => ({
    id: String(m._id),
    title: m.title,
    description: m.description || "",
    achieved: false,
  }));

  const allDefinitions = [...definitions, ...customDefinitions];

  const recent = allDefinitions.filter((m) => m.achieved);
  const upcoming = allDefinitions.filter((m) => !m.achieved);

  return { accountType: user.accountType, recent, new: upcoming, definitions: allDefinitions };
}

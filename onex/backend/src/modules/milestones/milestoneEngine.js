import Post from "../../models/Post.js";
import Review from "../../models/Review.js";
import Referral from "../../models/Referral.js";
import SavedPost from "../../models/SavedPost.js";
import PostLike from "../../models/PostLike.js";
import Message from "../../models/Message.js";
import Milestone from "../../models/Milestone.js";
import { RpLedger } from "../../models/RpLedger.js";
import { BADGE_CATALOG } from "../badges/badgeCatalog.js";
import { MILESTONE_TIER_RP_RANGE, catalogMilestoneEventKey } from "../progression/rpRules.js";
import { computeBadgeStats } from "../badges/badgeEngine.js";

export function profileCompleteness(user) {
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
 * Built-in provider/client milestones computed from account activity. These are the
 * only milestones that feed RP, reputation, and achievement notifications.
 */
export async function computeLegacyDefinitions(user) {
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
          description: "Create your account and establish your presence on TopEscortNetwork.",
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
          description: "Create your account and begin exploring TopEscortNetwork.",
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

  return definitions;
}

/** Forum and time milestones from the badge catalog, with live progress toward each threshold. */
export async function computeCatalogDefinitions(user) {
  const stats = await computeBadgeStats(user);
  return BADGE_CATALOG.map((badge) => {
    const value = stats[badge.metric] ?? 0;
    return {
      id: badge.id,
      title: badge.title,
      description: badge.description,
      tier: badge.tier,
      achieved: value >= badge.threshold,
      progress: Math.min(value, badge.threshold),
      target: badge.threshold,
      source: "catalog",
      rewardRange: MILESTONE_TIER_RP_RANGE[badge.tier],
    };
  });
}

/** Admin-authored milestone announcements for this account type — always shown as "new" since they have no computed achievement criteria. */
async function computeCustomDefinitions(user) {
  const customMilestones = await Milestone.find({ accountType: user.accountType, status: "published" })
    .sort({ sortOrder: 1, publishedAt: 1 })
    .lean();

  const customDefinitions = customMilestones.map((m) => ({
    id: String(m._id),
    title: m.title,
    description: m.description || "",
    achieved: false,
  }));

  return customDefinitions;
}

/**
 * Computes a user's milestone definitions, split into "recent" (achieved) and "new"
 * (not yet achieved) buckets. Admins keep the built-in list; everyone else gets the badge catalog.
 * Shared by the GET /milestones/me route.
 */
export async function computeUserMilestones(user) {
  let definitions;
  if (user.role === "admin") {
    definitions = await computeLegacyDefinitions(user);
  } else {
    definitions = await computeCatalogDefinitions(user);
    const achievedKeys = definitions.filter((m) => m.achieved).map((m) => catalogMilestoneEventKey(m.id));
    const rewards = achievedKeys.length
      ? await RpLedger.find({ userId: user._id, eventKey: { $in: achievedKeys } }).select("eventKey points").lean()
      : [];
    const pointsByKey = new Map(rewards.map((row) => [row.eventKey, row.points]));
    for (const m of definitions) {
      if (m.achieved) m.rewardPoints = pointsByKey.get(catalogMilestoneEventKey(m.id)) ?? null;
    }
  }
  const allDefinitions = [...definitions, ...(await computeCustomDefinitions(user))];

  const recent = allDefinitions.filter((m) => m.achieved);
  const upcoming = allDefinitions.filter((m) => !m.achieved);

  return { accountType: user.accountType, recent, new: upcoming, definitions: allDefinitions };
}

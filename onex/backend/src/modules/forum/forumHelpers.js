import ForumCategory from '../../models/ForumCategory.js';
import { serializeAttachments } from '../../models/AttachmentSchema.js';

export const roleLabel = (user) => {
  if (user?.role === 'admin') return 'Admin';
  return user?.accountType === 'client' ? 'Client' : 'Provider';
};

export const serializeAuthor = (user) =>
  user && user._id
    ? {
        id: String(user._id),
        username: user.username,
        role: roleLabel(user),
        profilePic: user.profilePic || '',
      }
    : { id: null, username: 'Deleted user', role: 'Member', profilePic: '' };

export const AUTHOR_SELECT = 'username role accountType profilePic';

export const serializeCategory = (category, threadCount = 0) => ({
  id: String(category._id),
  name: category.name,
  slug: category.slug,
  description: category.description || '',
  status: category.status,
  source: category.source,
  archived: category.status === 'archived',
  threadCount,
});

// Expects authorId and categoryId to be populated.
export const serializeThread = (thread) => {
  const author = serializeAuthor(thread.authorId);
  const category = thread.categoryId?._id
    ? { id: String(thread.categoryId._id), slug: thread.categoryId.slug, name: thread.categoryId.name }
    : null;

  return {
    id: String(thread._id),
    title: thread.title,
    content: thread.content,
    excerpt: thread.content.length > 240 ? `${thread.content.slice(0, 237)}...` : thread.content,
    categoryId: category?.id || null,
    category,
    authorId: author.id,
    author,
    tags: thread.tags || [],
    borderColor: thread.borderColor || '',
    attachments: serializeAttachments(thread.attachments),
    pinned: thread.pinned,
    isPinned: thread.pinned,
    pinnedByMember: Boolean(thread.pinnedByMember),
    isBoosted: Boolean(thread.boostedUntil) && new Date(thread.boostedUntil) > new Date(),
    boostedUntil: thread.boostedUntil || null,
    locked: thread.locked,
    isLocked: thread.locked,
    archived: thread.archived,
    isSolved: Boolean(thread.solutionReplyId),
    solutionReplyId: thread.solutionReplyId ? String(thread.solutionReplyId) : null,
    replyCount: thread.replyCount,
    upvoteCount: thread.upvoteCount,
    viewCount: thread.viewCount,
    createdAt: thread.createdAt,
    updatedAt: thread.updatedAt,
    lastActivityAt: thread.lastActivityAt,
  };
};

// Expects authorId to be populated. solutionReplyId is the thread's accepted reply.
export const serializeReply = (reply, { solutionReplyId = null, viewerVote = 0 } = {}) => {
  const author = serializeAuthor(reply.authorId);

  return {
    id: String(reply._id),
    threadId: String(reply.threadId),
    authorId: author.id,
    author,
    content: reply.isDeleted ? '[This reply was deleted]' : reply.content,
    attachments: reply.isDeleted ? [] : serializeAttachments(reply.attachments),
    parentReplyId: reply.parentReplyId ? String(reply.parentReplyId) : null,
    upvoteCount: reply.upvoteCount,
    isDeleted: reply.isDeleted,
    isSolution: Boolean(solutionReplyId) && String(solutionReplyId) === String(reply._id),
    viewerVote,
    createdAt: reply.createdAt,
    editedAt: reply.editedAt,
  };
};

export const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const DEFAULT_CATEGORIES = [
  { name: 'General Discussion', slug: 'general', description: 'General conversations within the Mystery Mansion community.' },
  { name: 'Community', slug: 'community', description: 'Community conversations, experiences, and questions.' },
  { name: 'Questions & Help', slug: 'questions-help', description: 'Ask how things work and get answers from members.' },
  { name: 'Feedback & Ideas', slug: 'feedback-ideas', description: 'Suggest features and share feedback about the platform.' },
];

export async function seedDefaultForumCategories() {
  try {
    await Promise.all(
      DEFAULT_CATEGORIES.map((category, index) =>
        ForumCategory.updateOne(
          { slug: category.slug },
          { $setOnInsert: { ...category, status: 'approved', source: 'admin', sortOrder: index } },
          { upsert: true }
        )
      )
    );
  } catch (err) {
    console.error('❌ Failed to seed forum categories:', err.message);
  }
}

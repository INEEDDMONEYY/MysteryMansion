// backend/controllers/postController.js
import Post from '../../../models/Post.js';
import Comment from '../../../models/Comment.js';
import User from '../../../models/User.js';
import cloudinary from '../../../common/utils/cloudinary.js';
import streamifier from 'streamifier';
import env from '../../../config/env.js';
import { normalizeState } from '../../../common/utils/stateNormalizer.js';
import { createNotification } from '../../notifications/notificationController.js';
import { sendAccountActivityEmail } from '../../../common/utils/sendAccountActivityEmail.js';
import { uploadBackupCopy, deleteBackupCopy } from '../../../common/utils/backupStorage.js';
import { awardCredits } from '../../credits/creditEarnService.js';
import { saveAttachments } from '../../../common/utils/attachmentUpload.js';

// Maps the account-level gender (set on the user's profile) to the post-level
// gender enum, used as a fallback when a post itself doesn't specify one.
const ACCOUNT_GENDER_TO_POST_GENDER = {
  'Woman escort': 'female',
  'Man escort': 'male',
  'TS escort': 'ts',
};

const normalizeCategories = ({ categories, category }) => {
  const rawCategories = Array.isArray(categories)
    ? categories
    : typeof categories === 'string'
      ? [categories]
      : [];

  const cleaned = rawCategories
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  if (!cleaned.length && category?.trim()) {
    cleaned.push(category.trim());
  }

  if (!cleaned.length) {
    cleaned.push('uncategorized');
  }

  return Array.from(new Set(cleaned));
};

// ---------------- Create a new post ----------------
export async function createPost(req, res) {
  try {
    if (!req.user?._id) return res.status(401).json({ error: 'Unauthorized' });

    const { title, description, city, state, country, category, categories, visibility, gender } = req.body;
    if (!title || !description)
      return res.status(400).json({ error: 'Title and description required' });

    const promoExpiry = req.user.activePromoExpiry ? new Date(req.user.activePromoExpiry) : null;
    const hasActivePromo = Boolean(promoExpiry && !Number.isNaN(promoExpiry.getTime()) && promoExpiry > new Date());
    const effectiveCategories = normalizeCategories({ categories, category });
    const effectiveCategory = effectiveCategories[0];
    const normalizedCity = city?.trim() || '';
    const normalizedState = normalizeState(state);
    const normalizedCountry = country?.trim() || '';
    const normalizedGender = ['female', 'male', 'ts'].includes(gender)
      ? gender
      : ACCOUNT_GENDER_TO_POST_GENDER[req.user.gender] || '';

    let imageUrls = [];
    let videoUrls = [];
    let imageBackupUrls = [];
    let videoBackupUrls = [];

    const uploadedFiles = Array.isArray(req.files)
      ? req.files
      : [
          ...(Array.isArray(req.files?.pictures) ? req.files.pictures : []),
          ...(Array.isArray(req.files?.videos) ? req.files.videos : []),
        ];

    // Images go to Cloudinary (+ a redundant backup copy on Cloudflare R2).
    // Videos go straight to Cloudflare R2 as the primary store, since
    // Cloudinary's moderation has been flagging/removing legitimate videos.
    if (uploadedFiles.length > 0) {
      const uploadPromises = uploadedFiles.map((file) => {
        const isVideo = file.mimetype?.startsWith('video/');

        if (isVideo) {
          return uploadBackupCopy({
            buffer: file.buffer,
            folder: 'posts',
            userId: req.user._id,
            originalName: file.originalname,
            contentType: file.mimetype,
          }).then((uploaded) => {
            if (!uploaded) throw new Error('Video upload failed: Cloudflare storage is not configured');
            return { url: uploaded.url, backupUrl: '', type: 'video' };
          });
        }

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'posts', resource_type: 'auto' },
            async (error, result) => {
              if (error) return reject(error);
              const backup = await uploadBackupCopy({
                buffer: file.buffer,
                folder: 'posts',
                userId: req.user._id,
                originalName: file.originalname,
                contentType: file.mimetype,
              });
              resolve({
                url: result.secure_url,
                backupUrl: backup?.url || '',
                type: 'image',
              });
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        });
      });

      const uploadedMedia = await Promise.all(uploadPromises);
      imageUrls = uploadedMedia.filter((m) => m.type === 'image').map((m) => m.url);
      imageBackupUrls = uploadedMedia.filter((m) => m.type === 'image').map((m) => m.backupUrl);
      videoUrls = uploadedMedia.filter((m) => m.type === 'video').map((m) => m.url);
      videoBackupUrls = uploadedMedia.filter((m) => m.type === 'video').map((m) => m.backupUrl);
      console.log('✅ Uploaded images to Cloudinary:', imageUrls);
      console.log('✅ Uploaded videos to Cloudflare R2:', videoUrls);
    }

    const newPost = new Post({
      userId: req.user._id,
      title,
      description,
      city: normalizedCity,
      state: normalizedState,
      country: normalizedCountry,
      gender: normalizedGender,
      category: effectiveCategory,
      categories: effectiveCategories,
      visibility,
      pictures: imageUrls,
      videos: videoUrls,
      pictureBackups: imageBackupUrls,
      videoBackups: videoBackupUrls,
      isPromo: hasActivePromo,
      promoExpiresAt: hasActivePromo ? promoExpiry : null,
      // Set badgeType to match the user's badgeType (e.g., 'blue', 'pink', or '')
      badgeType: req.user.badgeType || '',
    });

    const savedPost = await newPost.save();

    awardCredits({ userId: req.user._id, eventKey: 'create_post', refId: String(savedPost._id) });

    // Reset inactivity tracking now that the user has posted again.
    await User.findByIdAndUpdate(req.user._id, {
      lastPostAt: savedPost.createdAt,
      lastInactivityEmailDays: 0,
    }).catch((err) => console.error('❌ Failed to update lastPostAt:', err.message));

    const populatedPost = await Post.findById(savedPost._id).populate({
      path: 'userId',
      select: 'username email bio profilePic phoneNumber age availability incallPrice outcallPrice overnightPrice flyOutPrice gender activePromoExpiry createdAt badgeType',
    });

    res.status(201).json(populatedPost);
  } catch (err) {
    console.error('❌ [createPost] Error:', err);

    const rawMessage = String(err?.message || '').toLowerCase();
    if (
      rawMessage.includes('file size too large') ||
      rawMessage.includes('request entity too large') ||
      err?.http_code === 413
    ) {
      return res.status(413).json({ error: 'Uploaded media exceeds size limits.' });
    }

    if (
      rawMessage.includes('invalid image file') ||
      rawMessage.includes('unsupported') ||
      rawMessage.includes('invalid file')
    ) {
      return res.status(400).json({ error: 'One or more media files are invalid or unsupported.' });
    }

    res
      .status(500)
      .json({ error: 'Failed to create post', details: err.message });
  }
}

// ---------------- Get filter options (states + cities from real posts) ----------------
export async function getFilterOptions(req, res) {
  try {
    const raw = await Post.find(
      { state: { $exists: true, $ne: '' } },
      { state: 1, city: 1 }
    ).lean();

    // Normalize to Title Case so "colorado springs" and "Colorado Springs"
    // collapse into a single entry rather than appearing as duplicates.
    const toTitleCase = (str) =>
      str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

    const stateSet = new Set();
    const citiesByState = {};

    for (const post of raw) {
      const st = toTitleCase((post.state || '').trim());
      if (!st) continue;
      stateSet.add(st);
      const cities = (post.city || '').split(',').map((c) => toTitleCase(c.trim())).filter(Boolean);
      for (const c of cities) {
        if (!citiesByState[st]) citiesByState[st] = new Set();
        citiesByState[st].add(c);
      }
    }

    const citiesByStateArr = {};
    for (const [st, set] of Object.entries(citiesByState)) {
      citiesByStateArr[st] = [...set].sort();
    }

    res.json({
      states: [...stateSet].sort(),
      citiesByState: citiesByStateArr,
    });
  } catch (err) {
    console.error('❌ [getFilterOptions] Error:', err);
    res.status(500).json({ error: 'Failed to fetch filter options' });
  }
}

// ---------------- Get all posts ----------------
export async function getPosts(req, res) {
  try {
    const { userId, state, city, gender } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (state) filter.state = { $regex: new RegExp(`^${state.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
    if (city)  filter.city  = { $regex: new RegExp(city.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') };

    if (gender && ['female', 'male', 'ts'].includes(gender)) {
      // Many posts predate the per-post gender field or skip it, so also match
      // posts owned by a provider whose profile gender maps to the same value.
      const accountGender = Object.entries(ACCOUNT_GENDER_TO_POST_GENDER)
        .find(([, mapped]) => mapped === gender)?.[0];
      const genderOwnerIds = accountGender
        ? await User.find({ gender: accountGender }).select('_id').lean()
        : [];

      filter.$or = [
        { gender },
        { gender: { $in: ['', null] }, userId: { $in: genderOwnerIds.map((u) => u._id) } },
      ];
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate({ path: 'userId', select: 'username email bio profilePic phoneNumber age availability incallPrice outcallPrice overnightPrice flyOutPrice gender activePromoExpiry createdAt badgeType' });

    res.json(posts);
  } catch (err) {
    console.error('❌ [getPosts] Error:', err);
    res.status(500).json({ error: 'Failed to fetch posts', details: err.message });
  }
}

// ---------------- Get post by ID ----------------
export async function getPostById(req, res) {
  try {
    const post = await Post.findById(req.params.id).populate({
      path: 'userId',
      select: 'username email bio profilePic phoneNumber age availability incallPrice outcallPrice overnightPrice flyOutPrice gender activePromoExpiry createdAt badgeType',
    });

    if (!post) return res.status(404).json({ error: 'Post not found' });

    res.json(post);
  } catch (err) {
    console.error('❌ [getPostById] Error:', err);
    res.status(500).json({ error: 'Failed to fetch post', details: err.message });
  }
}

// ---------------- Update post ----------------
export async function updatePost(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }

    const updateData = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(updateData, 'categories') || Object.prototype.hasOwnProperty.call(updateData, 'category')) {
      const effectiveCategories = normalizeCategories({
        categories: updateData.categories,
        category: updateData.category,
      });
      updateData.categories = effectiveCategories;
      updateData.category = effectiveCategories[0];
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate({
      path: 'userId',
      select: 'username email bio profilePic phoneNumber age availability incallPrice outcallPrice overnightPrice flyOutPrice gender activePromoExpiry badgeType',
    });

    res.json(updatedPost);
  } catch (err) {
    console.error('❌ [updatePost] Error:', err);
    res.status(500).json({ error: 'Failed to update post', details: err.message });
  }
}

// ---------------- Restore a single flagged/broken media file (admin) ----------------
// Re-uploads a replacement file (images to Cloudinary + R2 backup, videos
// straight to Cloudflare R2) and swaps it into the post's pictures/videos
// array at the given index, so a takedown of one asset doesn't require
// recreating the whole post.
export async function restorePostMedia(req, res) {
  try {
    const { id, mediaType, index } = req.params;
    if (!['pictures', 'videos'].includes(mediaType)) {
      return res.status(400).json({ error: "mediaType must be 'pictures' or 'videos'" });
    }

    const idx = Number(index);
    if (!Number.isInteger(idx) || idx < 0) {
      return res.status(400).json({ error: 'Invalid media index' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'A replacement file is required' });
    }

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const urls = post[mediaType] || [];
    if (idx >= urls.length) {
      return res.status(400).json({ error: 'Media index out of range' });
    }

    let primaryUrl;
    let backupUrl = '';

    if (mediaType === 'videos') {
      const uploaded = await uploadBackupCopy({
        buffer: req.file.buffer,
        folder: 'posts',
        userId: post.userId,
        originalName: req.file.originalname,
        contentType: req.file.mimetype,
      });
      if (!uploaded) {
        return res.status(500).json({ error: 'Video upload failed: Cloudflare storage is not configured' });
      }
      primaryUrl = uploaded.url;
    } else {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'posts', resource_type: 'auto' },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
      primaryUrl = uploadResult.secure_url;

      const backup = await uploadBackupCopy({
        buffer: req.file.buffer,
        folder: 'posts',
        userId: post.userId,
        originalName: req.file.originalname,
        contentType: req.file.mimetype,
      });
      backupUrl = backup?.url || '';
    }

    const backupField = mediaType === 'pictures' ? 'pictureBackups' : 'videoBackups';
    if (!Array.isArray(post[backupField])) post[backupField] = [];

    post[mediaType][idx] = primaryUrl;
    post[backupField][idx] = backupUrl;
    post.markModified(mediaType);
    post.markModified(backupField);

    await post.save();
    return res.json({ success: true, post });
  } catch (err) {
    console.error('❌ [restorePostMedia] Error:', err);
    return res.status(500).json({ error: 'Failed to restore media', details: err.message });
  }
}

// ---------------- Delete post ----------------
export async function deletePost(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('❌ [deletePost] Error:', err);
    res.status(500).json({ error: 'Failed to delete post', details: err.message });
  }
}

// ---------------- Get comments for a post ----------------
export async function getPostComments(req, res) {
  try {
    const { id: postId } = req.params;

    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comments = await Comment.find({ postId })
      .populate({ path: 'userId', select: 'username profilePic role' })
      .sort({ createdAt: -1 });

    return res.json(comments);
  } catch (err) {
    console.error('❌ [getPostComments] Error:', err);
    return res.status(500).json({ error: 'Failed to fetch comments', details: err.message });
  }
}

// ---------------- Create comment ----------------
export async function createPostComment(req, res) {
  try {
    const { id: postId } = req.params;
    const userId = req.user?._id;
    const text = String(req.body?.text || '').trim();
    const hasFiles = Boolean(req.files?.length);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!text && !hasFiles) {
      return res.status(400).json({ error: 'Comment text or an image is required' });
    }

    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    let attachments = [];
    try {
      attachments = await saveAttachments(req.files, { userId, folder: 'comments' });
    } catch (uploadErr) {
      return res.status(400).json({ error: uploadErr.message });
    }

    const created = await Comment.create({ postId, userId, text, attachments });
    const populated = await Comment.findById(created._id).populate({
      path: 'userId',
      select: 'username profilePic role',
    });

    // Notify the post owner (skip if they commented on their own post)
    const post = await Post.findById(postId).select('userId title').lean();
    if (post && String(post.userId) !== String(userId)) {
      awardCredits({ userId, eventKey: 'comment_post', refId: String(created._id) });

      const commenterName = populated.userId?.username || 'Someone';
      const commentPreview = `${text.slice(0, 80)}${text.length > 80 ? '…' : ''}` || 'sent an image';
      createNotification({
        audience: 'user',
        type: 'new_comment',
        title: 'New Comment on Your Post',
        message: `${commenterName} commented: "${commentPreview}"`,
        userId: post.userId,
        meta: { postId, commentId: created._id, commenterId: userId },
      }).catch(() => {});

      const owner = await User.findById(post.userId).select('email username status').lean();
      if (owner?.email && owner.status !== 'suspended') {
        sendAccountActivityEmail({
          to: owner.email,
          username: owner.username,
          type: 'new_comment',
          message: `${commenterName} commented on your post: "${commentPreview}"`,
          ctaUrl: `${env.CLIENT_URL}/posts/${postId}`,
        }).catch((err) => console.error('❌ New-comment email failed:', err.message));
      }
    }

    return res.status(201).json(populated);
  } catch (err) {
    console.error('❌ [createPostComment] Error:', err);
    return res.status(500).json({ error: 'Failed to create comment', details: err.message });
  }
}

// ---------------- Update comment ----------------
export async function updatePostComment(req, res) {
  try {
    const { id: postId, commentId } = req.params;
    const userId = req.user?._id;
    const text = String(req.body?.text || '').trim();

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const comment = await Comment.findOne({ _id: commentId, postId });
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const isOwner = String(comment.userId) === String(userId);
    const isAdmin = req.user?.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    comment.text = text;
    await comment.save();

    const populated = await Comment.findById(comment._id).populate({
      path: 'userId',
      select: 'username profilePic role',
    });

    return res.json(populated);
  } catch (err) {
    console.error('❌ [updatePostComment] Error:', err);
    return res.status(500).json({ error: 'Failed to update comment', details: err.message });
  }
}

// ---------------- Delete comment ----------------
export async function deletePostComment(req, res) {
  try {
    const { id: postId, commentId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const comment = await Comment.findOne({ _id: commentId, postId });
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const isOwner = String(comment.userId) === String(userId);
    const isAdmin = req.user?.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(comment._id);
    Promise.allSettled((comment.attachments || []).map((a) => deleteBackupCopy(a.key)));
    return res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('❌ [deletePostComment] Error:', err);
    return res.status(500).json({ error: 'Failed to delete comment', details: err.message });
  }
}
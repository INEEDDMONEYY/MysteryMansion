// backend/controllers/postController.js
import Post from '../../../models/Post.js';
import Comment from '../../../models/Comment.js';
import cloudinary from '../../../common/utils/cloudinary.js';
import streamifier from 'streamifier';
import { normalizeState } from '../../../common/utils/stateNormalizer.js';
import { createNotification } from '../../notifications/notificationController.js';

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
    const normalizedGender = ['female', 'male', 'ts'].includes(gender) ? gender : '';

    let imageUrls = [];
    let videoUrls = [];

    const uploadedFiles = Array.isArray(req.files)
      ? req.files
      : [
          ...(Array.isArray(req.files?.pictures) ? req.files.pictures : []),
          ...(Array.isArray(req.files?.videos) ? req.files.videos : []),
        ];

    // Upload files to Cloudinary and split by media type.
    if (uploadedFiles.length > 0) {
      const uploadPromises = uploadedFiles.map((file) =>
        new Promise((resolve, reject) => {
          const isVideo = file.mimetype?.startsWith('video/');
          const stream = cloudinary.uploader.upload_stream(
            { folder: 'posts', resource_type: 'auto' },
            (error, result) => {
              if (error) return reject(error);
              resolve({
                url: result.secure_url,
                type: isVideo ? 'video' : 'image',
              });
            }
          );
          streamifier.createReadStream(file.buffer).pipe(stream);
        })
      );

      const uploadedMedia = await Promise.all(uploadPromises);
      imageUrls = uploadedMedia.filter((m) => m.type === 'image').map((m) => m.url);
      videoUrls = uploadedMedia.filter((m) => m.type === 'video').map((m) => m.url);
      console.log('✅ Uploaded images to Cloudinary:', imageUrls);
      console.log('✅ Uploaded videos to Cloudinary:', videoUrls);
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
      isPromo: hasActivePromo,
      promoExpiresAt: hasActivePromo ? promoExpiry : null,
      // Set badgeType to match the user's badgeType (e.g., 'blue', 'pink', or '')
      badgeType: req.user.badgeType || '',
    });

    const savedPost = await newPost.save();

    const populatedPost = await Post.findById(savedPost._id).populate({
      path: 'userId',
      select: 'username email bio profilePic phoneNumber age availability incallPrice outcallPrice overnightPrice flyOutPrice gender activePromoExpiry createdAt',
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

    const stateSet = new Set();
    const citiesByState = {};

    for (const post of raw) {
      const st = (post.state || '').trim();
      if (!st) continue;
      stateSet.add(st);
      const cities = (post.city || '').split(',').map((c) => c.trim()).filter(Boolean);
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
    if (gender && ['female', 'male', 'ts'].includes(gender)) filter.gender = gender;

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate({ path: 'userId', select: 'username email bio profilePic phoneNumber age availability incallPrice outcallPrice overnightPrice flyOutPrice gender activePromoExpiry createdAt' });

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
      select: 'username email bio profilePic phoneNumber age availability incallPrice outcallPrice overnightPrice flyOutPrice gender activePromoExpiry createdAt',
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
      select: 'username email bio profilePic phoneNumber age availability incallPrice outcallPrice overnightPrice flyOutPrice gender activePromoExpiry',
    });

    res.json(updatedPost);
  } catch (err) {
    console.error('❌ [updatePost] Error:', err);
    res.status(500).json({ error: 'Failed to update post', details: err.message });
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

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!text) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const created = await Comment.create({ postId, userId, text });
    const populated = await Comment.findById(created._id).populate({
      path: 'userId',
      select: 'username profilePic role',
    });

    // Notify the post owner (skip if they commented on their own post)
    const post = await Post.findById(postId).select('userId title').lean();
    if (post && String(post.userId) !== String(userId)) {
      createNotification({
        audience: 'user',
        type: 'new_comment',
        title: 'New Comment on Your Post',
        message: `${populated.userId?.username || 'Someone'} commented: "${text.slice(0, 80)}${text.length > 80 ? '…' : ''}"`,
        userId: post.userId,
        meta: { postId, commentId: created._id, commenterId: userId },
      }).catch(() => {});
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
    return res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error('❌ [deletePostComment] Error:', err);
    return res.status(500).json({ error: 'Failed to delete comment', details: err.message });
  }
}
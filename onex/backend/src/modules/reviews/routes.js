import express from 'express';
import mongoose from 'mongoose';
import Review from '../../models/Review.js';
import User from '../../models/User.js';
import env from '../../config/env.js';
import { authMiddleware } from '../../common/middleware/authMiddleware.js';
import { createNotification } from '../notifications/notificationController.js';
import { sendAccountActivityEmail } from '../../common/utils/sendAccountActivityEmail.js';

const router = express.Router();

router.get('/:targetUserId', async (req, res) => {
  try {
    const { targetUserId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const targetUser = await User.findById(targetUserId).select('username');
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const reviews = await Review.find({ targetUserId })
      .sort({ createdAt: -1 })
      .populate({ path: 'authorUserId', select: 'username profilePic' });

    return res.json({
      targetUser: {
        id: targetUser._id,
        username: targetUser.username,
      },
      reviews,
    });
  } catch (err) {
    console.error('❌ [reviewRoutes] Failed to fetch reviews:', err);
    return res.status(500).json({ error: 'Failed to fetch reviews', details: err.message || err });
  }
});

router.post('/:targetUserId', authMiddleware, async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const text = String(req.body?.text || '').trim();
    const rating = Number(req.body?.rating);

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    if (!text) {
      return res.status(400).json({ error: 'Review text is required' });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'A star rating between 1 and 5 is required' });
    }

    const targetUser = await User.findById(targetUserId).select('_id');
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const review = await Review.create({
      targetUserId,
      authorUserId: req.user._id,
      text,
      rating,
    });

    const populatedReview = await Review.findById(review._id).populate({
      path: 'authorUserId',
      select: 'username profilePic',
    });

    // Notify the reviewed user (skip self-reviews)
    if (String(targetUserId) !== String(req.user._id)) {
      const authorName = populatedReview.authorUserId?.username || 'Someone';
      const reviewPreview = `${text.slice(0, 80)}${text.length > 80 ? '…' : ''}`;
      createNotification({
        audience: 'user',
        type: 'new_review',
        title: 'New Review on Your Profile',
        message: `${authorName} left you a review: "${reviewPreview}"`,
        userId: targetUserId,
        meta: { reviewId: review._id, authorId: req.user._id },
      }).catch(() => {});

      const owner = await User.findById(targetUserId).select('email username status').lean();
      if (owner?.email && owner.status !== 'suspended') {
        sendAccountActivityEmail({
          to: owner.email,
          username: owner.username,
          type: 'new_review',
          message: `${authorName} left you a review: "${reviewPreview}"`,
          ctaUrl: `${env.CLIENT_URL}/user/${targetUserId}`,
        }).catch((err) => console.error('❌ New-review email failed:', err.message));
      }
    }

    return res.status(201).json({ review: populatedReview });
  } catch (err) {
    console.error('❌ [reviewRoutes] Failed to create review:', err);
    return res.status(500).json({ error: 'Failed to post review', details: err.message || err });
  }
});

router.delete('/:targetUserId/:reviewId', authMiddleware, async (req, res) => {
  try {
    const { targetUserId, reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: 'Invalid review id' });
    }

    const review = await Review.findOne({ _id: reviewId, targetUserId });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const requesterId = String(req.user?._id || '');
    const isAuthor = String(review.authorUserId) === requesterId;
    const isAdmin = req.user?.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    await Review.deleteOne({ _id: review._id });

    return res.json({ message: 'Review deleted successfully', reviewId: String(review._id) });
  } catch (err) {
    console.error('❌ [reviewRoutes] Failed to delete review:', err);
    return res.status(500).json({ error: 'Failed to delete review', details: err.message || err });
  }
});

export default router;

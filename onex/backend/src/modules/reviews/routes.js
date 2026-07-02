import express from 'express';
import mongoose from 'mongoose';
import Review from '../../models/Review.js';
import User from '../../models/User.js';
import { authMiddleware } from '../../common/middleware/authMiddleware.js';
import { createNotification } from '../notifications/notificationController.js';

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

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    if (!text) {
      return res.status(400).json({ error: 'Review text is required' });
    }

    const targetUser = await User.findById(targetUserId).select('_id');
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const review = await Review.create({
      targetUserId,
      authorUserId: req.user._id,
      text,
    });

    const populatedReview = await Review.findById(review._id).populate({
      path: 'authorUserId',
      select: 'username profilePic',
    });

    // Notify the reviewed user (skip self-reviews)
    if (String(targetUserId) !== String(req.user._id)) {
      const authorName = populatedReview.authorUserId?.username || 'Someone';
      createNotification({
        audience: 'user',
        type: 'new_review',
        title: 'New Review on Your Profile',
        message: `${authorName} left you a review: "${text.slice(0, 80)}${text.length > 80 ? '…' : ''}"`,
        userId: targetUserId,
        meta: { reviewId: review._id, authorId: req.user._id },
      }).catch(() => {});
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
    const isTargetUser = String(review.targetUserId) === requesterId;

    if (!isAuthor && !isTargetUser) {
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

import express from 'express';
import { authMiddleware } from '../../common/middleware/authMiddleware.js';
import {
  getSavedPosts,
  createSavedPost,
  updateSavedPost,
  deleteSavedPost,
  publishSavedPost,
} from './savedPostController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/',           getSavedPosts);
router.post('/',          createSavedPost);
router.put('/:id',        updateSavedPost);
router.delete('/:id',     deleteSavedPost);
router.post('/:id/publish', publishSavedPost);

export default router;

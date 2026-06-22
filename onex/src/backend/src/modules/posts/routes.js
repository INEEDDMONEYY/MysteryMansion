// backend/routes/postRoutes.js
import express from 'express';
import multer from 'multer';
import * as postController from './controllers/postController.js';
import { authMiddleware } from '../../common/middleware/authMiddleware.js';
import { enforceRestriction } from '../../common/middleware/restrictionMiddleware.js';

const router = express.Router();

// Memory storage for multer
const storage = multer.memoryStorage();
const MAX_MEDIA_FILES = 10;
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB per file

const upload = multer({
  storage,
  limits: {
    files: MAX_MEDIA_FILES,
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (req, file, cb) => {
    const mime = String(file?.mimetype || "").toLowerCase();
    const isImage = mime.startsWith("image/");
    const isVideo = mime.startsWith("video/");

    if (!isImage && !isVideo) {
      return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file?.fieldname || "media"));
    }

    return cb(null, true);
  },
});

const uploadPostMedia = (req, res, next) => {
  const uploadHandler = upload.fields([
    { name: 'pictures', maxCount: 5 },
    { name: 'videos', maxCount: 5 },
  ]);

  uploadHandler(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          error: "Each media file must be 25MB or smaller.",
          code: err.code,
        });
      }

      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          error: "Too many files uploaded. Maximum is 10 total files.",
          code: err.code,
        });
      }

      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
          error: "Only image and video uploads are allowed, with up to 5 images and 5 videos.",
          code: err.code,
          field: err.field,
        });
      }

      return res.status(400).json({
        error: "Invalid upload payload.",
        code: err.code,
      });
    }

    return res.status(400).json({ error: err?.message || "Upload failed" });
  });
};

// Debug middleware to log headers and content-type
router.use('/', (req, res, next) => {
  console.log('🔹 [PostRoute Debug] Method:', req.method);
  console.log('🔹 [PostRoute Debug] Content-Type:', req.headers['content-type']);
  next();
});

// Create a new post
router.post(
  '/',
  authMiddleware,
  enforceRestriction('post:create'),
  uploadPostMedia,
  postController.createPost
);

// Get all posts
router.get('/', postController.getPosts);

// Comments for a post
router.get('/:id/comments', postController.getPostComments);
router.post('/:id/comments', authMiddleware, enforceRestriction('comment:create'), postController.createPostComment);
router.put('/:id/comments/:commentId', authMiddleware, enforceRestriction('comment:update'), postController.updatePostComment);
router.delete('/:id/comments/:commentId', authMiddleware, enforceRestriction('comment:delete'), postController.deletePostComment);

// Get single post
router.get('/:id', postController.getPostById);

// Update post
router.put('/:id', authMiddleware, enforceRestriction('post:update'), postController.updatePost);

// Delete post
router.delete('/:id', authMiddleware, enforceRestriction('post:delete'), postController.deletePost);

export default router;
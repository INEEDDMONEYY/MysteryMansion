// backend/routes/postRoutes.js
import express from 'express';
import multer from 'multer';
import * as postController from './controllers/postController.js';
import { toggleLike, getLikeStatus } from './controllers/postLikeController.js';
import { authMiddleware, optionalAuthMiddleware, adminOnlyMiddleware } from '../../common/middleware/authMiddleware.js';
import { enforceRestriction } from '../../common/middleware/restrictionMiddleware.js';
import { detectMediaKind } from './mediaKind.js';
import * as locationController from './controllers/locationController.js';
import { invalidateLocationIndex } from '../../common/utils/locationIndex.js';

const router = express.Router();

// Successful post writes refresh the cached location directory.
router.use((req, res, next) => {
  if (req.method !== 'GET') {
    res.on('finish', () => {
      if (res.statusCode < 400) invalidateLocationIndex();
    });
  }
  next();
});

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
    if (!detectMediaKind(file)) {
      return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file?.fieldname || "media"));
    }

    return cb(null, true);
  },
});

const uploadPostMedia = (req, res, next) => {
  const uploadHandler = upload.fields([
    // 'media' accepts photos and videos together; 'pictures'/'videos' kept for older clients.
    { name: 'media', maxCount: MAX_MEDIA_FILES },
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
          error: `Only photos and videos can be uploaded, up to ${MAX_MEDIA_FILES} files per post.`,
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

// Resolve the poster's city/state from device coordinates — must be before /:id
router.get('/resolve-location', authMiddleware, postController.resolveLocation);

// Get filter options (states + cities with actual posts) — must be before /:id
router.get('/filter-options', postController.getFilterOptions);

// Location pages (/locations, /locations/:slug) — must be before /:id
router.get('/locations', locationController.listLocations);
router.get('/locations/sitemap.xml', locationController.locationsSitemap);
router.get('/locations/:slug', locationController.getLocation);

// Get all posts
router.get('/', postController.getPosts);

// Comments for a post
router.get('/:id/comments', postController.getPostComments);
router.post('/:id/comments', authMiddleware, enforceRestriction('comment:create'), postController.createPostComment);
router.put('/:id/comments/:commentId', authMiddleware, enforceRestriction('comment:update'), postController.updatePostComment);
router.delete('/:id/comments/:commentId', authMiddleware, enforceRestriction('comment:delete'), postController.deletePostComment);

// Get single post
router.get('/:id', postController.getPostById);

// Boost a listing using the member's monthly boost allowance
router.post('/:id/boost', authMiddleware, postController.boostPost);

// Like / unlike a post (auth required) + get like status (optional auth)
router.post('/:id/like', authMiddleware, toggleLike);
router.get('/:id/like/status', optionalAuthMiddleware, getLikeStatus);

// Update post
router.put('/:id', authMiddleware, enforceRestriction('post:update'), postController.updatePost);

// Restore a single flagged/broken picture or video (admin only)
const uploadSingleMedia = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File must be 25MB or smaller.', code: err.code });
    }
    return res.status(400).json({ error: err?.message || 'Upload failed' });
  });
};
router.put(
  '/:id/media/:mediaType/:index',
  authMiddleware,
  adminOnlyMiddleware,
  uploadSingleMedia,
  postController.restorePostMedia
);

// Delete post
router.delete('/:id', authMiddleware, enforceRestriction('post:delete'), postController.deletePost);

export default router;
import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../../common/middleware/authMiddleware.js';
import cloudinary from '../../common/utils/cloudinary.js';
import {
  getSavedPosts,
  createSavedPost,
  updateSavedPost,
  deleteSavedPost,
  publishSavedPost,
} from './savedPostController.js';

const router = express.Router();

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 5, fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }
    cb(null, true);
  },
});

router.use(authMiddleware);

// POST /api/saved-posts/upload — upload images to Cloudinary, return URLs
router.post('/upload', imageUpload.array('images', 5), async (req, res) => {
  try {
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ error: 'No images provided.' });

    const uploadToCloud = (buffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'saved-posts', resource_type: 'image' },
          (err, result) => (err ? reject(err) : resolve(result.secure_url))
        );
        stream.end(buffer);
      });

    const urls = await Promise.all(files.map((f) => uploadToCloud(f.buffer)));
    res.json({ urls });
  } catch (err) {
    res.status(500).json({ error: err?.message || 'Image upload failed.' });
  }
});

router.get('/',           getSavedPosts);
router.post('/',          createSavedPost);
router.put('/:id',        updateSavedPost);
router.delete('/:id',     deleteSavedPost);
router.post('/:id/publish', publishSavedPost);

export default router;

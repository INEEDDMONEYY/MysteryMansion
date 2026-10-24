import multer from 'multer';
import { uploadBackupCopy } from './backupStorage.js';

export const MAX_ATTACHMENTS = 4;
export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

const EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

// Detects the real type from the file header; the client-sent mimetype is not trusted.
function sniffImageType(buffer) {
  if (!buffer || buffer.length < 12) return null;
  const head = buffer.subarray(0, 12);
  const ascii = (start, end) => head.subarray(start, end).toString('ascii');

  if (ascii(0, 6) === 'GIF87a' || ascii(0, 6) === 'GIF89a') return 'image/gif';
  if (head[0] === 0x89 && ascii(1, 4) === 'PNG') return 'image/png';
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'image/jpeg';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'image/webp';
  return null;
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_ATTACHMENT_BYTES, files: MAX_ATTACHMENTS },
});

/** Accepts multipart "images" files; passes through untouched for JSON requests. */
export const attachmentUpload = (req, res, next) => {
  upload.array('images', MAX_ATTACHMENTS)(req, res, (err) => {
    if (!err) return next();

    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? `Each image must be under ${MAX_ATTACHMENT_BYTES / (1024 * 1024)} MB.`
        : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE'
          ? `You can attach up to ${MAX_ATTACHMENTS} images.`
          : 'Upload failed.';
    return res.status(400).json({ error: message });
  });
};

/**
 * Validates and stores uploaded files, returning attachment records.
 * Throws an Error with a user-facing message when a file is rejected.
 */
export async function saveAttachments(files = [], { userId, folder }) {
  const saved = [];

  for (const file of files) {
    const mimeType = sniffImageType(file.buffer);
    if (!mimeType) throw new Error('Only JPG, PNG, WebP and GIF images are allowed.');

    const stored = await uploadBackupCopy({
      buffer: file.buffer,
      folder,
      userId,
      originalName: `upload.${EXTENSIONS[mimeType]}`,
      contentType: mimeType,
    });
    if (!stored) throw new Error('Image uploads are unavailable right now. Please try again later.');

    saved.push({
      url: stored.url,
      key: stored.key,
      kind: mimeType === 'image/gif' ? 'gif' : 'image',
      mimeType,
      size: file.size,
    });
  }

  return saved;
}

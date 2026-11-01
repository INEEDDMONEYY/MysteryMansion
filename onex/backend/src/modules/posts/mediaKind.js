const IMAGE_EXT = /\.(jpe?g|png|gif|webp|heic|heif|avif|bmp)$/i;
const VIDEO_EXT = /\.(mp4|mov|m4v|webm|3gp|3g2|mkv|avi|qt)$/i;

// Some phones send media with an empty or generic MIME type, so fall back to
// the file extension when classifying uploads.
export const detectMediaKind = (file) => {
  const mime = String(file?.mimetype || '').toLowerCase();
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  const name = String(file?.originalname || '');
  if (IMAGE_EXT.test(name)) return 'image';
  if (VIDEO_EXT.test(name)) return 'video';
  return null;
};

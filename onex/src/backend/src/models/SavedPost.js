import mongoose from 'mongoose';

const SavedPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 5000 },
    categories: {
      type: [{ type: String, trim: true }],
      default: ['uncategorized'],
    },
    pictures: [{ type: String }], // Cloudinary / hosted URLs
    city:       { type: String, default: '' },
    state:      { type: String, default: '' },
    country:    { type: String, default: '' },
    visibility: {
      type: String,
      enum: ['Men', 'Women', 'Both'],
      default: 'Both',
    },
  },
  { timestamps: true }
);

export default mongoose.model('SavedPost', SavedPostSchema);

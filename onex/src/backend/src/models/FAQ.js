import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {
    question:  { type: String, required: true, trim: true },
    answer:    { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

faqSchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.models.FAQ || mongoose.model('FAQ', faqSchema);

import mongoose from 'mongoose';

// Keep in sync with inquiryOptions in src/features/admin/pages/ContactPage.jsx.
export const CONTACT_TOPICS = [
  'Membership/Account Help',
  'Report a Bug',
  'Advertisement',
  'General Questions/Concerns',
  'Legal Inquiry',
];

export const CONTACT_STATUSES = ['new', 'in_progress', 'resolved'];

const contactInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    topic: { type: String, required: true, enum: CONTACT_TOPICS },
    subject: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    // Set when the sender was signed in.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    status: { type: String, enum: CONTACT_STATUSES, default: 'new', index: true },
    adminNotes: { type: String, trim: true, maxlength: 5000, default: '' },
    resolvedAt: { type: Date, default: null },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

contactInquirySchema.index({ status: 1, createdAt: -1 });
contactInquirySchema.index({ topic: 1, createdAt: -1 });

export default mongoose.models.ContactInquiry ||
  mongoose.model('ContactInquiry', contactInquirySchema);

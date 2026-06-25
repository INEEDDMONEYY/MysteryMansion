import FAQ from '../../models/FAQ.js';

const DEFAULT_FAQS = [
  {
    question: 'How do I create my first post?',
    answer: 'Sign in, click Post, complete your details, add at least one image or video, and submit. Your post will appear in the feed based on your selected categories and location.',
    sortOrder: 1,
    isActive: true,
  },
  {
    question: 'Do I need an account to comment?',
    answer: 'Yes. You must be signed in to add comments. Signed-in users can edit or delete their own comments.',
    sortOrder: 2,
    isActive: true,
  },
  {
    question: 'How does promoted status work?',
    answer: 'Promoted status gives additional visibility on the platform for a limited time. When active, your account can appear in the promoted section and include promotion indicators.',
    sortOrder: 3,
    isActive: true,
  },
  {
    question: 'How can I contact support?',
    answer: 'Use the in-app messaging feature to contact the admin/support team. For urgent policy concerns, report details clearly so the team can review quickly.',
    sortOrder: 4,
    isActive: true,
  },
  {
    question: 'Can I update or remove my content later?',
    answer: 'Yes. You can manage your own posts and account details from your dashboard settings. Admin moderation tools may also remove content that violates policies.',
    sortOrder: 5,
    isActive: true,
  },
  {
    question: 'What we do with your data?',
    answer: 'We respect your privacy. We do not sell, share, or distribute your photos, email, or any personal information to other platforms or third parties. Your information is securely stored and protected at all times using industry-standard safeguards.',
    sortOrder: 6,
    isActive: true,
  },
  {
    question: 'Is this a sister company of other platforms?',
    answer: 'No. We do not participate in the operations or business dealings of any other company or platform. Mystery Mansion is owned and monitored solely by Fantome Technologies. Any partner logos displayed in the footer represent partnerships or affiliations only and do not indicate shared ownership.',
    sortOrder: 7,
    isActive: true,
  },
];

/**
 * Seeds the FAQ collection with default items if it is empty.
 * Runs once at startup — safe to call multiple times.
 */
export async function seedDefaultFAQs() {
  try {
    const count = await FAQ.countDocuments();
    if (count > 0) return; // already seeded
    await FAQ.insertMany(DEFAULT_FAQS);
    console.log(`✅ FAQ collection seeded with ${DEFAULT_FAQS.length} default items`);
  } catch (err) {
    console.error('❌ FAQ seed failed:', err.message);
  }
}

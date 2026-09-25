import express from 'express';
import User from '../../models/User.js';
import Post from '../../models/Post.js';
import Review from '../../models/Review.js';
import Banner from '../../models/Banner.js';
import SiteDiscount from '../../models/SiteDiscount.js';
import PromoCode from '../../models/PromoCode.js';
import CreditRequest from '../../models/CreditRequest.js';
import CreditPackage from '../../models/CreditPackage.js';
import FAQ from '../../models/FAQ.js';
import Category from '../../models/Category.js';

const router = express.Router();

const RESULT_LIMIT = 5;

// Escapes regex metacharacters so user input can't be used to build an unintended pattern.
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function snippet(text = '', length = 80) {
  const clean = String(text || '').trim();
  return clean.length > length ? `${clean.slice(0, length)}…` : clean;
}

// GET /api/admin/search?q=term — global search across admin-manageable content
router.get('/', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    if (q.length < 2) return res.json({ query: q, results: [] });

    const rx = new RegExp(escapeRegex(q), 'i');

    const [users, posts, reviews, banners, discounts, promoCodes, creditRequests, creditPackages, faqs, categories] =
      await Promise.all([
        User.find({ $or: [{ username: rx }, { email: rx }] })
          .select('username email accountType')
          .limit(RESULT_LIMIT)
          .lean(),
        Post.find({ $or: [{ title: rx }, { description: rx }] })
          .select('title description userId')
          .populate({ path: 'userId', select: 'username' })
          .limit(RESULT_LIMIT)
          .lean(),
        Review.find({ text: rx })
          .select('text targetUserId authorUserId')
          .populate({ path: 'authorUserId', select: 'username' })
          .limit(RESULT_LIMIT)
          .lean(),
        Banner.find({ $or: [{ title: rx }, { message: rx }] })
          .select('title message')
          .limit(RESULT_LIMIT)
          .lean(),
        SiteDiscount.find({ label: rx }).select('label discountPercent').limit(RESULT_LIMIT).lean(),
        PromoCode.find({ code: rx }).select('code durationDays').limit(RESULT_LIMIT).lean(),
        CreditRequest.find({ $or: [{ note: rx }, { adminNote: rx }] })
          .select('note amount status userId')
          .populate({ path: 'userId', select: 'username' })
          .limit(RESULT_LIMIT)
          .lean(),
        CreditPackage.find({ $or: [{ name: rx }, { description: rx }] })
          .select('name description credits')
          .limit(RESULT_LIMIT)
          .lean(),
        FAQ.find({ $or: [{ question: rx }, { answer: rx }] }).select('question answer').limit(RESULT_LIMIT).lean(),
        Category.find({ name: rx }).select('name').limit(RESULT_LIMIT).lean(),
      ]);

    const results = [
      ...users.map((u) => ({
        type: 'user',
        id: String(u._id),
        label: u.username,
        sublabel: u.email || u.accountType || '',
        path: `/profile/${u.username}`,
      })),
      ...posts.map((p) => ({
        type: 'post',
        id: String(p._id),
        label: p.title || 'Untitled post',
        sublabel: p.userId?.username ? `by @${p.userId.username}` : snippet(p.description),
        path: `/posts/${p._id}`,
      })),
      ...reviews.map((r) => ({
        type: 'review',
        id: String(r._id),
        label: snippet(r.text, 60),
        sublabel: r.authorUserId?.username ? `by @${r.authorUserId.username}` : 'Review',
        path: `/user/${r.targetUserId}`,
      })),
      ...banners.map((b) => ({
        type: 'banner',
        id: String(b._id),
        label: b.title,
        sublabel: snippet(b.message, 60),
        path: '/admin/banners',
      })),
      ...discounts.map((d) => ({
        type: 'discount',
        id: String(d._id),
        label: d.label,
        sublabel: `${d.discountPercent}% off`,
        path: '/admin/discounts',
      })),
      ...promoCodes.map((pc) => ({
        type: 'promoCode',
        id: String(pc._id),
        label: pc.code,
        sublabel: `${pc.durationDays} day${pc.durationDays === 1 ? '' : 's'}`,
        path: '/admin/users',
      })),
      ...creditRequests.map((cr) => ({
        type: 'creditRequest',
        id: String(cr._id),
        label: `$${cr.amount} credits${cr.userId?.username ? ` — @${cr.userId.username}` : ''}`,
        sublabel: cr.status,
        path: '/admin/credit-requests',
      })),
      ...creditPackages.map((cp) => ({
        type: 'creditPackage',
        id: String(cp._id),
        label: cp.name,
        sublabel: `${cp.credits} credits`,
        path: '/admin/credit-packages',
      })),
      ...faqs.map((f) => ({
        type: 'faq',
        id: String(f._id),
        label: f.question,
        sublabel: snippet(f.answer, 60),
        path: '/admin/faqs',
      })),
      ...categories.map((c) => ({
        type: 'category',
        id: String(c._id),
        label: c.name,
        sublabel: '',
        path: '/admin/categories',
      })),
    ];

    res.json({ query: q, results });
  } catch (err) {
    console.error('❌ GET /admin/search:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;

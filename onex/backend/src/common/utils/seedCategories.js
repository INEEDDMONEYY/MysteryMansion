import Category from '../../models/Category.js';

const DEFAULT_CATEGORIES = [
  'Restrictions 🚫',
  'Only AA 🔥',
  'Baddies 💝',
  'Latinas ❤️‍🔥',
  'BBW ⛱️',
  'Asians 🌏',
  'LGBQT+ 🌈',
  'Party N Play ❄️',
  '40+ 🔞',
  'MILF 💅',
  'Request Pickup/Dropoff 💳',
  'Car Dates 🚘',
  'No AA ❌',
  'GFE 💋',
  'Mature 💦',
  'BDSM 👣',
  '24/7 ☀️',
];

export async function seedDefaultCategories() {
  try {
    const count = await Category.countDocuments();
    if (count > 0) return; // already seeded — don't overwrite admin changes

    await Category.insertMany(
      DEFAULT_CATEGORIES.map((name, i) => ({ name, sortOrder: i, isActive: true }))
    );
    console.log(`✅ Seeded ${DEFAULT_CATEGORIES.length} default categories.`);
  } catch (err) {
    console.warn('⚠️ Category seed failed (non-fatal):', err.message);
  }
}

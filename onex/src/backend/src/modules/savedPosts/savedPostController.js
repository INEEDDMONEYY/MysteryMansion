import SavedPost from '../../models/SavedPost.js';
import Post from '../../models/Post.js';

// GET /api/saved-posts
export async function getSavedPosts(req, res) {
  try {
    const posts = await SavedPost.find({ userId: req.user.id })
      .sort({ updatedAt: -1 })
      .lean();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved posts.' });
  }
}

// POST /api/saved-posts
export async function createSavedPost(req, res) {
  try {
    const { title, description, categories, pictures, city, state, country, visibility } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Title is required.' });
    }

    const saved = await SavedPost.create({
      userId: req.user.id,
      title: title.trim(),
      description: description || '',
      categories: Array.isArray(categories) && categories.length ? categories : ['uncategorized'],
      pictures: Array.isArray(pictures) ? pictures.filter(Boolean) : [],
      city: city || '',
      state: state || '',
      country: country || '',
      visibility: visibility || 'Both',
    });

    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create saved post.' });
  }
}

// PUT /api/saved-posts/:id
export async function updateSavedPost(req, res) {
  try {
    const saved = await SavedPost.findOne({ _id: req.params.id, userId: req.user.id });
    if (!saved) return res.status(404).json({ error: 'Saved post not found.' });

    const { title, description, categories, pictures, city, state, country, visibility } = req.body;

    if (title !== undefined) saved.title = title.trim();
    if (description !== undefined) saved.description = description;
    if (Array.isArray(categories)) saved.categories = categories.length ? categories : ['uncategorized'];
    if (Array.isArray(pictures)) saved.pictures = pictures.filter(Boolean);
    if (city !== undefined) saved.city = city;
    if (state !== undefined) saved.state = state;
    if (country !== undefined) saved.country = country;
    if (visibility !== undefined) saved.visibility = visibility;

    await saved.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update saved post.' });
  }
}

// DELETE /api/saved-posts/:id
export async function deleteSavedPost(req, res) {
  try {
    const result = await SavedPost.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!result) return res.status(404).json({ error: 'Saved post not found.' });
    res.json({ message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete saved post.' });
  }
}

// POST /api/saved-posts/:id/publish
// Creates a real Post from the saved template
export async function publishSavedPost(req, res) {
  try {
    const saved = await SavedPost.findOne({ _id: req.params.id, userId: req.user.id });
    if (!saved) return res.status(404).json({ error: 'Saved post not found.' });

    const post = await Post.create({
      userId: req.user.id,
      title: saved.title,
      description: saved.description,
      categories: saved.categories,
      pictures: saved.pictures,
      city: saved.city,
      state: saved.state,
      country: saved.country,
      visibility: saved.visibility,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish post.' });
  }
}

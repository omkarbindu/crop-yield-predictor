const express = require('express');
const CommunityPost = require('../models/CommunityPost');
const Farmer = require('../models/Farmer');
const auth = require('../middleware/auth');
const router = express.Router();

const SAMPLE_POSTS = [
  {
    authorName: 'Rajesh Patidar',
    category: 'tip',
    title: 'Best time to irrigate wheat to save water',
    body: 'I switched to irrigating wheat early morning instead of afternoon. Saved almost 20% water and the crop looks healthier. Try it during the tillering stage.',
    likes: 12,
    email: 'rajesh.grain@farmdirect.in'
  },
  {
    authorName: 'Priya Jadhav',
    category: 'question',
    title: 'Yellow spots on jowar leaves — what is this?',
    body: 'My sorghum leaves are getting yellow spots after recent rain. Is this a fungal disease? What spray should I use? Has anyone faced this in Solapur region?',
    likes: 5,
    email: 'priya.sorghum@farmdirect.in'
  },
  {
    authorName: 'Mohan Singh',
    category: 'success',
    title: 'Sold 600 quintals wheat directly via Grain Direct',
    body: 'Used the marketplace to connect with a flour mill buyer. No broker, got ₹120 more per quintal than mandi. Direct selling really works for long-storage grains!',
    likes: 28,
    email: 'mohan.wheat@farmdirect.in'
  },
  {
    authorName: 'Anil Deshmukh',
    category: 'alert',
    title: 'Fall armyworm seen in maize near Nashik',
    body: 'Spotted fall armyworm in my maize field. Fellow farmers in Nashik, please scout your fields early. Acting fast with neem-based spray helped me control it.',
    likes: 17,
    email: 'anil.maize@farmdirect.in'
  }
];

async function ensureSamplePosts() {
  const count = await CommunityPost.countDocuments();
  if (count > 0) return;
  for (const p of SAMPLE_POSTS) {
    const farmer = await Farmer.findOne({ email: p.email });
    await CommunityPost.create({
      author: farmer?._id,
      authorName: p.authorName,
      category: p.category,
      title: p.title,
      body: p.body,
      likes: p.likes
    });
  }
}

router.get('/posts', auth, async (req, res) => {
  try {
    await ensureSamplePosts();
    const { category } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    const posts = await CommunityPost.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ posts });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load posts.' });
  }
});

router.post('/posts', auth, async (req, res) => {
  try {
    const { title, body, category } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: 'Title and body are required.' });
    }
    const post = await CommunityPost.create({
      author: req.farmer._id,
      authorName: req.farmer.name,
      title,
      body,
      category: ['question', 'tip', 'success', 'alert'].includes(category) ? category : 'question'
    });
    res.status(201).json({ post });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to create post.' });
  }
});

router.post('/posts/:id/like', auth, async (req, res) => {
  try {
    const post = await CommunityPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    res.json({ post });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Like failed.' });
  }
});

router.post('/posts/:id/reply', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Reply text is required.' });
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found.' });
    post.replies.push({
      author: req.farmer._id,
      authorName: req.farmer.name,
      text
    });
    await post.save();
    res.status(201).json({ post });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Reply failed.' });
  }
});

module.exports = router;

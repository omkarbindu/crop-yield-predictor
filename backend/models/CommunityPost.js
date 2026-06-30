const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  authorName: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const communityPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  authorName: { type: String, required: true },
  category: {
    type: String,
    enum: ['question', 'tip', 'success', 'alert'],
    default: 'question'
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  likes: { type: Number, default: 0 },
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now }
});

communityPostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);

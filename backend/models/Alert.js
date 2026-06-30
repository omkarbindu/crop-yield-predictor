const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  type: {
    type: String,
    enum: ['weather', 'irrigation', 'mandi', 'calendar'],
    required: true,
  },
  title: { type: String, required: true },
  title_hi: { type: String, default: '' },
  message: { type: String, required: true },
  message_hi: { type: String, default: '' },
  read: { type: Boolean, default: false },
  dedupeKey: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

alertSchema.index({ farmer: 1, dedupeKey: 1 }, { unique: true });
alertSchema.index({ farmer: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);

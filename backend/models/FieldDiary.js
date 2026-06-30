const mongoose = require('mongoose');

const fieldDiarySchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  date: { type: Date, required: true },
  note: { type: String, required: true },
  crop: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

fieldDiarySchema.index({ farmer: 1, date: -1 });

module.exports = mongoose.model('FieldDiary', fieldDiarySchema);

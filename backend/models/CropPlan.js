const mongoose = require('mongoose');

const cropPlanSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  crop: { type: String, required: true },
  sowingDate: { type: Date, required: true },
  areaAcres: { type: Number, default: 1 },
  updatedAt: { type: Date, default: Date.now },
});

cropPlanSchema.index({ farmer: 1 }, { unique: true });

module.exports = mongoose.model('CropPlan', cropPlanSchema);

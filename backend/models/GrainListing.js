const mongoose = require('mongoose');

const grainListingSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  grainType: { type: String, required: true },
  quantityQuintals: { type: Number, required: true },
  pricePerQuintal: { type: Number, required: true },
  storageMonths: { type: Number, required: true },
  harvestYear: { type: Number, default: () => new Date().getFullYear() },
  description: { type: String, default: '' },
  grainImage: { type: String, default: '' },
  farmerPhoto: { type: String, default: '' },
  location: { type: String, default: '' },
  status: { type: String, enum: ['available', 'reserved', 'sold'], default: 'available' },
  createdAt: { type: Date, default: Date.now }
});

grainListingSchema.index({ grainType: 1, status: 1 });

module.exports = mongoose.model('GrainListing', grainListingSchema);

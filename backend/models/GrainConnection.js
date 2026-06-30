const mongoose = require('mongoose');

const grainConnectionSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'GrainListing', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  buyerName: { type: String, required: true },
  buyerPhone: { type: String, required: true },
  quantityNeeded: { type: Number, required: true },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GrainConnection', grainConnectionSchema);

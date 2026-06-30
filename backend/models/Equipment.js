const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  ownerName: { type: String, required: true },
  ownerPhone: { type: String, default: '' },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ['Tractor', 'Harvester', 'Tiller', 'Sprayer', 'Seeder', 'Thresher', 'Other'],
    default: 'Tractor'
  },
  pricePerDay: { type: Number, required: true },
  location: { type: String, default: '' },
  image: { type: String, default: '' },
  description: { type: String, default: '' },
  available: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const equipmentBookingSchema = new mongoose.Schema({
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  renter: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  renterName: { type: String, required: true },
  renterPhone: { type: String, required: true },
  days: { type: Number, required: true },
  fromDate: { type: String, default: '' },
  status: { type: String, enum: ['requested', 'confirmed', 'rejected'], default: 'requested' },
  createdAt: { type: Date, default: Date.now }
});

const Equipment = mongoose.model('Equipment', equipmentSchema);
const EquipmentBooking = mongoose.model('EquipmentBooking', equipmentBookingSchema);

module.exports = { Equipment, EquipmentBooking };

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const locationSchema = new mongoose.Schema({
  type: { type: String, default: 'Point' },
  coordinates: { type: [Number], required: true }, // [lng, lat] GeoJSON
  address: { type: String, default: '' },
  placeId: { type: String, default: '' }
}, { _id: false });

const gisDataSchema = new mongoose.Schema({
  latitude: { type: Number },
  longitude: { type: Number },
  accuracy: { type: Number },
  altitude: { type: Number },
  altitudeAccuracy: { type: Number },
  heading: { type: Number },
  speed: { type: Number },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  location: { type: locationSchema },
  gisData: { type: gisDataSchema },
  createdAt: { type: Date, default: Date.now }
});

farmerSchema.index({ 'location.coordinates': '2dsphere' });

farmerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

farmerSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Farmer', farmerSchema);

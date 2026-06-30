const express = require('express');
const GrainListing = require('../models/GrainListing');
const GrainConnection = require('../models/GrainConnection');
const Farmer = require('../models/Farmer');
const auth = require('../middleware/auth');
const router = express.Router();

const SAMPLE_LISTINGS = [
  {
    grainType: 'Wheat',
    quantityQuintals: 500,
    pricePerQuintal: 2450,
    storageMonths: 18,
    description: 'Premium Sharbati wheat, sun-dried and stored in moisture-controlled silos. Perfect for flour mills and bulk buyers.',
    grainImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
    farmerPhoto: 'https://images.unsplash.com/photo-1560493676-04071c5f467d?w=200&q=80',
    location: 'Indore, Madhya Pradesh',
    farmerData: { name: 'Rajesh Patidar', email: 'rajesh.grain@farmdirect.in', phone: '9876543210' }
  },
  {
    grainType: 'Rice',
    quantityQuintals: 320,
    pricePerQuintal: 3200,
    storageMonths: 24,
    description: 'Basmati rice aged 12 months. Long grain, aromatic — ideal for export and premium retail.',
    grainImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&q=80',
    farmerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    location: 'Karnal, Haryana',
    farmerData: { name: 'Suresh Kumar', email: 'suresh.rice@farmdirect.in', phone: '9876543211' }
  },
  {
    grainType: 'Maize',
    quantityQuintals: 800,
    pricePerQuintal: 1950,
    storageMonths: 12,
    description: 'Yellow maize with 14% moisture. Stored in ventilated godowns — great for poultry feed and starch units.',
    grainImage: 'https://images.unsplash.com/photo-1551752496-ee70b504fafd?w=600&q=80',
    farmerPhoto: 'https://images.unsplash.com/photo-1595273670150-0b3e028024de?w=200&q=80',
    location: 'Nashik, Maharashtra',
    farmerData: { name: 'Anil Deshmukh', email: 'anil.maize@farmdirect.in', phone: '9876543212' }
  },
  {
    grainType: 'Sorghum',
    quantityQuintals: 200,
    pricePerQuintal: 2800,
    storageMonths: 20,
    description: 'Organic jowar, pesticide-free. High protein content — popular with health food brands.',
    grainImage: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80',
    farmerPhoto: 'https://images.unsplash.com/photo-1583391733667-4615eb44b95f?w=200&q=80',
    location: 'Solapur, Maharashtra',
    farmerData: { name: 'Priya Jadhav', email: 'priya.sorghum@farmdirect.in', phone: '9876543213' }
  },
  {
    grainType: 'Soybeans',
    quantityQuintals: 150,
    pricePerQuintal: 4100,
    storageMonths: 15,
    description: 'Non-GMO soybeans, oil content 18%+. Direct from cooperative farm — no broker markup.',
    grainImage: 'https://images.unsplash.com/photo-1595853035070-59a39b84de76?w=600&q=80',
    farmerPhoto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&q=80',
    location: 'Latur, Maharashtra',
    farmerData: { name: 'Vikram More', email: 'vikram.soy@farmdirect.in', phone: '9876543214' }
  },
  {
    grainType: 'Wheat',
    quantityQuintals: 600,
    pricePerQuintal: 2380,
    storageMonths: 16,
    description: 'Lokwan wheat variety. Bulk orders welcome. Free sample 5 kg for serious buyers.',
    grainImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80',
    farmerPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    location: 'Bhopal, Madhya Pradesh',
    farmerData: { name: 'Mohan Singh', email: 'mohan.wheat@farmdirect.in', phone: '9876543215' }
  }
];

async function ensureSampleListings() {
  const count = await GrainListing.countDocuments();
  if (count > 0) return;

  for (const sample of SAMPLE_LISTINGS) {
    let farmer = await Farmer.findOne({ email: sample.farmerData.email });
    if (!farmer) {
      farmer = await Farmer.create({
        name: sample.farmerData.name,
        email: sample.farmerData.email,
        phone: sample.farmerData.phone,
        password: 'sample1234'
      });
    }
    await GrainListing.create({
      farmer: farmer._id,
      grainType: sample.grainType,
      quantityQuintals: sample.quantityQuintals,
      pricePerQuintal: sample.pricePerQuintal,
      storageMonths: sample.storageMonths,
      description: sample.description,
      grainImage: sample.grainImage,
      farmerPhoto: sample.farmerPhoto,
      location: sample.location
    });
  }
}

router.get('/listings', auth, async (req, res) => {
  try {
    await ensureSampleListings();
    const { grainType, search } = req.query;
    const filter = { status: 'available' };
    if (grainType && grainType !== 'all') filter.grainType = grainType;
    if (search) {
      filter.$or = [
        { grainType: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    const listings = await GrainListing.find(filter)
      .populate('farmer', 'name phone location')
      .sort({ createdAt: -1 });
    res.json({ listings });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load listings.' });
  }
});

router.get('/listings/mine', auth, async (req, res) => {
  try {
    const listings = await GrainListing.find({ farmer: req.farmer._id })
      .sort({ createdAt: -1 });
    res.json({ listings });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load your listings.' });
  }
});

router.post('/listings', auth, async (req, res) => {
  try {
    const {
      grainType, quantityQuintals, pricePerQuintal, storageMonths,
      description, grainImage, farmerPhoto, location
    } = req.body;
    if (!grainType || !quantityQuintals || !pricePerQuintal || !storageMonths) {
      return res.status(400).json({
        error: 'Required: grainType, quantityQuintals, pricePerQuintal, storageMonths'
      });
    }
    const listing = await GrainListing.create({
      farmer: req.farmer._id,
      grainType,
      quantityQuintals: Number(quantityQuintals),
      pricePerQuintal: Number(pricePerQuintal),
      storageMonths: Number(storageMonths),
      description: description || '',
      grainImage: grainImage || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
      farmerPhoto: farmerPhoto || 'https://images.unsplash.com/photo-1560493676-04071c5f467d?w=200&q=80',
      location: location || req.farmer.location?.address || 'India'
    });
    const populated = await GrainListing.findById(listing._id).populate('farmer', 'name phone');
    res.status(201).json({ listing: populated });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to create listing.' });
  }
});

router.delete('/listings/:id', auth, async (req, res) => {
  try {
    const listing = await GrainListing.findOne({ _id: req.params.id, farmer: req.farmer._id });
    if (!listing) return res.status(404).json({ error: 'Listing not found.' });
    await GrainListing.deleteOne({ _id: listing._id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to delete listing.' });
  }
});

router.post('/connect', auth, async (req, res) => {
  try {
    const { listingId, quantityNeeded, message } = req.body;
    if (!listingId || !quantityNeeded) {
      return res.status(400).json({ error: 'Required: listingId, quantityNeeded' });
    }
    const listing = await GrainListing.findById(listingId).populate('farmer', 'name phone');
    if (!listing || listing.status !== 'available') {
      return res.status(404).json({ error: 'Listing not available.' });
    }
    if (listing.farmer._id.toString() === req.farmer._id.toString()) {
      return res.status(400).json({ error: 'You cannot connect to your own listing.' });
    }
    const connection = await GrainConnection.create({
      listing: listingId,
      buyer: req.farmer._id,
      buyerName: req.farmer.name,
      buyerPhone: req.farmer.phone,
      quantityNeeded: Number(quantityNeeded),
      message: message || ''
    });
    const populated = await GrainConnection.findById(connection._id)
      .populate({ path: 'listing', populate: { path: 'farmer', select: 'name phone' } })
      .populate('buyer', 'name phone email');
    res.status(201).json({
      connection: populated,
      farmer: listing.farmer
    });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Connection failed.' });
  }
});

router.get('/connections/mine', auth, async (req, res) => {
  try {
    const connections = await GrainConnection.find({ buyer: req.farmer._id })
      .populate({ path: 'listing', populate: { path: 'farmer', select: 'name phone farmerPhoto' } })
      .sort({ createdAt: -1 });
    res.json({ connections });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load connections.' });
  }
});

router.get('/connections/incoming', auth, async (req, res) => {
  try {
    const myListings = await GrainListing.find({ farmer: req.farmer._id }).select('_id');
    const listingIds = myListings.map((l) => l._id);
    const connections = await GrainConnection.find({ listing: { $in: listingIds } })
      .populate('buyer', 'name phone email')
      .populate('listing', 'grainType quantityQuintals pricePerQuintal location grainImage')
      .sort({ createdAt: -1 });
    res.json({ connections });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load incoming requests.' });
  }
});

router.patch('/connections/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    const connection = await GrainConnection.findById(req.params.id).populate('listing');
    if (!connection) return res.status(404).json({ error: 'Connection not found.' });
    if (connection.listing.farmer.toString() !== req.farmer._id.toString()) {
      return res.status(403).json({ error: 'Not authorized.' });
    }
    connection.status = status;
    connection.updatedAt = new Date();
    await connection.save();
    if (status === 'accepted') {
      await GrainListing.findByIdAndUpdate(connection.listing._id, { status: 'reserved' });
    }
    res.json({ connection });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Update failed.' });
  }
});

module.exports = router;

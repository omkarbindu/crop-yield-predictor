const express = require('express');
const { Equipment, EquipmentBooking } = require('../models/Equipment');
const Farmer = require('../models/Farmer');
const auth = require('../middleware/auth');
const router = express.Router();

const SAMPLE_EQUIPMENT = [
  {
    name: 'Mahindra 575 DI Tractor',
    type: 'Tractor',
    pricePerDay: 1800,
    location: 'Indore, MP',
    image: 'https://images.unsplash.com/photo-1605338803155-8b46c2c8f6f5?w=600&q=80',
    description: '45 HP tractor, ideal for ploughing and haulage. Diesel included for half day.',
    email: 'rajesh.grain@farmdirect.in'
  },
  {
    name: 'John Deere Combine Harvester',
    type: 'Harvester',
    pricePerDay: 6500,
    location: 'Karnal, HR',
    image: 'https://images.unsplash.com/photo-1591086862479-3b4d4f5e1d5e?w=600&q=80',
    description: 'Self-propelled combine harvester for wheat and rice. Operator provided.',
    email: 'suresh.rice@farmdirect.in'
  },
  {
    name: 'Power Tiller (Rotavator)',
    type: 'Tiller',
    pricePerDay: 900,
    location: 'Nashik, MH',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&q=80',
    description: 'Compact power tiller for small plots and vegetable beds.',
    email: 'anil.maize@farmdirect.in'
  },
  {
    name: 'Boom Sprayer (Tractor mounted)',
    type: 'Sprayer',
    pricePerDay: 700,
    location: 'Solapur, MH',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&q=80',
    description: '500L tank boom sprayer for uniform pesticide application.',
    email: 'priya.sorghum@farmdirect.in'
  }
];

async function ensureSampleEquipment() {
  const count = await Equipment.countDocuments();
  if (count > 0) return;
  for (const e of SAMPLE_EQUIPMENT) {
    const farmer = await Farmer.findOne({ email: e.email });
    if (!farmer) continue;
    await Equipment.create({
      owner: farmer._id,
      ownerName: farmer.name,
      ownerPhone: farmer.phone,
      name: e.name,
      type: e.type,
      pricePerDay: e.pricePerDay,
      location: e.location,
      image: e.image,
      description: e.description
    });
  }
}

router.get('/list', auth, async (req, res) => {
  try {
    await ensureSampleEquipment();
    const { type } = req.query;
    const filter = { available: true };
    if (type && type !== 'all') filter.type = type;
    const equipment = await Equipment.find(filter).sort({ createdAt: -1 });
    res.json({ equipment });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load equipment.' });
  }
});

router.post('/list', auth, async (req, res) => {
  try {
    const { name, type, pricePerDay, location, image, description } = req.body;
    if (!name || !pricePerDay) {
      return res.status(400).json({ error: 'Name and pricePerDay are required.' });
    }
    const eq = await Equipment.create({
      owner: req.farmer._id,
      ownerName: req.farmer.name,
      ownerPhone: req.farmer.phone,
      name,
      type: type || 'Tractor',
      pricePerDay: Number(pricePerDay),
      location: location || req.farmer.location?.address || 'India',
      image: image || 'https://images.unsplash.com/photo-1605338803155-8b46c2c8f6f5?w=600&q=80',
      description: description || ''
    });
    res.status(201).json({ equipment: eq });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to add equipment.' });
  }
});

router.post('/book', auth, async (req, res) => {
  try {
    const { equipmentId, days, fromDate } = req.body;
    if (!equipmentId || !days) {
      return res.status(400).json({ error: 'equipmentId and days are required.' });
    }
    const eq = await Equipment.findById(equipmentId).populate('owner', 'name phone');
    if (!eq || !eq.available) {
      return res.status(404).json({ error: 'Equipment not available.' });
    }
    if (eq.owner._id.toString() === req.farmer._id.toString()) {
      return res.status(400).json({ error: 'You cannot book your own equipment.' });
    }
    const booking = await EquipmentBooking.create({
      equipment: equipmentId,
      renter: req.farmer._id,
      renterName: req.farmer.name,
      renterPhone: req.farmer.phone,
      days: Number(days),
      fromDate: fromDate || ''
    });
    res.status(201).json({
      booking,
      owner: { name: eq.owner.name, phone: eq.owner.phone },
      total: eq.pricePerDay * Number(days)
    });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Booking failed.' });
  }
});

router.delete('/list/:id', auth, async (req, res) => {
  try {
    const eq = await Equipment.findOne({ _id: req.params.id, owner: req.farmer._id });
    if (!eq) return res.status(404).json({ error: 'Equipment not found.' });
    await Equipment.deleteOne({ _id: eq._id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Delete failed.' });
  }
});

module.exports = router;

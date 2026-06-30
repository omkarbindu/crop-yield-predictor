const express = require('express');
const Farmer = require('../models/Farmer');
const auth = require('../middleware/auth');
const router = express.Router();

// Update farm location (and optionally gisData)
router.patch('/location', auth, async (req, res) => {
  try {
    const { location, gisData } = req.body;
    const updates = {};
    if (location && location.coordinates && location.coordinates.length === 2) {
      updates.location = {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address || '',
        placeId: location.placeId || ''
      };
    }
    if (gisData) {
      updates.gisData = gisData;
    }
    const farmer = await Farmer.findByIdAndUpdate(
      req.farmer._id,
      { $set: updates },
      { new: true }
    ).select('-password');
    res.json({ farmer });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Update failed.' });
  }
});

module.exports = router;

const express = require('express');
const Alert = require('../models/Alert');
const auth = require('../middleware/auth');
const { refreshAlertsForFarmer } = require('../services/alertGenerator');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    await refreshAlertsForFarmer(req.farmer);
    const alerts = await Alert.find({ farmer: req.farmer._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Alert.countDocuments({
      farmer: req.farmer._id,
      read: false,
    });
    res.json({ alerts, unreadCount });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load alerts.' });
  }
});

router.get('/count', auth, async (req, res) => {
  try {
    const unreadCount = await Alert.countDocuments({
      farmer: req.farmer._id,
      read: false,
    });
    res.json({ unreadCount });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to count alerts.' });
  }
});

router.post('/refresh', auth, async (req, res) => {
  try {
    await refreshAlertsForFarmer(req.farmer);
    const unreadCount = await Alert.countDocuments({
      farmer: req.farmer._id,
      read: false,
    });
    res.json({ ok: true, unreadCount });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to refresh alerts.' });
  }
});

router.patch('/:id/read', auth, async (req, res) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, farmer: req.farmer._id },
      { read: true },
      { new: true },
    );
    if (!alert) return res.status(404).json({ error: 'Alert not found.' });
    res.json(alert);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to update alert.' });
  }
});

router.post('/read-all', auth, async (req, res) => {
  try {
    await Alert.updateMany({ farmer: req.farmer._id, read: false }, { read: true });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to mark alerts read.' });
  }
});

module.exports = router;

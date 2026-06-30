const express = require('express');
const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');
const auth = require('../middleware/auth');
const router = express.Router();

const createToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, location, gisData } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Name, email, phone and password are required.' });
    }
    const existing = await Farmer.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }
    const farmer = new Farmer({
      name,
      email,
      phone,
      password,
      location: location || undefined,
      gisData: gisData || undefined
    });
    await farmer.save();
    const token = createToken(farmer._id);
    const user = await Farmer.findById(farmer._id).select('-password');
    res.status(201).json({ farmer: user, token });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Registration failed.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const farmer = await Farmer.findOne({ email });
    if (!farmer || !(await farmer.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = createToken(farmer._id);
    const user = await Farmer.findById(farmer._id).select('-password');
    res.json({ farmer: user, token });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Login failed.' });
  }
});

// Me
router.get('/me', auth, async (req, res) => {
  res.json({ farmer: req.farmer });
});

module.exports = router;

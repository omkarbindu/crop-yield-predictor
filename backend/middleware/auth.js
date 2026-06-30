const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const farmer = await Farmer.findById(decoded.id).select('-password');
    if (!farmer) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    req.farmer = farmer;
    req.token = token;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = auth;

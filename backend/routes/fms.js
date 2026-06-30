const express = require('express');
const CropPlan = require('../models/CropPlan');
const FarmExpense = require('../models/FarmExpense');
const FieldDiary = require('../models/FieldDiary');
const auth = require('../middleware/auth');
const { buildCalendar, CROP_STAGES } = require('../data/cropCalendar');
const router = express.Router();

const EXPENSE_CATEGORIES = [
  'Seeds',
  'Fertilizer',
  'Pesticides',
  'Labor',
  'Irrigation',
  'Fuel',
  'Equipment',
  'Other',
];

const INCOME_CATEGORIES = [
  'Crop sale',
  'Subsidy',
  'Equipment rental',
  'Other income',
];

// --- Crop calendar / plan ---
router.get('/calendar/crops', auth, (_req, res) => {
  res.json({ crops: Object.keys(CROP_STAGES) });
});

router.get('/calendar', auth, async (req, res) => {
  try {
    const plan = await CropPlan.findOne({ farmer: req.farmer._id });
    if (!plan) {
      return res.json({ plan: null, calendar: [], crops: Object.keys(CROP_STAGES) });
    }
    const calendar = buildCalendar(plan.crop, plan.sowingDate);
    res.json({
      plan,
      calendar,
      crops: Object.keys(CROP_STAGES),
    });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load calendar.' });
  }
});

router.post('/calendar/plan', auth, async (req, res) => {
  try {
    const { crop, sowingDate, areaAcres } = req.body;
    if (!crop || !sowingDate) {
      return res.status(400).json({ error: 'crop and sowingDate are required.' });
    }
    const plan = await CropPlan.findOneAndUpdate(
      { farmer: req.farmer._id },
      {
        crop: String(crop),
        sowingDate: new Date(sowingDate),
        areaAcres: Number(areaAcres) || 1,
        updatedAt: new Date(),
      },
      { upsert: true, new: true },
    );
    const calendar = buildCalendar(plan.crop, plan.sowingDate);
    res.json({ plan, calendar });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to save crop plan.' });
  }
});

// --- Expenses & income ---
router.get('/expenses/summary', auth, async (req, res) => {
  try {
    const rows = await FarmExpense.find({ farmer: req.farmer._id });
    let totalExpense = 0;
    let totalIncome = 0;
    for (const r of rows) {
      if (r.kind === 'income') totalIncome += r.amount;
      else totalExpense += r.amount;
    }
    res.json({
      totalExpense,
      totalIncome,
      balance: totalIncome - totalExpense,
      count: rows.length,
    });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load summary.' });
  }
});

router.get('/expenses', auth, async (req, res) => {
  try {
    const items = await FarmExpense.find({ farmer: req.farmer._id })
      .sort({ date: -1 })
      .limit(100);
    res.json({
      items,
      categories: { expense: EXPENSE_CATEGORIES, income: INCOME_CATEGORIES },
    });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load expenses.' });
  }
});

router.post('/expenses', auth, async (req, res) => {
  try {
    const { kind, category, amount, description, crop, date } = req.body;
    if (!kind || !category || amount == null || !date) {
      return res.status(400).json({
        error: 'kind, category, amount, and date are required.',
      });
    }
    const item = await FarmExpense.create({
      farmer: req.farmer._id,
      kind: kind === 'income' ? 'income' : 'expense',
      category: String(category),
      amount: Number(amount),
      description: String(description || ''),
      crop: String(crop || ''),
      date: new Date(date),
    });
    res.status(201).json(item);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to add entry.' });
  }
});

router.delete('/expenses/:id', auth, async (req, res) => {
  try {
    const deleted = await FarmExpense.findOneAndDelete({
      _id: req.params.id,
      farmer: req.farmer._id,
    });
    if (!deleted) return res.status(404).json({ error: 'Entry not found.' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to delete entry.' });
  }
});

// --- Field diary ---
router.get('/diary', auth, async (req, res) => {
  try {
    const entries = await FieldDiary.find({ farmer: req.farmer._id })
      .sort({ date: -1 })
      .limit(100);
    res.json({ entries });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to load diary.' });
  }
});

router.post('/diary', auth, async (req, res) => {
  try {
    const { date, note, crop, photoUrl } = req.body;
    if (!date || !note?.trim()) {
      return res.status(400).json({ error: 'date and note are required.' });
    }
    const entry = await FieldDiary.create({
      farmer: req.farmer._id,
      date: new Date(date),
      note: note.trim(),
      crop: String(crop || ''),
      photoUrl: String(photoUrl || ''),
    });
    res.status(201).json(entry);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to save diary entry.' });
  }
});

router.delete('/diary/:id', auth, async (req, res) => {
  try {
    const deleted = await FieldDiary.findOneAndDelete({
      _id: req.params.id,
      farmer: req.farmer._id,
    });
    if (!deleted) return res.status(404).json({ error: 'Entry not found.' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to delete entry.' });
  }
});

module.exports = router;

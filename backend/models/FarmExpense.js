const mongoose = require('mongoose');

const farmExpenseSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  kind: { type: String, enum: ['expense', 'income'], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  description: { type: String, default: '' },
  crop: { type: String, default: '' },
  date: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

farmExpenseSchema.index({ farmer: 1, date: -1 });

module.exports = mongoose.model('FarmExpense', farmExpenseSchema);

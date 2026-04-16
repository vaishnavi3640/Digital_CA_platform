const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
  dueDate: { type: Date, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);

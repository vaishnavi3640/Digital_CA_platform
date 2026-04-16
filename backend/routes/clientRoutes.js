const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Document = require('../models/Document');
const Invoice = require('../models/Invoice');
const upload = require('../utils/upload');

// Get Client Documents
router.get('/documents', protect, async (req, res) => {
  try {
    const documents = await Document.find({ clientId: req.user._id }).populate('uploadedBy', 'name role');
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Client uploads a document
router.post('/documents/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const { title } = req.body;
    const document = await Document.create({
      title,
      filePath: req.file.path,
      uploadedBy: req.user._id,
      clientId: req.user._id // The client is uploading for themselves
    });

    // Notify assigned Admin
    if (req.user.assignedAdmin) {
      req.io.to(req.user.assignedAdmin.toString()).emit('new_document', document);
    }

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Invoices
router.get('/invoices', protect, async (req, res) => {
  try {
    const invoices = await Invoice.find({ clientId: req.user._id });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Pay Invoice (Mock endpoint)
router.post('/invoices/:id/pay', protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    if (invoice.clientId.toString() !== req.user._id.toString()) return res.status(401).json({ message: 'Not authorized' });

    invoice.status = 'paid';
    await invoice.save();

    // Notify assigned Admin
    if (req.user.assignedAdmin) {
      req.io.to(req.user.assignedAdmin.toString()).emit('payment_made', invoice);
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

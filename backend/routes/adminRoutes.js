const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Document = require('../models/Document');
const Invoice = require('../models/Invoice');
const upload = require('../utils/upload');

// Get all clients for this admin
router.get('/clients', protect, admin, async (req, res) => {
  try {
    const clients = await User.find({ assignedAdmin: req.user._id, role: 'client' }).select('-password');
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin uploads a document for a client
router.post('/documents/upload', protect, admin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const { title, clientId } = req.body;
    const document = await Document.create({
      title,
      filePath: req.file.path,
      uploadedBy: req.user._id,
      clientId
    });

    // Notify client
    req.io.to(clientId.toString()).emit('new_document', document);

    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin gets all documents
router.get('/documents', protect, admin, async (req, res) => {
  try {
    const documents = await Document.find({ uploadedBy: req.user._id }).populate('clientId', 'name email');
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Invoice
router.post('/invoices', protect, admin, async (req, res) => {
  try {
    const { clientId, amount, description, dueDate } = req.body;
    const invoice = await Invoice.create({
      clientId,
      amount,
      description,
      dueDate
    });

    // Notify client
    req.io.to(clientId.toString()).emit('new_invoice', invoice);

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Invoices
router.get('/invoices', protect, admin, async (req, res) => {
  try {
    // Optionally filter by clients managed by admin
    const clients = await User.find({ assignedAdmin: req.user._id }).select('_id');
    const clientIds = clients.map(c => c._id);
    const invoices = await Invoice.find({ clientId: { $in: clientIds } }).populate('clientId', 'name email');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dashboard Stats
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const clientCount = await User.countDocuments({ assignedAdmin: req.user._id });
    
    const clients = await User.find({ assignedAdmin: req.user._id }).select('_id');
    const clientIds = clients.map(c => c._id);
    
    const docCount = await Document.countDocuments({ uploadedBy: req.user._id });
    
    const invoices = await Invoice.find({ clientId: { $in: clientIds } });
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);
    const pendingRevenue = invoices.filter(i => i.status === 'unpaid').reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      clientCount,
      docCount,
      totalRevenue,
      pendingRevenue,
      monthlyData: [
        { name: 'Jan', revenue: 4000 },
        { name: 'Feb', revenue: 3000 },
        { name: 'Mar', revenue: 2000 },
        { name: 'Apr', revenue: 2780 },
        { name: 'May', revenue: totalRevenue > 0 ? totalRevenue : 1890 }, // Mock dynamic data
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

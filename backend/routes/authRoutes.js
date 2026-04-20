const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, 'fallback_secret_for_now', { expiresIn: '30d' });
};

router.post('/register', async (req, res) => {
  const { name, email, password, role, inviteCode } = req.body;
  
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let assignedAdmin = null;
    if (role === 'client' && inviteCode) {
      // Find admin by name or email (since there is no username field)
      const admin = await User.findOne({ 
        role: 'admin', 
        $or: [{ name: inviteCode }, { email: inviteCode }] 
      });
      if (!admin) {
        return res.status(400).json({ message: 'No Admin found with that name or email' });
      }
      assignedAdmin = admin._id;
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'client',
      assignedAdmin
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        assignedAdmin: user.assignedAdmin,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

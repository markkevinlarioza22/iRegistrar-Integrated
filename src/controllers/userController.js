// src/controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * Register a new user (student or admin)
 * POST /api/users/register
 */
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: role || 'student'
    });

    const userSafe = user.toObject();
    delete userSafe.password;

    res.status(201).json({ message: 'Registered', user: userSafe });
  } catch (err) {
    console.error('registerUser error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Login user (admin or student)
 * POST /api/users/login
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', email); // debug log

    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });

    const user = await User.findOne({ email });
    console.log('User found:', user); // debug log

    if (!user) return res.status(404).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch); // debug log

    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login success',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('loginUser error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all users (admin only)
 * GET /api/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('getAllUsers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

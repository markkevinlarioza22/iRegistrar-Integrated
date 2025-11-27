// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();

const { registerUser, loginUser, getAllUsers } = require('../controllers/userController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Register & Login
router.post('/register', registerUser);
router.post('/login', loginUser);

// Get all users (admin only) -> GET /api/users
router.get('/', auth, admin, getAllUsers);

module.exports = router;

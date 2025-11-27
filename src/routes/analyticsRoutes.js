// src/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { getAnalytics } = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', auth, admin, getAnalytics);

module.exports = router;

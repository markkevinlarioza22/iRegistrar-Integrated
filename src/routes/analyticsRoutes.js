const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getRequestStats } = require('../controllers/analyticsController');

router.get('/requests', auth, getRequestStats);

module.exports = router;

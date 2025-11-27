// src/routes/requestRoutes.js
const express = require('express');
const router = express.Router();

const {
  createRequest,
  getUserRequests,
  getAllRequests,
  updateRequestStatus
} = require('../controllers/requestController');

const auth = require('../middleware/auth');
const adminOnly = require('../middleware/admin');

// Student creates a request
router.post('/', auth, createRequest);

// Student gets own requests
router.get('/my', auth, getUserRequests);

// Admin: get all requests
router.get('/', auth, adminOnly, getAllRequests);

// Admin: update status
router.put('/:id/status', auth, adminOnly, updateRequestStatus);

module.exports = router;

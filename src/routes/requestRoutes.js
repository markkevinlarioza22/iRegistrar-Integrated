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

// ------------------------------
// STUDENT ROUTES
// ------------------------------

// Student creates a new document request
router.post('/', auth, createRequest);

// Student gets his/her own requests
router.get('/', auth, getUserRequests);


// ------------------------------
// ADMIN ROUTES
// ------------------------------

// Admin / Registrar: Get ALL requests
router.get('/all', auth, adminOnly, getAllRequests);

// Admin / Registrar: Update status of any request
router.put('/:id', auth, adminOnly, updateRequestStatus);


module.exports = router;

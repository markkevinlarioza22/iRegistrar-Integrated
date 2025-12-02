const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
    createRequest,
    getUserRequests,
    getAllRequests,
    updateRequestStatus
} = require('../controllers/requestController');

// Student: Create request
router.post('/', auth, createRequest);

// Student: Get own requests
router.get('/', auth, getUserRequests);

// Admin: Get all requests
router.get('/all', auth, getAllRequests);

// Admin: Update status
router.put('/status/:id', auth, updateRequestStatus);

module.exports = router;

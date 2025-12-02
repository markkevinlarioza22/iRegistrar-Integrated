const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createRequest, getUserRequests, updateRequestStatus } = require('../controllers/requestController');

router.post('/', auth, createRequest);
router.get('/', auth, getUserRequests);
router.put('/:id', auth, updateRequestStatus);

module.exports = router;

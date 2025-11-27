// src/controllers/requestController.js
const Request = require('../models/requestModel');

// Allowed statuses
const ALLOWED_STATUSES = ['Pending', 'Approved', 'Processing', 'Released', 'Rejected'];

/**
 * Create a new request
 * POST /api/requests
 * auth required
 */
exports.createRequest = async (req, res) => {
  try {
    const { documentType, purpose, remarks } = req.body;
    if (!documentType || !purpose) return res.status(400).json({ message: 'Missing fields' });

    const newReq = await Request.create({
      user: req.user.id,
      documentType,
      purpose,
      remarks,
      status: 'Pending'
    });

    res.status(201).json(newReq);
  } catch (err) {
    console.error('createRequest error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get logged-in user's requests
 * GET /api/requests/my
 */
exports.getUserRequests = async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('getUserRequests error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all requests (admin)
 * GET /api/requests
 */
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error('getAllRequests error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update request status (admin)
 * PUT /api/requests/:id/status
 */
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${ALLOWED_STATUSES.join(', ')}` });
    }

    const reqDoc = await Request.findById(id);
    if (!reqDoc) return res.status(404).json({ message: 'Request not found' });

    reqDoc.status = status || reqDoc.status;
    const updated = await reqDoc.save();

    res.json(updated);
  } catch (err) {
    console.error('updateRequestStatus error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

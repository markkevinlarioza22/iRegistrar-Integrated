const Request = require('../models/requestModel');

// Allowed statuses now match the model
const ALLOWED_STATUSES = ['Pending', 'Approved', 'Processing', 'Released', 'Rejected'];

// @desc    Create a new document request
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res) => {
  try {
    const { documentType, purpose, remarks } = req.body;

    if (!documentType || !purpose) {
      return res.status(400).json({ message: 'All required fields must be filled.' });
    }

    const newRequest = new Request({
      user: req.user.id,
      documentType,
      purpose,
      remarks,
      status: 'Pending'
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ message: 'Server error while creating request' });
  }
};

// @desc    Get all requests for logged-in user
// @route   GET /api/requests
// @access  Private
const getUserRequests = async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

// @desc    Get all requests (admin/registrar only)
// @route   GET /api/requests/all
// @access  Private/Admin
const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching all requests:', error);
    res.status(500).json({ message: 'Error fetching all requests' });
  }
};

// @desc    Update request status (admin/registrar only)
// @route   PUT /api/requests/:id
// @access  Private/Admin
const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Validate status against allowed enum values
    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed values: ${ALLOWED_STATUSES.join(', ')}` });
    }

    request.status = status || request.status;
    const updatedRequest = await request.save();

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({ message: 'Error updating request' });
  }
};

module.exports = {
  createRequest,
  getUserRequests,
  getAllRequests,
  updateRequestStatus
};

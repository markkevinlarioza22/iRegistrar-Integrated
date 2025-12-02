const Request = require('../models/requestModel');

exports.createRequest = async (req, res) => {
    try {
        const newRequest = await Request.create({ ...req.body, studentId: req.user.id });
        res.status(201).json(newRequest);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getUserRequests = async (req, res) => {
    try {
        const requests = await Request.find({ studentId: req.user.id });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const request = await Request.findByIdAndUpdate(id, { status }, { new: true });
        res.json(request);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

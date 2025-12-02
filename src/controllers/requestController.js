const Request = require('../models/requestModel');
const User = require('../models/userModel');

// Student creates request
exports.createRequest = async (req, res) => {
    try {
        const request = new Request({
            studentId: req.user.id,
            documentType: req.body.documentType,
            status: "Pending"
        });
        await request.save();
        res.json(request);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Student views own requests
exports.getUserRequests = async (req, res) => {
    const list = await Request.find({ studentId: req.user.id });
    res.json(list);
};

// Admin gets all requests
exports.getAllRequests = async (req, res) => {
    const requests = await Request.find().populate("studentId", "name email");
    const formatted = requests.map(r => ({
        _id: r._id,
        studentName: r.studentId.name,
        documentType: r.documentType,
        createdAt: r.createdAt,
        status: r.status
    }));
    res.json(formatted);
};

// Admin updates status
exports.updateRequestStatus = async (req, res) => {
    await Request.findByIdAndUpdate(req.params.id, {
        status: req.body.status
    });
    res.json({ message: "Updated" });
};

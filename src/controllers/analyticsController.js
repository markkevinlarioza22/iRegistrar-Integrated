const Request = require('../models/requestModel');

exports.getRequestStats = async (req, res) => {
    try {
        const totalRequests = await Request.countDocuments();
        const approved = await Request.countDocuments({ status: 'approved' });
        const pending = await Request.countDocuments({ status: 'pending' });
        const rejected = await Request.countDocuments({ status: 'rejected' });

        res.json({ totalRequests, approved, pending, rejected });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

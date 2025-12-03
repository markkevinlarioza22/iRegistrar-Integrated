const User = require('../models/userModel');
const Request = require('../models/requestModel');

exports.getRequestStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: "student" });
        const totalRequests = await Request.countDocuments();
        const pending = await Request.countDocuments({ status: "Pending" });

        res.json({ totalStudents, totalRequests, pending });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

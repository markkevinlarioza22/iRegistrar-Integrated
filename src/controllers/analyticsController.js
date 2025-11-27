// src/controllers/analyticsController.js
const User = require('../models/userModel');
const Request = require('../models/requestModel');

/**
 * GET /api/analytics
 * admin-only
 * Returns: { userStats: { students, admins }, requestStats: {...}, recentRequests: [...] }
 */
exports.getAnalytics = async (req, res) => {
  try {
    // users count
    const students = await User.countDocuments({ role: 'student' });
    const admins = await User.countDocuments({ role: 'admin' });

    // requests by status
    const statuses = ['Pending','Approved','Processing','Released','Rejected'];
    const requestStats = {};
    await Promise.all(statuses.map(async s => {
      requestStats[s] = await Request.countDocuments({ status: s });
    }));

    // recent 10 requests (populate user info)
    const recentRequests = await Request.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      userStats: { students, admins },
      requestStats,
      recentRequests
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

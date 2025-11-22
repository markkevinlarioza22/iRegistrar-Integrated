// src/middleware/admin.js

const adminOnly = (req, res, next) => {
  try {
    // Make sure auth middleware already added req.user
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Only admin or registrar can continue
    if (req.user.role === "admin" || req.user.role === "registrar") {
      return next();
    }

    return res.status(403).json({ message: "Access denied. Admin only." });
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = adminOnly;

const jwt = require("jsonwebtoken");

module.exports = function (requiredRole = null) {
  return function (req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Role requirement (admin only, if used)
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ message: "Forbidden: Insufficient permission." });
      }

      next();
    } catch (err) {
      return res.status(400).json({ message: "Invalid token." });
    }
  };
};

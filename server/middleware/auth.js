const jwt = require("jsonwebtoken");

function requireAdmin(req, res, next) {
  // Header එක: "Authorization: Bearer <token>"
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Please log in" });
  }

  try {
    // Token එක අපේ secret එකෙන් අත්සන් කරලාද, කල් ඉකුත් වෙලාද කියලා check කරනවා
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next(); // ✅ go inside
  } catch {
    return res
      .status(401)
      .json({ message: "Session expired. Please log in again" });
  }
}

module.exports = requireAdmin;

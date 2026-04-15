function isAdmin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: "Authentication required." });
  }

  if (req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }

  req.user = req.session.user;
  return next();
}

module.exports = { isAdmin };

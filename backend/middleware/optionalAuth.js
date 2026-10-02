const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Attaches req.user if a valid token is present, but never blocks the request.
// Used on public GET routes that behave slightly differently for logged-in
// owners/admins (e.g. viewing pending listings, skipping view-count increments).
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) req.user = user;
  } catch (err) {
    // Invalid token on a public route: just proceed as an anonymous visitor
  }
  next();
};

module.exports = optionalAuth;

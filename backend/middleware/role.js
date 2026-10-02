const ApiError = require('../utils/ApiError');

// Usage: router.post('/', protect, authorize('hospital', 'admin'), handler)
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new ApiError(403, 'You do not have permission to perform this action.');
  }
  next();
};

module.exports = authorize;

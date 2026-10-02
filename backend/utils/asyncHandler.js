// Wraps async route handlers so rejected promises are passed to Express error middleware
// instead of requiring a try/catch block in every controller.
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;

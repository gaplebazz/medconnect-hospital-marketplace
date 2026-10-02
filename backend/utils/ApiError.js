// Custom error class that carries an HTTP status code.
// Throwing `new ApiError(400, 'message')` inside a controller will be caught by
// asyncHandler and formatted consistently by the centralized error middleware.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;

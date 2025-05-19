/**
 * Async Handler
 * This utility function is used to handle asynchronous route handlers and middleware.
 * It ensures that any errors are passed to the next middleware (error handler) in the stack.
 */

exports.asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

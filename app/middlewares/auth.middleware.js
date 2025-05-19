const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const JWT_SECRET = process.env.JWT_SECRET;

const isAuthenticated = (req, res, next) => {
  // Extract token from the 'Authorization' header
  const authHeader = req.header("Authorization");

  // Check if the Authorization header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message:
        "Authorization token is missing or malformed. Please log in to access this resource.",
    });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token using the JWT secret
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user_id to the request object for further use in routes
    req.user_id = decoded.user_id;
    req.role = decoded.role;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Token verification failed, return an appropriate message
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Invalid or expired token. Please log in again to continue.",
    });
  }
};

module.exports = isAuthenticated;

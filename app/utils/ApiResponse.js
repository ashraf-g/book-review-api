/**
 * ApiResponse Class
 * This class provides a standardized structure for API responses.
 * It includes properties such as statusCode, data, message, and success.
 */

class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

module.exports = ApiResponse;

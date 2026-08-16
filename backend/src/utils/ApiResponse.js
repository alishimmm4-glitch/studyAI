/**
 * Standard success envelope so every endpoint returns a predictable shape:
 * { success, message, data }
 */
class ApiResponse {
  constructor(res, statusCode, message, data = null) {
    return res.status(statusCode).json({
      success: statusCode < 400,
      message,
      data,
    });
  }
}

module.exports = ApiResponse;

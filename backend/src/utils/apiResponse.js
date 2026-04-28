const successResponse = (message, data = null) => ({ success: true, message, data });
const errorResponse = (message, error = null) => ({ success: false, message, error });

module.exports = { successResponse, errorResponse };
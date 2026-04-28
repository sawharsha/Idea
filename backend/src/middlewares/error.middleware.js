const { errorResponse } = require("../utils/apiResponse");

const notFound = (req, res) => {
  res.status(404).json(errorResponse(`Route not found - ${req.originalUrl}`, "NotFound"));
};

const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json(
    errorResponse(err.message || "Internal Server Error", err.name || "ServerError")
  );
};

module.exports = { notFound, errorHandler };

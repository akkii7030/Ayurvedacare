function notFound(_req, res) {
  res.status(404).json({ message: "Not found" });
}

function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";
  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
  });
}

module.exports = {
  notFound,
  errorHandler,
};

module.exports = function errorHandler(err, _req, res, _next) {
  const status  = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";
  if (process.env.NODE_ENV !== "production") console.error(`[ERROR ${status}]`, message);
  res.status(status).json({ message });
};
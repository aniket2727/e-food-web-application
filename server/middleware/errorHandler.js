// Error handling middleware for catching errors passed from controllers
const errorHandler = (err, req, res, next) => {
  console.error("aniket code ",err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Server Error';
  const errors = err.errors || [];

  res.status(statusCode).json({
    message,
    errors,
  });
};

module.exports = errorHandler;

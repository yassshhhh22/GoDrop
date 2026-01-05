import { NODE_ENV } from '../config/config.js';
import logger from '../utils/logger.js';
import ApiError from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Convert non-ApiError errors to ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], error.stack);
  }

  // Log error
  logger.error({
    message: error.message,
    statusCode: error.statusCode,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.userId || 'anonymous',
    stack: error.stack,
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    error = new ApiError(400, 'Validation Error', errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const value = err.keyValue[field];
    error = new ApiError(409, `${field} '${value}' already exists`);
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    error = new ApiError(400, `Invalid ${err.path}: ${err.value}`);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token. Please login again');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired. Please login again');
  }

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new ApiError(400, 'File size too large. Maximum 5MB allowed');
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    error = new ApiError(400, 'Too many files uploaded');
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = new ApiError(400, 'Unexpected file field');
  }

  // Construct response
  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.errors.length > 0 && { errors: error.errors }),
    ...(NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};

// 404 Not Found handler
export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
};



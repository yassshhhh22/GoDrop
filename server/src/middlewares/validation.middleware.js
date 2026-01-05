import { validationResult } from 'express-validator';
import Joi from 'joi';
import ApiError from '../utils/ApiError.js';

/**
 * Validation middleware factory for express-validator
 * @param {Array} validations - Array of express-validator validation chains
 * @returns {Function} Express middleware function
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // If validations is a Joi schema, use Joi validation
    if (validations.isJoi) {
      try {
        const validated = await validations.validateAsync(req.body, {
          abortEarly: false,
        });
        req.body = validated;
        return next();
      } catch (error) {
        const errors = error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));
        return next(new ApiError(400, 'Validation failed', errors));
      }
    }

    // Execute all validations (express-validator)
    if (Array.isArray(validations)) {
      await Promise.all(validations.map((validation) => validation.run(req)));
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const extractedErrors = errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value,
      }));

      return next(new ApiError(400, 'Validation failed', extractedErrors));
    }

    next();
  };
};

/**
 * Custom validation helpers
 */
export const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return next(new ApiError(400, 'Invalid ID format'));
  }

  next();
};

export const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  if (page < 1) {
    return next(new ApiError(400, 'Page number must be greater than 0'));
  }

  if (limit < 1 || limit > 100) {
    return next(new ApiError(400, 'Limit must be between 1 and 100'));
  }

  req.pagination = { page, limit };
  next();
};

/**
 * Validate coordinates (for delivery partners only)
 */
export const validateCoordinates = (req, res, next) => {
  const { latitude, longitude } = req.body;

  if (latitude !== undefined) {
    const lat = parseFloat(latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return next(
        new ApiError(400, 'Invalid latitude. Must be between -90 and 90')
      );
    }
  }

  if (longitude !== undefined) {
    const lon = parseFloat(longitude);
    if (isNaN(lon) || lon < -180 || lon > 180) {
      return next(
        new ApiError(400, 'Invalid longitude. Must be between -180 and 180')
      );
    }
  }

  next();
};

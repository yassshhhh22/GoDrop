import validator from 'validator';
import ApiError from '../utils/ApiError.js';
import { formatPhoneNumber, isValidPhoneNumber, isValidEmail } from '../utils/helpers.js';

// Sanitize and validate phone number
export const sanitizePhone = (req, res, next) => {
  if (req.body.phone) {
    try {
      req.body.phone = formatPhoneNumber(req.body.phone);
      
      if (!isValidPhoneNumber(req.body.phone)) {
        return next(new ApiError(400, 'Invalid phone number format'));
      }
    } catch (error) {
      return next(new ApiError(400, 'Invalid phone number format'));
    }
  }
  
  next();
};

// Sanitize email
export const sanitizeEmail = (req, res, next) => {
  if (req.body.email) {
    const email = req.body.email.trim().toLowerCase();
    req.body.email = validator.normalizeEmail(email);
    
    if (!isValidEmail(req.body.email)) {
      return next(new ApiError(400, 'Invalid email format'));
    }
  }
  
  next();
};

// Sanitize strings (remove HTML/script tags)
export const sanitizeStrings = (fields = []) => {
  return (req, res, next) => {
    fields.forEach(field => {
      if (req.body[field]) {
        req.body[field] = validator.escape(req.body[field].trim());
      }
    });
    next();
  };
};

// Sanitize numeric fields
export const sanitizeNumbers = (fields = []) => {
  return (req, res, next) => {
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        const num = parseFloat(req.body[field]);
        if (isNaN(num)) {
          return next(new ApiError(400, `${field} must be a valid number`));
        }
        req.body[field] = num;
      }
    });
    next();
  };
};
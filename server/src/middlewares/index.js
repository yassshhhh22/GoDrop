// Authentication (Already exists)
export { authenticate, authorize, optionalAuth } from './auth.middleware.js';

// Validation (Already exists)
export {
  validate,
  validateObjectId,
  validatePagination,
  validateCoordinates,
} from './validation.middleware.js';

// Error Handling
export { errorHandler, notFound } from './error.middleware.js';

// Rate Limiting
export {
  apiLimiter,
  authLimiter,
  otpLimiter,
  paymentLimiter,
  orderLimiter,
} from './rateLimiter.middleware.js';

// Sanitization
export {
  sanitizePhone,
  sanitizeEmail,
  sanitizeStrings,
  sanitizeNumbers,
} from './sanitize.middleware.js';

// File Upload
export {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleUploadError,
  uploadToCloudinary,
  deleteFromCloudinary,
} from './upload.middleware.js';

// Business Verification
export * from './businessVerification.middleware.js';

/**
 * Error handling utilities
 * Parses API errors and exceptions into user-friendly messages
 */
import { ERROR_CODES } from "./constants";

/**
 * Parse API error response and extract user-friendly message
 * @param {Error|AxiosError} error - Error object
 * @returns {object} { code, message, statusCode, details }
 */
export const parseApiError = (error) => {
  let code = ERROR_CODES.UNKNOWN;
  let message = "Something went wrong. Please try again.";
  let statusCode = null;
  let details = null;

  // Network error (no response received)
  if (!error.response) {
    if (error.message === "Network Error") {
      return {
        code: ERROR_CODES.NETWORK_ERROR,
        message: "No internet connection. Please check your network.",
        statusCode: null,
        details: null,
      };
    }

    if (error.code === "ECONNABORTED") {
      return {
        code: ERROR_CODES.TIMEOUT,
        message: "Request timeout. Please try again.",
        statusCode: null,
        details: null,
      };
    }

    return {
      code: ERROR_CODES.NETWORK_ERROR,
      message: error.message || "Network error occurred",
      statusCode: null,
      details: null,
    };
  }

  // Has response from server
  const { status, data } = error.response;
  statusCode = status;

  // Parse based on status code
  switch (status) {
    case 400:
      code = ERROR_CODES.VALIDATION_ERROR;
      message =
        data?.message ||
        data?.error ||
        "Invalid request. Please check your input.";
      details = data?.details || data?.errors;
      break;

    case 401:
      code = ERROR_CODES.UNAUTHORIZED;
      message = data?.message || "Session expired. Please log in again.";
      break;

    case 403:
      code = ERROR_CODES.FORBIDDEN;
      message =
        data?.message || "You don't have permission to perform this action.";
      break;

    case 404:
      code = ERROR_CODES.NOT_FOUND;
      message = data?.message || "The requested item was not found.";
      break;

    case 500:
    case 502:
    case 503:
      code = ERROR_CODES.INTERNAL_ERROR;
      message = "Server error. Please try again later.";
      break;

    default:
      message =
        data?.message ||
        error.message ||
        "An error occurred. Please try again.";
  }

  return {
    code,
    message,
    statusCode,
    details,
  };
};

/**
 * Get user-friendly error message for common scenarios
 * @param {string} errorCode - Error code from parseApiError
 * @returns {string} User-friendly message
 */
export const getErrorMessage = (errorCode) => {
  const messages = {
    [ERROR_CODES.NETWORK_ERROR]:
      "No internet connection. Please check your network.",
    [ERROR_CODES.UNAUTHORIZED]: "Session expired. Please log in again.",
    [ERROR_CODES.FORBIDDEN]:
      "You don't have permission to perform this action.",
    [ERROR_CODES.NOT_FOUND]: "The requested item was not found.",
    [ERROR_CODES.VALIDATION_ERROR]: "Invalid input. Please check your details.",
    [ERROR_CODES.INTERNAL_ERROR]: "Server error. Please try again later.",
    [ERROR_CODES.TIMEOUT]: "Request timeout. Please try again.",
    [ERROR_CODES.UNKNOWN]: "Something went wrong. Please try again.",
  };

  return messages[errorCode] || messages[ERROR_CODES.UNKNOWN];
};

/**
 * Handle specific error types with appropriate responses
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred (e.g., "login", "checkout")
 * @returns {object} Error response with user message and action
 */
export const handleError = (error, context = "operation") => {
  const parsed = parseApiError(error);

  // Specific handling for 401 (unauthorized)
  if (parsed.code === ERROR_CODES.UNAUTHORIZED) {
    return {
      ...parsed,
      action: "logout", // Trigger app to logout and redirect to login
    };
  }

  // Specific handling for validation errors
  if (parsed.code === ERROR_CODES.VALIDATION_ERROR && parsed.details) {
    return {
      ...parsed,
      fieldErrors: parsed.details,
      action: "validate",
    };
  }

  return {
    ...parsed,
    action: "retry",
  };
};

/**
 * Extract field errors from API response (for form validation)
 * @param {object} apiError - API error response
 * @returns {object} Field-specific errors {fieldName: errorMessage}
 */
export const extractFieldErrors = (apiError) => {
  const parsed = parseApiError(apiError);

  if (!parsed.details) {
    return {};
  }

  // If details is an array, convert to object
  if (Array.isArray(parsed.details)) {
    return parsed.details.reduce((acc, error) => {
      acc[error.field || error.path] = error.message;
      return acc;
    }, {});
  }

  // If details is already an object
  return parsed.details;
};

/**
 * Check if error is due to network issues
 * @param {Error} error - Error object
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  const parsed = parseApiError(error);
  return (
    parsed.code === ERROR_CODES.NETWORK_ERROR ||
    parsed.code === ERROR_CODES.TIMEOUT
  );
};

/**
 * Check if error is due to authentication issues
 * @param {Error} error - Error object
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  const parsed = parseApiError(error);
  return parsed.code === ERROR_CODES.UNAUTHORIZED;
};

/**
 * Check if error is due to validation issues
 * @param {Error} error - Error object
 * @returns {boolean}
 */
export const isValidationError = (error) => {
  const parsed = parseApiError(error);
  return parsed.code === ERROR_CODES.VALIDATION_ERROR;
};

/**
 * Format error for logging
 * @param {Error} error - Error object
 * @param {string} context - Context info
 * @returns {object} Formatted error for logging
 */
export const formatErrorForLog = (error, context = "") => {
  const parsed = parseApiError(error);

  return {
    timestamp: new Date().toISOString(),
    context,
    code: parsed.code,
    message: parsed.message,
    statusCode: parsed.statusCode,
    stack: error.stack,
    details: parsed.details,
  };
};

/**
 * Create a toast notification message from error
 * @param {Error} error - Error object
 * @returns {object} { type, message } for toast
 */
export const getToastErrorMessage = (error) => {
  const parsed = parseApiError(error);

  return {
    type: "error",
    message: parsed.message,
  };
};

/**
 * Handle logout and redirect to login on 401
 * Called by API interceptor when session expires
 * @returns {void}
 */
export const handleUnauthorizedError = () => {
  // This will be called from API interceptor
  // It should trigger auth store to logout and clear storage
  // Navigation will redirect to login screen
  console.warn("⚠️ Unauthorized - logging out user");
};

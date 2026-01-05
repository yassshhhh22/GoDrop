import { errorAlert, warningAlert } from "./alerts.jsx";

/**
 * ========================================
 * ERROR HANDLING UTILITIES
 * ========================================
 */

/**
 * Handle API errors consistently
 * @param {Error} error - Axios error object
 * @param {string} fallbackMessage - Default message if error parsing fails
 * @returns {string} Error message
 */
export const handleApiError = (
  error,
  fallbackMessage = "Something went wrong"
) => {
  let message = fallbackMessage;

  if (error.response) {
    // Server responded with error status
    message =
      error.response.data?.message ||
      error.response.statusText ||
      fallbackMessage;

    // Handle specific status codes
    switch (error.response.status) {
      case 400:
        message = error.response.data?.message || "Invalid request";
        errorAlert(message);
        break;
      case 401:
        message = "Please login to continue";
        warningAlert(message);
        break;
      case 403:
        message = "You don't have permission to perform this action";
        errorAlert(message);
        break;
      case 404:
        message = error.response.data?.message || "Resource not found";
        errorAlert(message);
        break;
      case 422:
        message = formatValidationErrors(error.response.data?.errors);
        errorAlert(message);
        break;
      case 429:
        message = "Too many requests. Please try again later.";
        warningAlert(message);
        break;
      case 500:
        message = "Server error. Please try again later.";
        errorAlert(message);
        break;
      default:
        errorAlert(message);
    }
  } else if (error.request) {
    // Request made but no response
    message = "Network error. Please check your connection.";
    errorAlert(message);
  } else {
    // Error setting up request
    message = error.message || fallbackMessage;
    errorAlert(message);
  }

  return message;
};

/**
 * Log errors to console in development
 * @param {Error} error - Error object
 * @param {string} context - Context where error occurred
 */
export const logError = (error, context = "") => {
  if (import.meta.env.DEV) {
    console.error(`[${context}]`, error);
  }
};

/**
 * Format validation errors from backend
 * @param {Object|Array|string} errors - Validation errors
 * @returns {string} Formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (!errors) return "Validation failed";

  if (Array.isArray(errors)) {
    return errors.map((err) => err.msg || err.message || err).join(", ");
  }

  if (typeof errors === "object") {
    return Object.values(errors).flat().join(", ");
  }

  return "Validation failed";
};

/**
 * Extract error message from various error formats
 * @param {*} error - Error in any format
 * @returns {string} Extracted message
 */
export const getErrorMessage = (error) => {
  if (typeof error === "string") return error;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return "An unexpected error occurred";
};

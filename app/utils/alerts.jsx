/**
 * Alert utilities for React Native
 * Uses react-native-toast-notifications for displaying alerts
 */
import { useToast } from "react-native-toast-notifications";

let globalToastInstance = null;

export const initializeToast = (toastRef) => {
  globalToastInstance = toastRef;
};

export const showSuccess = (message, duration = 3000) => {
  if (globalToastInstance && globalToastInstance.show) {
    globalToastInstance.show(message, {
      type: "success",
      placement: "top",
      duration,
      animationType: "slide-in",
    });
  }
};

export const showError = (message, duration = 4000) => {
  if (globalToastInstance && globalToastInstance.show) {
    globalToastInstance.show(message, {
      type: "danger",
      placement: "top",
      duration,
      animationType: "slide-in",
    });
  } else {
    alert(message);
  }
};

/**
 * Show warning toast
 * @param {string} message - Message to display
 * @param {number} duration - Duration in ms (default 3500)
 */
export const showWarning = (message, duration = 3500) => {
  if (globalToastInstance) {
    globalToastInstance.show(message, {
      type: "warning",
      placement: "top",
      duration,
      animationType: "slide-in",
    });
  }
};

/**
 * Show info toast
 * @param {string} message - Message to display
 * @param {number} duration - Duration in ms (default 3000)
 */
export const showInfo = (message, duration = 3000) => {
  if (globalToastInstance) {
    globalToastInstance.show(message, {
      type: "info",
      placement: "top",
      duration,
      animationType: "slide-in",
    });
  }
};

/**
 * Show loading toast (no auto-hide)
 * @param {string} message - Message to display
 * @returns {object} Toast object to close later
 */
export const showLoading = (message = "Loading...") => {
  if (globalToastInstance) {
    return globalToastInstance.show(message, {
      type: "normal",
      placement: "center",
      duration: 0, // No auto-hide
      animationType: "slide-in",
    });
  }
  return null;
};

/**
 * Hide a toast
 * @param {object} toastId - Toast ID returned from showLoading
 */
export const hideToast = (toastId) => {
  if (globalToastInstance && toastId) {
    globalToastInstance.hide(toastId);
  }
};

/**
 * Show confirmation dialog (promise-based)
 * Note: React Native doesn't have native dialog, use Alert from react-native instead
 * This is a placeholder for custom implementation
 * @param {object} options - { title, message, buttons }
 * @returns {Promise} Resolves with button pressed
 */
export const showConfirmDialog = (options) => {
  return new Promise((resolve) => {
    // Would need to implement a custom modal for this
    // For now, use react-native Alert
    const {
      title,
      message,
      confirmText = "Confirm",
      cancelText = "Cancel",
    } = options;

    // Import Alert from react-native and use it in component
    // This function should be implemented in components that need it
    resolve(false);
  });
};

/**
 * Show API error as toast
 * @param {Error} error - API error object
 * @param {string} fallbackMessage - Fallback message if error parsing fails
 */
export const showApiError = (
  error,
  fallbackMessage = "Something went wrong"
) => {
  let message = fallbackMessage;

  if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  }

  showError(message);
};

/**
 * Show API success message
 * @param {string|object} response - API response or message
 * @param {string} defaultMessage - Default message if response is empty
 */
export const showApiSuccess = (response, defaultMessage = "Success") => {
  let message = defaultMessage;

  if (typeof response === "string") {
    message = response;
  } else if (response?.message) {
    message = response.message;
  }

  showSuccess(message);
};

/**
 * Create custom alert with duration
 * @param {object} options - { type, message, duration }
 */
export const showCustom = ({ type = "normal", message, duration = 3000 }) => {
  if (globalToastInstance) {
    globalToastInstance.show(message, {
      type,
      placement: "top",
      duration,
      animationType: "slide-in",
    });
  }
};

/**
 * Clear all toasts
 */
export const clearAllToasts = () => {
  if (globalToastInstance) {
    globalToastInstance.hideAll();
  }
};

// Export all as an object for convenient importing
export default {
  initializeToast,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  hideToast,
  showConfirmDialog,
  showApiError,
  showApiSuccess,
  showCustom,
  clearAllToasts,
};

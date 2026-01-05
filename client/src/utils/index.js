/**
 * ========================================
 * CENTRALIZED UTILITY EXPORTS
 * ========================================
 */

// Error Handling
export { handleApiError, logError } from "./errorHandler";

// Price Formatting
export {
  formatPrice,
  calculateDiscountedPrice,
  calculateSavings,
  calculateDiscountPercentage,
  formatPriceRange,
} from "./priceFormatter";

// URL Helpers
export { generateSlug, buildQueryString } from "./urlHelpers";

// alerts.jsx (React Hot Toast)
export {
  successAlert,
  errorAlert,
  warningAlert,
  infoAlert,
  confirmAlert,
  deleteConfirmAlert,
  loadingAlert,
  closeAlert,
  updateAlert,
  promiseAlert,
  customAlert,
} from "./alerts.jsx"; // ✅ FIX: Changed from alerts.jsx.jsx to alerts.jsx

// Validators
export {
  isValidPhone,
  isValidEmail,
  isValidPincode,
  isValidGST,
  isValidPAN,
  isValidOTP,
  isValidFileSize,
  isValidFileType,
} from "./validators";

// Date Helpers
export {
  formatDate,
  formatDateTime,
  getRelativeTime,
  isToday,
  isTomorrow,
  isYesterday,
  addDays,
  subtractDays,
} from "./dateHelpers";

// Local Storage Helpers
export {
  setItem,
  getItem,
  removeItem,
  clearStorage,
  hasItem,
} from "./localStorage";

// Constants
export * from "./constants";

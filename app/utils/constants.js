/**
 * Constants used throughout the app
 */

// ========================================
// API & NETWORK
// ========================================
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";
export const API_TIMEOUT = 30000; // 30 seconds

// ========================================
// USER ROLES
// ========================================
export const USER_ROLES = {
  CUSTOMER: "customer",
  BUSINESS_USER: "businessUser",
  DELIVERY_PARTNER: "deliveryPartner",
  ADMIN: "admin",
};

// Mobile app only supports customer role
export const MOBILE_SUPPORTED_ROLES = [USER_ROLES.CUSTOMER];

// ========================================
// ORDER STATUS
// ========================================
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PREPARING: "preparing",
  READY_FOR_DELIVERY: "readyForDelivery",
  OUT_FOR_DELIVERY: "outForDelivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  FAILED: "failed",
};

export const ORDER_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  readyForDelivery: "Ready for Delivery",
  outForDelivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Failed",
};

// ========================================
// PAYMENT STATUS
// ========================================
export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
};

export const PAYMENT_METHODS = {
  RAZORPAY: "razorpay",
  COD: "cod", // Cash on Delivery
};

// ========================================
// STORAGE KEYS
// ========================================
export const STORAGE_KEYS = {
  AUTH_TOKEN: "godrop-auth-token",
  REFRESH_TOKEN: "godrop-refresh-token",
  USER: "godrop-user",
  CART: "godrop-cart",
  ADDRESSES: "godrop-addresses",
  SELECTED_ADDRESS: "godrop-selected-address",
  CONFIG: "godrop-config",
  FILTERS: "godrop-filters",
};

// ========================================
// REGEX PATTERNS
// ========================================
export const REGEX = {
  PHONE: /^[6-9]\d{9}$/, // Indian phone number (10 digits, starts with 6-9)
  OTP: /^\d{6}$/, // 6-digit OTP
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email validation
  PINCODE: /^\d{6}$/, // Indian pincode (6 digits)
};

// ========================================
// LIMITS & DEFAULTS
// ========================================
export const LIMITS = {
  OTP_EXPIRY: 5 * 60 * 1000, // 5 minutes
  OTP_RESEND_COOLDOWN: 30 * 1000, // 30 seconds
  MAX_ADDRESS_LENGTH: 500,
  MIN_CART_AMOUNT: 50, // Minimum order amount in rupees
  MAX_GIFT_MESSAGE_LENGTH: 150,
  PRODUCTS_PER_PAGE: 12,
  ORDERS_PER_PAGE: 10,
};

// ========================================
// DELIVERY & PRICING
// ========================================
export const DELIVERY = {
  DEFAULT_FEE: 50, // Default delivery fee in rupees
  FREE_DELIVERY_THRESHOLD: 500, // Free delivery above this amount
  GIFT_WRAP_CHARGE: 30, // Gift wrap charge in rupees
};

// ========================================
// APP SETTINGS
// ========================================
export const APP_NAME = "GoDrop";
export const APP_VERSION = "1.0.0";

// Feature flags
export const FEATURES = {
  WALLET: false, // Not implemented in mobile
  REFERRAL: false, // Not implemented
  LOYALTY_POINTS: false, // Not implemented
  GIFT_WRAP: true, // Available in mobile
  COUPONS: true, // Available
  REAL_TIME_TRACKING: false, // No Socket.IO in mobile
};

// ========================================
// ERROR CODES
// ========================================
export const ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED", // 401
  FORBIDDEN: "FORBIDDEN", // 403
  NOT_FOUND: "NOT_FOUND", // 404
  VALIDATION_ERROR: "VALIDATION_ERROR", // 400
  INTERNAL_ERROR: "INTERNAL_ERROR", // 500
  TIMEOUT: "TIMEOUT",
  UNKNOWN: "UNKNOWN",
};

// ========================================
// TIME CONSTANTS
// ========================================
export const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
};

// ========================================
// SORT OPTIONS
// ========================================
export const SORT_OPTIONS = {
  NEWEST: { key: "createdAt", value: "desc", label: "Newest" },
  PRICE_LOW_TO_HIGH: {
    key: "price",
    value: "asc",
    label: "Price: Low to High",
  },
  PRICE_HIGH_TO_LOW: {
    key: "price",
    value: "desc",
    label: "Price: High to Low",
  },
  RATING: { key: "rating", value: "desc", label: "Rating" },
  POPULAR: { key: "popularity", value: "desc", label: "Most Popular" },
};

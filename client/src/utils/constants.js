/**
 * ========================================
 * APPLICATION CONSTANTS
 * ========================================
 */

// API Configuration
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Order Status Values
export const ORDER_STATUS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "OutForDelivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

// Payment Methods
export const PAYMENT_METHODS = {
  COD: "COD",
  RAZORPAY: "Razorpay",
};

// Customer Types
export const CUSTOMER_TYPES = {
  RETAIL: "Retail",
  BUSINESS: "Business",
};

// User Roles
export const ROLES = {
  CUSTOMER: "Customer",
  BUSINESS_USER: "BusinessUser",
  DELIVERY_PARTNER: "DeliveryPartner",
  ADMIN: "Admin",
};

// Verification Status
export const VERIFICATION_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

// Address Types
export const ADDRESS_TYPES = {
  HOME: "Home",
  WORK: "Work",
  OTHER: "Other",
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// Cart Configuration
export const CART_CONFIG = {
  HANDLING_CHARGE: 2, // No change, if still needed for other local calculations
  SMALL_CART_THRESHOLD: 100, // No change
  SMALL_CART_CHARGE: 20, // No change
};

// OTP Configuration
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_SECONDS: 300, // 5 minutes
  RESEND_COOLDOWN: 30, // 30 seconds
};

// File Upload Limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES_PRINT_ORDER: 10,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf", "image/jpeg", "image/png"],
};

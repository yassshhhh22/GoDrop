export const USER_ROLES = {
  ADMIN: 'Admin',
  CUSTOMER: 'Customer',
  DELIVERY_PARTNER: 'DeliveryPartner',
  BUSINESS_USER: 'BusinessUser', // ✅ NEW
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PICKED: 'picked',
  ARRIVING: 'arriving',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const ORDER_TYPES = {
  NORMAL: 'normal',
  PRINT: 'print',
};

export const PRINT_OPTIONS = {
  COLOR_TYPES: {
    BW: 'bw',
    COLOR: 'color',
  },
  PAGE_SIZES: {
    A4: 'A4',
  },
  PRINT_SIDES: {
    SINGLE: 'single-sided',
    DOUBLE: 'double-sided',
  },
  BINDING_TYPES: {
    NONE: 'none',
    STAPLED: 'stapled',
    SPIRAL: 'spiral',
  },
};

export const PAYMENT_METHODS = {
  RAZORPAY: 'razorpay',
  COD: 'cod',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 5,
  MAX_ATTEMPTS: 3,
};

export const VEHICLE_TYPES = {
  BIKE: 'Bike',
  SCOOTER: 'Scooter',
  BICYCLE: 'Bicycle',
};

export const DOCUMENT_STATUS = {
  PENDING: 'Pending',
  VERIFIED: 'Verified',
  REJECTED: 'Rejected',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const MESSAGES = {
  // Auth
  OTP_SENT: 'OTP sent successfully',
  OTP_VERIFIED: 'OTP verified successfully',
  INVALID_OTP: 'Invalid or expired OTP',
  MAX_ATTEMPTS_EXCEEDED: 'Maximum OTP attempts exceeded',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_CREDENTIALS: 'Invalid credentials',

  // Cart
  CART_UPDATED: 'Cart updated successfully',
  ITEM_ADDED: 'Item added to cart',
  ITEM_REMOVED: 'Item removed from cart',
  CART_CLEARED: 'Cart cleared',
  CART_EMPTY: 'Cart is empty',

  // Order
  ORDER_CREATED: 'Order created successfully',
  ORDER_UPDATED: 'Order updated successfully',
  ORDER_CANCELLED: 'Order cancelled successfully',
  ORDER_NOT_FOUND: 'Order not found',
  CANNOT_CANCEL_ORDER: 'Cannot cancel order at this stage',

  // Payment
  PAYMENT_SUCCESS: 'Payment successful',
  PAYMENT_FAILED: 'Payment failed',
  PAYMENT_VERIFIED: 'Payment verified',
  INVALID_SIGNATURE: 'Invalid payment signature',

  // Address
  ADDRESS_ADDED: 'Address added successfully',
  ADDRESS_UPDATED: 'Address updated successfully',
  ADDRESS_DELETED: 'Address deleted successfully',
  ADDRESS_NOT_FOUND: 'Address not found',
  DEFAULT_ADDRESS_SET: 'Default address updated',

  // Product
  PRODUCT_NOT_FOUND: 'Product not found',
  OUT_OF_STOCK: 'Product is out of stock',
  INSUFFICIENT_STOCK: 'Insufficient stock',

  // Coupon
  COUPON_APPLIED: 'Coupon applied successfully',
  INVALID_COUPON: 'Invalid or expired coupon code',
  COUPON_EXPIRED: 'This coupon has expired',
  COUPON_USAGE_LIMIT_REACHED: 'This coupon usage limit has been reached',
  COUPON_ALREADY_USED: 'You have already used this coupon',
  MIN_ORDER_NOT_MET: 'Minimum order amount not met for this coupon',
  FIRST_ORDER_ONLY: 'This coupon is valid only for first order',
  COUPON_REMOVED: 'Coupon removed',

  // Print Order
  PRINT_ORDER_CREATED: 'Print order created successfully',
  FILE_UPLOADED: 'File uploaded successfully',
  INVALID_FILE_TYPE: 'Invalid file type. Only PDF and images allowed',
  FILE_TOO_LARGE: 'File size exceeds 10MB limit',
};

export const COUPON_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
};

export const COUPON_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
};

export const VERIFICATION_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export const BUSINESS_CONFIG = {
  MIN_MOQ: 1,
  DEFAULT_MOQ: 10,
};

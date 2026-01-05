/**
 * Validation utilities for user inputs
 */
import { REGEX, LIMITS } from "./constants";

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number to validate
 * @returns {object} { isValid, error }
 */
export const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, error: "Phone number is required" };
  }

  const cleaned = phone.replace(/\D/g, "");

  if (!REGEX.PHONE.test(cleaned)) {
    return {
      isValid: false,
      error: "Invalid phone number. Enter a 10-digit number starting with 6-9",
    };
  }

  return { isValid: true };
};

/**
 * Validate OTP (6-digit)
 * @param {string} otp - OTP to validate
 * @returns {object} { isValid, error }
 */
export const validateOTP = (otp) => {
  if (!otp) {
    return { isValid: false, error: "OTP is required" };
  }

  if (!REGEX.OTP.test(otp)) {
    return { isValid: false, error: "OTP must be 6 digits" };
  }

  return { isValid: true };
};

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {object} { isValid, error }
 */
export const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }

  if (!REGEX.EMAIL.test(email)) {
    return { isValid: false, error: "Invalid email address" };
  }

  return { isValid: true };
};

/**
 * Validate name
 * @param {string} name - Name to validate
 * @param {number} minLength - Minimum length (default 2)
 * @returns {object} { isValid, error }
 */
export const validateName = (name, minLength = 2) => {
  if (!name) {
    return { isValid: false, error: "Name is required" };
  }

  if (name.trim().length < minLength) {
    return {
      isValid: false,
      error: `Name must be at least ${minLength} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Validate pincode (Indian format)
 * @param {string} pincode - Pincode to validate
 * @returns {object} { isValid, error }
 */
export const validatePincode = (pincode) => {
  if (!pincode) {
    return { isValid: false, error: "Pincode is required" };
  }

  if (!REGEX.PINCODE.test(pincode)) {
    return { isValid: false, error: "Pincode must be 6 digits" };
  }

  return { isValid: true };
};

/**
 * Validate address
 * @param {object} address - Address object
 * @returns {object} { isValid, errors }
 */
export const validateAddress = (address) => {
  const errors = {};

  if (!address.firstName || !address.firstName.trim()) {
    errors.firstName = "First name is required";
  }

  if (!address.lastName || !address.lastName.trim()) {
    errors.lastName = "Last name is required";
  }

  if (!address.phone || !address.phone.trim()) {
    errors.phone = "Phone number is required";
  } else {
    const phoneValidation = validatePhone(address.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error;
    }
  }

  if (!address.addressLine1 || !address.addressLine1.trim()) {
    errors.addressLine1 = "Address is required";
  }

  if (
    address.addressLine1 &&
    address.addressLine1.length > LIMITS.MAX_ADDRESS_LENGTH
  ) {
    errors.addressLine1 = `Address must be less than ${LIMITS.MAX_ADDRESS_LENGTH} characters`;
  }

  if (!address.city || !address.city.trim()) {
    errors.city = "City is required";
  }

  if (!address.state || !address.state.trim()) {
    errors.state = "State is required";
  }

  if (!address.pincode || !address.pincode.trim()) {
    errors.pincode = "Pincode is required";
  } else {
    const pincodeValidation = validatePincode(address.pincode);
    if (!pincodeValidation.isValid) {
      errors.pincode = pincodeValidation.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate gift message
 * @param {string} message - Gift message to validate
 * @returns {object} { isValid, error }
 */
export const validateGiftMessage = (message) => {
  if (!message) {
    return { isValid: true }; // Optional field
  }

  if (message.length > LIMITS.MAX_GIFT_MESSAGE_LENGTH) {
    return {
      isValid: false,
      error: `Message must be less than ${LIMITS.MAX_GIFT_MESSAGE_LENGTH} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Validate quantity
 * @param {number} quantity - Quantity to validate
 * @returns {object} { isValid, error }
 */
export const validateQuantity = (quantity) => {
  if (!quantity || isNaN(quantity)) {
    return { isValid: false, error: "Invalid quantity" };
  }

  if (quantity < 1) {
    return { isValid: false, error: "Quantity must be at least 1" };
  }

  if (!Number.isInteger(quantity)) {
    return { isValid: false, error: "Quantity must be a whole number" };
  }

  return { isValid: true };
};

/**
 * Validate order data before placing
 * @param {object} orderData - Order object
 * @returns {object} { isValid, errors }
 */
export const validateOrderData = (orderData) => {
  const errors = {};

  // Check if cart is empty
  if (!orderData.items || orderData.items.length === 0) {
    errors.items = "Cart is empty";
  }

  // Check delivery address
  if (!orderData.deliveryAddressId || !orderData.deliveryAddressId.trim()) {
    errors.deliveryAddress = "Delivery address is required";
  }

  // Check payment method
  if (!orderData.paymentMethod || !orderData.paymentMethod.trim()) {
    errors.paymentMethod = "Payment method is required";
  }

  // Check minimum amount
  if (orderData.subtotal < LIMITS.MIN_CART_AMOUNT) {
    errors.amount = `Minimum order amount is ₹${LIMITS.MIN_CART_AMOUNT}`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitize phone number (remove non-digits)
 * @param {string} phone - Phone number
 * @returns {string} Cleaned phone number
 */
export const sanitizePhone = (phone) => {
  return phone.replace(/\D/g, "").slice(-10); // Get last 10 digits
};

/**
 * Sanitize OTP (remove non-digits)
 * @param {string} otp - OTP
 * @returns {string} Cleaned OTP
 */
export const sanitizeOTP = (otp) => {
  return otp.replace(/\D/g, "").slice(0, 6); // Get first 6 digits
};

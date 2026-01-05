/**
 * ========================================
 * VALIDATION UTILITIES
 * ========================================
 */

/**
 * Validate phone number (Indian format)
 * @param {string} phone - Phone number
 * @returns {boolean}
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate email
 * @param {string} email - Email address
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate pincode (Indian 6-digit)
 * @param {string} pincode - Pincode
 * @returns {boolean}
 */
export const isValidPincode = (pincode) => {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};

/**
 * Validate GST number
 * @param {string} gst - GST number
 * @returns {boolean}
 */
export const isValidGST = (gst) => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
};

/**
 * Validate PAN number
 * @param {string} pan - PAN number
 * @returns {boolean}
 */
export const isValidPAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

/**
 * Validate OTP (6 digits)
 * @param {string} otp - OTP
 * @returns {boolean}
 */
export const isValidOTP = (otp) => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};

/**
 * Validate file size
 * @param {File} file - File object
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean}
 */
export const isValidFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

/**
 * Validate file type
 * @param {File} file - File object
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean}
 */
export const isValidFileType = (
  file,
  allowedTypes = ["image/jpeg", "image/png", "image/webp"]
) => {
  return allowedTypes.includes(file.type);
};

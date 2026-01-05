/**
 * ========================================
 * PRICE FORMATTING UTILITIES
 * ========================================
 */

/**
 * Format price in Indian Rupees
 * @param {number} price - Price to format
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price || 0);
};

/**
 * Calculate price after discount
 * @param {number} price - Original price
 * @param {number} discount - Discount percentage
 * @returns {number} Price after discount
 */
export const calculateDiscountedPrice = (price, discount = 0) => {
  if (!discount || discount <= 0) return price;

  const discountAmount = Math.ceil((Number(price) * Number(discount)) / 100);
  const finalPrice = Number(price) - discountAmount;

  return finalPrice;
};

/**
 * Calculate discount amount
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Price after discount
 * @returns {number} Discount amount
 */
export const calculateSavings = (originalPrice, discountedPrice) => {
  return Math.max(0, Number(originalPrice) - Number(discountedPrice));
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Price after discount
 * @returns {number} Discount percentage
 */
export const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
  if (!originalPrice || originalPrice <= 0) return 0;

  const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
  return Math.round(discount);
};

/**
 * Format price range
 * @param {number} min - Minimum price
 * @param {number} max - Maximum price
 * @returns {string} Formatted price range
 */
export const formatPriceRange = (min, max) => {
  return `${formatPrice(min)} - ${formatPrice(max)}`;
};

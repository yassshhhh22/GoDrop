import { BUSINESS_CONFIG } from '../config/constants.js';

/**
 * Get applicable price for a product based on customer type
 * @param {Object} product - Product object
 * @param {String} customerType - 'Customer' | 'BusinessUser'
 * @returns {Number} Applicable price
 */
export const getProductPrice = (product, customerType) => {
  if (customerType === 'BusinessUser' && product.businessPrice) {
    return product.businessPrice;
  }
  return product.discountPrice ;
};

/**
 * Get minimum order quantity for a product
 * @param {Object} product - Product object
 * @param {String} customerType - 'Customer' | 'BusinessUser'
 * @returns {Number} Minimum order quantity
 */
export const getMinOrderQuantity = (product, customerType) => {
  if (customerType === 'BusinessUser') {
    return product.moq || BUSINESS_CONFIG.DEFAULT_MOQ;
  }
  return 1; // Regular customers have no MOQ
};

/**
 * Validate if quantity meets MOQ requirement
 * @param {Number} quantity - Quantity to validate
 * @param {Object} product - Product object
 * @param {String} customerType - 'Customer' | 'BusinessUser'
 * @returns {Object} { valid: Boolean, message: String, requiredQty: Number }
 */
export const validateMOQ = (quantity, product, customerType) => {
  const moq = getMinOrderQuantity(product, customerType);

  if (quantity < moq) {
    return {
      valid: false,
      message: `Minimum order quantity for ${product.name} is ${moq}. You tried to add ${quantity}.`,
      requiredQty: moq,
    };
  }

  return {
    valid: true,
    message: 'Quantity meets requirements',
    requiredQty: moq,
  };
};

/**
 * Calculate savings for business user
 * @param {Object} product - Product object
 * @param {Number} quantity - Quantity ordered
 * @returns {Number} Total savings amount
 */
export const calculateBusinessSavings = (product, quantity) => {
  if (!product.businessPrice || !product.price) {
    return 0;
  }

  const savingsPerUnit = product.price - product.businessPrice;
  return savingsPerUnit * quantity;
};

/**
 * Format product response based on customer type
 * @param {Object} product - Product object
 * @param {String} customerType - 'Customer' | 'BusinessUser'
 * @returns {Object} Formatted product object
 */
export const formatProductForCustomer = (product, customerType) => {
  const productObj = product.toObject ? product.toObject() : product;

  if (customerType === 'BusinessUser') {
    return {
      ...productObj,
      price: productObj.businessPrice || productObj.price, // Show business price as main price
      moq: productObj.moq || BUSINESS_CONFIG.DEFAULT_MOQ,
      // Hide regular pricing from business users (Q4 - Option B)
      regularPrice: undefined,
      discountPrice: undefined,
    };
  }

  // Regular customers don't see business pricing or MOQ
  return {
    ...productObj,
    businessPrice: undefined,
    moq: undefined,
  };
};

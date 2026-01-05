// Auth validators
export {
  sendOTPValidator,
  verifyOTPValidator,
  refreshTokenValidator,
} from './auth.validator.js';

// Customer validators
export {
  updateProfileValidator,
  addAddressValidator,
  updateAddressValidator,
  addressIdValidator,
} from './customer.validator.js';

// Order validators
export {
  createOrderValidator,
  orderIdValidator,
  updateOrderStatusValidator,
  cancelOrderValidator,
  assignPartnerValidator,
} from './order.validator.js';

// Payment validators
export {
  createPaymentOrderValidator,
  verifyPaymentValidator,
  paymentFailureValidator,
  refundValidator,
  paymentIdValidator,
} from './payment.validator.js';

// Print order validators
export {
  createPrintOrderValidator,
  printOrderIdValidator,
  assignDeliveryPartnerValidator,
  updatePrintOrderStatusValidator,
} from './printorder.validator.js';

// Product validators
export {
  getAllProductsValidator,
  productIdValidator,
  searchProductsValidator,
  getProductsByCategoryValidator,
  getFeaturedProductsValidator,
} from './product.validator.js';

// Category validators
export {
  getAllCategoriesValidator,
  categoryIdValidator,
  getProductsInCategoryValidator,
} from './category.validator.js';

// Cart validators
export {
  addItemToCartValidator,
  updateCartItemValidator,
  removeCartItemValidator,
} from './cart.validator.js';

// Coupon validators
export {
  applyCouponValidator,
  validateCouponValidator,
  removeCouponValidator,
} from './coupon.validator.js';

export * from './deliveryPartner.validator.js';
export * from './branch.validator.js';

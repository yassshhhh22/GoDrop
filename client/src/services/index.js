/**
 * ========================================
 * CENTRALIZED SERVICE EXPORTS
 * ========================================
 */

// Auth Services
export {
  sendOTP,
  verifyOTP,
  refreshToken,
  getCurrentUser,
  logout,
} from "./auth.service";

// Customer Services
export {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "./customer.service";

// Business User Services
export {
  registerBusiness,
  getBusinessProfile,
  updateBusinessProfile,
  checkVerificationStatus,
} from "./businessUser.service";

// Product Services
export {
  getAllProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  getFeaturedProducts,
} from "./product.service";

// Category Services
export { getAllCategories, getCategoryById } from "./category.service";

// Cart Services
export {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "./cart.service";

// Coupon Services
export {
  getAvailableCoupons,
  applyCoupon,
  validateCoupon,
  removeCoupon,
} from "./coupon.service";

// Order Services
export {
  createOrder,
  getAllOrders,
  getOrderById,
  cancelOrder,
  trackOrder,
} from "./order.service";

// Print Order Services
export {
  createPrintOrder,
  getPrintOrders,
  getPrintOrderById,
} from "./printOrder.service";

// Payment Services
export {
  createRazorpayOrderOnly,
  verifyPaymentAndCreateOrder,
  createPaymentOrder, // deprecated
  verifyPayment, // deprecated
  handlePaymentFailure,
  getPaymentDetails,
} from "./payment.service";

// Location/Branch Services
export { getAllBranches, getBranchById } from "./location.service";

// Delivery Partner Services
export {
  getDeliveryOrders,
  updateOrderStatus,
  updateLocation,
  getEarnings,
} from "./deliveryPartner.service";

// Socket Services
export { connectSocket, disconnectSocket } from "./socket.service";

// Base API instance
export { default as api } from "./api";

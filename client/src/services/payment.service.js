import api from "./api";

/**
 * ========================================
 * PAYMENT SERVICES
 * ========================================
 */

/**
 * Create Razorpay order WITHOUT creating DB order
 * @route POST /api/payment/create-razorpay-order
 * @param {object} orderData - { deliveryAddress, paymentMethod }
 * @returns { razorpayOrderId, amount, currency }
 */
export const createRazorpayOrderOnly = async (orderData) => {
  const response = await api.post("/payment/create-razorpay-order", orderData);
  return response.data.data;
};

/**
 * Verify payment AND create DB order
 * @route POST /api/payment/verify-and-create-order
 */
export const verifyPaymentAndCreateOrder = async (paymentData) => {
  const response = await api.post("/payment/verify-and-create-order", paymentData);
  return response.data.data;
};

/**
 * @deprecated Use createRazorpayOrderOnly instead
 */
export const createPaymentOrder = async (orderId) => {
  const response = await api.post("/payment/create-order", { orderId });
  return response.data.data;
};

/**
 * @deprecated Use verifyPaymentAndCreateOrder instead
 */
export const verifyPayment = async (paymentData) => {
  const response = await api.post("/payment/verify", paymentData);
  return response.data.data;
};

/**
 * Handle payment failure
 * @route POST /api/payment/failure
 */
export const handlePaymentFailure = async (failureData) => {
  const response = await api.post("/payment/failure", failureData);
  return response.data.data;
};

/**
 * Get payment details
 * @route GET /api/payment/details/:paymentId
 */
export const getPaymentDetails = async (paymentId) => {
  const response = await api.get(`/payment/details/${paymentId}`);
  return response.data.data;
};

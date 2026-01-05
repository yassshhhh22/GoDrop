import api from "./api";

/**
 * ========================================
 * PAYMENT SERVICES (Mobile)
 * ========================================
 */

/**
 * Create Razorpay order for payment
 * @route POST /api/payments/create-order
 * @param {Object} paymentData
 * @param {number} paymentData.amount - Amount in paise (100 paise = 1 rupee)
 * @param {string} paymentData.orderId - GoDrop order ID
 * @returns { razorpayOrderId: string, amount: number, currency: 'INR' }
 */
export const createRazorpayOrder = async (paymentData) => {
  try {
    const response = await api.post("/payments/create-order", paymentData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Verify Razorpay payment after successful transaction
 * @route POST /api/payments/verify-payment
 * @param {Object} paymentDetails
 * @param {string} paymentDetails.razorpayPaymentId - Payment ID from Razorpay
 * @param {string} paymentDetails.razorpayOrderId - Order ID from Razorpay
 * @param {string} paymentDetails.razorpaySignature - Signature for verification
 * @param {string} paymentDetails.orderId - GoDrop order ID
 * @returns { payment: {}, order: {} }
 */
export const verifyPayment = async (paymentDetails) => {
  try {
    const response = await api.post("/payments/verify-payment", paymentDetails);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get payment history for user
 * @route GET /api/payments
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {string} params.status - Filter by status
 * @returns { payments: [], pagination: {} }
 */
export const getPaymentHistory = async (params = {}) => {
  try {
    const response = await api.get("/payments", { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get payment details for specific order
 * @route GET /api/payments/:orderId
 * @param {string} orderId - Order MongoDB ID
 * @returns { payment: {} }
 */
export const getPaymentByOrderId = async (orderId) => {
  try {
    const response = await api.get(`/payments/${orderId}`);
    return response.data.data.payment;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Refund payment for cancelled order
 * @route POST /api/payments/refund
 * @param {Object} refundData
 * @param {string} refundData.orderId - Order ID
 * @param {string} refundData.paymentId - Payment ID
 * @returns { refund: {} }
 */
export const requestRefund = async (refundData) => {
  try {
    const response = await api.post("/payments/refund", refundData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Check payment status
 * @route GET /api/payments/status/:paymentId
 * @param {string} paymentId - Razorpay payment ID
 * @returns { status: string, payment: {} }
 */
export const checkPaymentStatus = async (paymentId) => {
  try {
    const response = await api.get(`/payments/status/${paymentId}`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get available payment methods
 * @route GET /api/payments/methods
 * @returns { methods: [] }
 */
export const getPaymentMethods = async () => {
  try {
    const response = await api.get("/payments/methods");
    return response.data.data.methods;
  } catch (error) {
    throw error.response?.data || error;
  }
};

import api from "./api";

/**
 * ========================================
 * ORDER SERVICES (Mobile)
 * ========================================
 */

/**
 * Create new order from cart
 * @route POST /api/orders/create
 * @param {Object} orderData - Order details
 * @returns { orderId, status, totalPrice, ... }
 */
export const createOrder = async (orderData) => {
  try {
    const response = await api.post("/orders/create", orderData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all orders of current user
 * @route GET /api/orders
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.status - Filter by status
 * @returns { orders: [], pagination: {} }
 */
export const getOrders = async (params = {}) => {
  try {
    const response = await api.get("/orders", { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get single order details
 * @route GET /api/orders/:orderId
 * @param {string} orderId - Order MongoDB ID
 * @returns { order: {} }
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data.order;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get order tracking information (real-time location)
 * @route GET /api/orders/:orderId/track
 * @param {string} orderId - Order MongoDB ID
 * @returns { order: {}, tracking: {}, deliveryPartner: {} }
 */
export const trackOrder = async (orderId) => {
  try {
    console.log("🔍 Tracking order:", orderId);
    const response = await api.get(`/orders/${orderId}/track`);
    console.log("✅ Track response:", response.data);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Cancel order
 * @route POST /api/orders/:orderId/cancel
 * @param {string} orderId - Order MongoDB ID
 * @param {string} reason - Cancellation reason
 * @returns { orderId, status, cancellationReason }
 */
export const cancelOrder = async (orderId, reason = "") => {
  try {
    const response = await api.post(`/orders/${orderId}/cancel`, { reason });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

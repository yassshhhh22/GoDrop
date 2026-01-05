import api from "./api";

/**
 * ========================================
 * ORDER SERVICES
 * ========================================
 */

/**
 * Create order from cart
 * @route POST /api/orders/create
 * @returns { orderId, status, totalPrice, ... }
 */
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders/create', orderData);
    // ✅ Response should NOT contain tax field
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all orders (filtered by role)
 * @route GET /api/orders
 */
export const getAllOrders = async (params = {}) => {
  const response = await api.get("/orders", { params });
  return response.data.data; // ✅ Returns { orders: [], pagination: {} }
};

/**
 * Get order by ID
 * @route GET /api/orders/:orderId
 */
export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data.data.order; // ✅ Access nested 'order'
};

/**
 * Cancel order
 * @route POST /api/orders/:orderId/cancel
 */
export const cancelOrder = async (orderId, reason) => {
  const response = await api.post(`/orders/${orderId}/cancel`, { reason });

  // ✅ Backend returns { data: { orderId, status, cancellationReason } }
  return response.data.data;
};

/**
 * Track order (real-time location)
 * @route GET /api/orders/:orderId/track
 */
export const trackOrder = async (orderId) => {
  // ✅ Add debug logging
  console.log("🔍 Tracking order:", orderId);

  const response = await api.get(`/orders/${orderId}/track`);

  console.log("✅ Track response:", response.data);

  return response.data.data;
};

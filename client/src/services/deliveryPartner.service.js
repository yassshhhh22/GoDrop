import api from "./api";

/**
 * ========================================
 * DELIVERY PARTNER SERVICES
 * ========================================
 */

/**
 * Get assigned orders
 * @route GET /api/delivery/orders
 * @returns { orders: [], pagination: {} }
 */
export const getDeliveryOrders = async (params = {}) => {
  const response = await api.get("/delivery/orders", { params });
  return response.data.data; // ✅ Correct
};

/**
 * Update order status
 * @route PUT /api/delivery/orders/:orderId/status
 * @returns Updated order
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.put(`/delivery/orders/${orderId}/status`, {
    status,
  });
  // ✅ FIXED: Backend returns { data: { order: {...} } }
  return response.data.data.order;
};

/**
 * Update live location
 * @route PUT /api/delivery/location
 * @returns Success response
 */
export const updateLocation = async (latitude, longitude) => {
  const response = await api.put("/delivery/location", { latitude, longitude });
  return response.data.data; // ✅ Correct
};

/**
 * Get delivery earnings
 * @route GET /api/delivery/earnings
 * @returns Earnings data
 */
export const getEarnings = async (params = {}) => {
  const response = await api.get("/delivery/earnings", { params });
  return response.data.data; // ✅ Correct
};

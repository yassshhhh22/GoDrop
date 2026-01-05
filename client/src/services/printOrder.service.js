import api from "./api";

/**
 * ========================================
 * PRINT ORDER SERVICES
 * ========================================
 */

/**
 * Create print order
 * @route POST /api/print-orders
 * @returns Order object
 */
export const createPrintOrder = async (formData) => {
  const response = await api.post("/print-orders", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  // ✅ FIXED: Backend returns order details directly in the data object.
  return response.data.data;
};

/**
 * Get all print orders
 * @route GET /api/print-orders
 * @returns { orders: [], pagination: {} }
 */
export const getPrintOrders = async (params = {}) => {
  const response = await api.get("/print-orders", { params });
  return response.data.data; // ✅ Correct - returns { orders, pagination }
};

/**
 * Get print order by ID
 * @route GET /api/print-orders/:orderId
 * @returns Order object
 */
export const getPrintOrderById = async (orderId) => {
  const response = await api.get(`/print-orders/${orderId}`);
  // ✅ FIXED: Backend returns the order object directly in the data object.
  return response.data.data;
};

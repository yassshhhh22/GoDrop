import api from "./api";

/**
 * ========================================
 * CART SERVICES
 * ========================================
 */

/**
 * Get user's cart
 * @route GET /api/cart
 * @returns Cart object with items
 */
export const getCart = async () => {
  const response = await api.get("/cart");
  // ✅ FIX: Backend returns data.data with cart properties directly, not data.data.cart
  return response.data.data;
};

/**
 * Add item to cart
 * @route POST /api/cart/add
 * @returns Updated cart
 */
export const addToCart = async (productId, count = 1) => {
  console.log("📡 Cart Service: Sending request", {
    endpoint: "/cart/add",
    payload: { item: productId, count },
  });

  try {
    const response = await api.post("/cart/add", {
      item: productId,
      count,
    });

    console.log("✅ Cart Service: Response received", {
      status: response.status,
      data: response.data,
    });

    // ✅ FIX: Return the cart object directly from data.data
    return response.data.data;
  } catch (error) {
    console.error("❌ Cart Service: Request failed", {
      status: error.response?.status,
      message: error.response?.data?.message,
      data: error.response?.data,
    });
    throw error;
  }
};

/**
 * Update cart item quantity
 * @route PUT /api/cart/update/:itemId
 * @returns Updated cart
 */
export const updateCartItem = async (itemId, count) => {
  const response = await api.put(`/cart/update/${itemId}`, { count });
  // ✅ FIX: Return cart object directly
  return response.data.data;
};

/**
 * Remove item from cart
 * @route DELETE /api/cart/remove/:itemId
 * @returns Updated cart
 */
export const removeCartItem = async (itemId) => {
  const response = await api.delete(`/cart/remove/${itemId}`);
  // ✅ FIX: Return cart object directly
  return response.data.data;
};

/**
 * Clear entire cart
 * @route DELETE /api/cart/clear
 * @returns null
 */
export const clearCart = async () => {
  const response = await api.delete("/cart/clear");
  // ✅ FIX: Return cart object directly
  return response.data.data;
};

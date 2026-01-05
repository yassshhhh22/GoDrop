import api from "./api";

/**
 * ========================================
 * CART SERVICES (Mobile)
 * ========================================
 */

/**
 * Get user's cart
 * @route GET /api/cart
 * @returns { items: [], total: 0, discount: 0, subTotal: 0 }
 */
export const getCart = async () => {
  try {
    const response = await api.get("/cart");
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Add item to cart
 * @route POST /api/cart/add
 * @param {string} productId - Product MongoDB ID
 * @param {number} count - Quantity (default: 1)
 * @returns Updated cart object
 */
export const addToCart = async (productId, count = 1) => {
  try {
    const response = await api.post("/cart/add", {
      item: productId,
      count,
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update item quantity in cart
 * @route PUT /api/cart/update/:itemId
 * @param {string} itemId - Product/Item MongoDB ID
 * @param {number} count - New quantity
 * @returns Updated cart object
 */
export const updateCartItem = async (itemId, count) => {
  try {
    const response = await api.put(`/cart/update/${itemId}`, { count });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Remove item from cart
 * @route DELETE /api/cart/remove/:itemId
 * @param {string} itemId - Product/Item MongoDB ID
 * @returns Updated cart object
 */
export const removeFromCart = async (itemId) => {
  try {
    const response = await api.delete(`/cart/remove/${itemId}`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Clear entire cart
 * @route DELETE /api/cart/clear
 * @returns { message: 'Cart cleared' }
 */
export const clearCart = async () => {
  try {
    const response = await api.delete("/cart/clear");
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Apply coupon to cart
 * @route POST /api/cart/apply-coupon
 * @param {string} code - Coupon code
 * @returns Updated cart with discount applied
 */
export const applyCoupon = async (code) => {
  try {
    const response = await api.post("/cart/apply-coupon", { code });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Remove coupon from cart
 * @route POST /api/cart/remove-coupon
 * @returns Updated cart without discount
 */
export const removeCoupon = async () => {
  try {
    const response = await api.post("/cart/remove-coupon");
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get cart count (number of items)
 * @route GET /api/cart/count
 * @returns { count: number }
 */
export const getCartCount = async () => {
  try {
    const response = await api.get("/cart/count");
    return response.data.data.count;
  } catch (error) {
    throw error.response?.data || error;
  }
};

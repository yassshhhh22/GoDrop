import api from "./api";

/**
 * ========================================
 * COUPON SERVICES
 * ========================================
 */

/**
 * Get available coupons for user
 * @route GET /api/coupons/available
 * @returns { coupons: [] }
 */
export const getAvailableCoupons = async () => {
  const response = await api.get("/coupons/available");
  // ✅ FIXED: Backend returns { data: { coupons: [...] } }
  return response.data.data.coupons;
};

/**
 * Apply coupon to cart
 * @route POST /api/coupons/apply
 * @param {string} code - Coupon code
 * @returns { coupon: {}, pricing: {} }
 */
export const applyCoupon = async (code) => {
  const response = await api.post("/coupons/apply", { code });
  // ✅ Backend returns { coupon, pricing }
  return response.data.data;
};

/**
 * Validate coupon code
 * @route POST /api/coupons/validate
 * @param {string} code - Coupon code
 * @returns { valid: boolean, message: string, discount?: number }
 */
export const validateCoupon = async (code) => {
  const response = await api.post("/coupons/validate", { code });
  // ✅ Backend returns { valid, message, discount }
  return response.data.data;
};

/**
 * Remove coupon from cart
 * @route DELETE /api/coupons/remove
 * @returns null
 */
export const removeCoupon = async () => {
  const response = await api.delete("/coupons/remove");
  return response.data.data; // null
};

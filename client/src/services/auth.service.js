import api from "./api";

/**
 * ========================================
 * AUTHENTICATION SERVICES
 * ========================================
 */

/**
 * Send OTP to phone number
 * @route POST /api/auth/send-otp
 */
export const sendOTP = async (phone, role) => {
  const response = await api.post("/auth/send-otp", { phone, role });
  return response.data.data;
};

/**
 * Verify OTP and login
 * @route POST /api/auth/verify-otp
 * @returns { user, accessToken, refreshToken, needsRegistration? }
 */
export const verifyOTP = async (phone, otp, role) => {
  const response = await api.post("/auth/verify-otp", { phone, otp, role });
  return response.data.data;
};

/**
 * ✅ Refresh access token
 * @route POST /api/auth/refresh-token
 * @param {string} refreshToken - The refresh token
 */
export const refreshToken = async (refreshToken) => {
  const response = await api.post("/auth/refresh-token", { refreshToken });
  return response.data.data; // { accessToken, refreshToken }
};

/**
 * Get current logged-in user
 * @route GET /api/auth/me
 */
export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data.data.user;
};

/**
 * Logout user
 * @route POST /api/auth/logout
 */
export const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

/**
 * Complete customer profile (first-time users)
 * @param {Object} profileData - { name, email }
 * @returns {Promise<Object>} Updated user
 */
export const completeProfile = async (profileData) => {
  const response = await api.put("/customers/profile", profileData);
  return response.data.data.customer;
};

/**
 * Register business user
 * @param {Object} businessData - Company details, GST, etc.
 * @returns {Promise<Object>}
 */
export const registerBusiness = async (businessData) => {
  const response = await api.post("/business/register", businessData);
  return response.data.data.businessUser;
};

import api from "./api";

/**
 * ========================================
 * CUSTOMER SERVICES (Mobile)
 * ========================================
 */

/**
 * Get customer profile
 * @route GET /api/customer/profile
 * @returns { user, addresses, ... }
 */
export const getProfile = async () => {
  try {
    const response = await api.get("/customer/profile");
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update customer profile
 * @route PUT /api/customer/profile
 * @param {Object} profileData
 * @returns Updated user profile
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put("/customer/profile", profileData);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all addresses
 * @route GET /api/customer/addresses
 * @returns { addresses: [] }
 */
export const getAddresses = async () => {
  try {
    const response = await api.get("/customer/addresses");
    return response.data.data.addresses || [];
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Add new address
 * @route POST /api/customer/addresses
 * @param {Object} addressData
 * @returns { address: {} }
 */
export const addAddress = async (addressData) => {
  try {
    const response = await api.post("/customer/addresses", addressData);
    return response.data.data.address;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update address
 * @route PUT /api/customer/addresses/:addressId
 * @param {string} addressId
 * @param {Object} addressData
 * @returns { address: {} }
 */
export const updateAddress = async (addressId, addressData) => {
  try {
    const response = await api.put(
      `/customer/addresses/${addressId}`,
      addressData
    );
    return response.data.data.address;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete address
 * @route DELETE /api/customer/addresses/:addressId
 * @param {string} addressId
 * @returns { message: 'Address deleted' }
 */
export const deleteAddress = async (addressId) => {
  try {
    const response = await api.delete(`/customer/addresses/${addressId}`);
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Set default address
 * @route PUT /api/customer/addresses/:addressId/default
 * @param {string} addressId
 * @returns { address: {} }
 */
export const setDefaultAddress = async (addressId) => {
  try {
    const response = await api.put(`/customer/addresses/${addressId}/default`);
    return response.data.data.address;
  } catch (error) {
    throw error.response?.data || error;
  }
};

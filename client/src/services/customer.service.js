import api from "./api";

/**
 * ========================================
 * CUSTOMER PROFILE & ADDRESS SERVICES
 * ========================================
 */

// ---------- Profile ----------
/**
 * Get customer profile
 * @route GET /api/customers/profile
 * @returns Customer object with addresses
 */
export const getProfile = async () => {
  const response = await api.get("/customers/profile");
  // ✅ FIXED: Backend returns { data: { customer: {...} } }
  return response.data.data.customer;
};

/**
 * Update customer profile
 * @route PUT /api/customers/profile
 * @returns Updated customer object
 */
export const updateProfile = async (profileData) => {
  const response = await api.put("/customers/profile", profileData);
  // ✅ FIXED: Backend returns { data: { customer: {...} } }
  return response.data.data.customer;
};

// ---------- Address Management ----------
/**
 * Add new address
 * @route POST /api/customers/address
 * @returns New address object
 */
export const addAddress = async (addressData) => {
  const response = await api.post("/customers/address", addressData);
  // ✅ FIXED: Backend returns { data: { address: {...} } }
  return response.data.data.address;
};

/**
 * Update existing address
 * @route PUT /api/customers/address/:addressId
 * @returns Updated address object
 */
export const updateAddress = async (addressId, addressData) => {
  const response = await api.put(
    `/customers/address/${addressId}`,
    addressData
  );
  // ✅ FIXED: Backend returns { data: { address: {...} } }
  return response.data.data.address;
};

/**
 * Delete address
 * @route DELETE /api/customers/address/:addressId
 * @returns null (backend returns data: null)
 */
export const deleteAddress = async (addressId) => {
  const response = await api.delete(`/customers/address/${addressId}`);
  return response.data.data; // null
};

/**
 * Set default address
 * @route PUT /api/customers/address/:addressId/default
 * @returns Updated address object
 */
export const setDefaultAddress = async (addressId) => {
  const response = await api.put(`/customers/address/${addressId}/default`);
  // ✅ FIXED: Backend returns { data: { address: {...} } }
  return response.data.data.address;
};

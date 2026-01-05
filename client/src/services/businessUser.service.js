import api from "./api";

/**
 * Complete business registration (after OTP verification)
 * @route POST /api/business-users/register
 */
export const registerBusiness = async (businessData) => {
  const response = await api.post("/business-users/register", businessData);
  return response.data.data.user;
};

/**
 * Get business profile
 * @route GET /api/business-users/profile
 */
export const getBusinessProfile = async () => {
  const response = await api.get("/business-users/profile");
  return response.data.data.user;
};

/**
 * Update business profile (re-apply if rejected)
 * @route PUT /api/business-users/profile
 */
export const updateBusinessProfile = async (businessData) => {
  const response = await api.put("/business-users/profile", businessData);
  return response.data.data.user;
};

/**
 * Check business verification status
 * @route GET /api/business-users/verification-status
 */
export const checkVerificationStatus = async () => {
  const response = await api.get("/business-users/verification-status");
  return response.data.data;
};

/**
 * Update registered delivery address
 * @route PUT /api/business-users/profile/address
 */
export const updateRegisteredAddress = async (addressData) => {
  const response = await api.put("/business-users/profile/address", {
    registeredAddress: addressData,
  });
  return response.data.data.registeredAddress;
};

import api from "./api";

/**
 * ========================================
 * BRANCH/STORE SERVICES
 * ========================================
 */

/**
 * Get all branches
 * @route GET /api/branches
 */
export const getAllBranches = async (params = {}) => {
  const response = await api.get("/branches", { params });
  return response.data.data;
};

/**
 * Get branch by ID
 * @route GET /api/branches/:id
 */
export const getBranchById = async (branchId) => {
  const response = await api.get(`/branches/${branchId}`);
  return response.data.data;
};

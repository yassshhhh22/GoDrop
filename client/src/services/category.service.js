import api from "./api";

/**
 * Get all categories
 * @route GET /api/categories
 */
export const getAllCategories = async () => {
  const response = await api.get("/categories");

  // ✅ FIX: Backend returns { success: true, data: { categories: [...], count: 10 } }
  // Return the categories array directly
  return response.data.data.categories || [];
};

/**
 * Get category by ID
 * @route GET /api/categories/:id
 */
export const getCategoryById = async (categoryId) => {
  const response = await api.get(`/categories/${categoryId}`);

  // ✅ Backend returns: { success: true, data: { _id, name, ... } }
  return response.data.data;
};

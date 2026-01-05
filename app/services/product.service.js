import api from "./api";

/**
 * ========================================
 * PRODUCT SERVICES (Mobile)
 * ========================================
 */

/**
 * Get all products with pagination
 * @route GET /api/products
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.search - Search query
 * @param {string} params.category - Category filter
 * @param {string} params.sortBy - Sort field
 * @returns { products: [], pagination: {} }
 */
export const getAllProducts = async (params = {}) => {
  try {
    const response = await api.get("/products", { params });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get single product by ID
 * @route GET /api/products/:id
 * @param {string} productId - Product MongoDB ID
 * @returns { product: {} }
 */
export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data.data.product;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Search products by query
 * @route GET /api/products/search
 * @param {string} query - Search term
 * @param {Object} params - Additional query params
 * @returns { products: [], pagination: {} }
 */
export const searchProducts = async (query, params = {}) => {
  try {
    const response = await api.get("/products/search", {
      params: { q: query, ...params },
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get products by category
 * @route GET /api/products/category/:categoryId
 * @param {string} categoryId - Category MongoDB ID
 * @param {Object} params - Query parameters
 * @returns { products: [], category: {}, pagination: {} }
 */
export const getProductsByCategory = async (categoryId, params = {}) => {
  try {
    const response = await api.get(`/products/category/${categoryId}`, {
      params,
    });
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all categories
 * @route GET /api/categories
 * @returns { categories: [] }
 */
export const getCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data.data.categories;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get single category by ID
 * @route GET /api/categories/:id
 * @param {string} categoryId - Category MongoDB ID
 * @returns { category: {} }
 */
export const getCategoryById = async (categoryId) => {
  try {
    const response = await api.get(`/categories/${categoryId}`);
    return response.data.data.category;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get featured/trending products
 * @route GET /api/products/trending
 * @returns { products: [] }
 */
export const getTrendingProducts = async () => {
  try {
    const response = await api.get("/products/trending");
    return response.data.data.products;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get product recommendations based on user
 * @route GET /api/products/recommendations
 * @returns { products: [] }
 */
export const getRecommendations = async () => {
  try {
    const response = await api.get("/products/recommendations");
    return response.data.data.products;
  } catch (error) {
    throw error.response?.data || error;
  }
};

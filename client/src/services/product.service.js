import api from "./api";

/**
 * Get all products
 * @route GET /api/products
 */
export const getAllProducts = async (params = {}) => {
  const response = await api.get("/products", { params });

  // ✅ Backend returns { data: { products: [], pagination: {} } }
  return response.data.data;
};

/**
 * Get product by ID
 * @route GET /api/products/:id
 */
export const getProductById = async (productId) => {
  const response = await api.get(`/products/${productId}`);

  // ✅ Backend returns { data: { product: {...} } }
  return response.data.data.product;
};

/**
 * Search products
 * @route GET /api/products/search
 */
export const searchProducts = async (query, params = {}) => {
  const response = await api.get("/products/search", {
    params: { q: query, ...params },
  });

  // ✅ Backend returns { data: { products: [], pagination: {} } }
  return response.data.data;
};

/**
 * Get products by category
 * @route GET /api/products/category/:categoryId
 */
export const getProductsByCategory = async (categoryId, params = {}) => {
  const response = await api.get(`/products/category/${categoryId}`, {
    params,
  });

  // ✅ Backend returns { data: { products: [], category: {}, pagination: {} } }
  return response.data.data;
};

/**
 * Get featured products
 * @route GET /api/products/featured
 */
export const getFeaturedProducts = async (params = {}) => {
  const response = await api.get("/products/featured", { params });

  // ✅ Backend returns { data: { products: [], count: 10 } }
  return response.data.data;
};

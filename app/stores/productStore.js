import { create } from "zustand";
import * as productService from "../services/product.service";
import * as categoryService from "../services/category.service";

/**
 * Product Store
 * Manages products, categories, and search
 */
const useProductStore = create((set, get) => ({
  // ========================================
  // STATE
  // ========================================
  categories: [],
  products: [],
  featuredProducts: [],
  selectedCategory: null,
  selectedProduct: null,
  searchResults: [],
  searchQuery: "",

  currentPage: 1,
  totalPages: 1,
  limit: 12,

  filters: {
    minPrice: 0,
    maxPrice: 10000,
    inStock: true,
    sortBy: "createdAt",
    sortOrder: "desc",
  },

  loading: false,
  error: null,

  // ========================================
  // CATEGORY ACTIONS
  // ========================================

  /**
   * Fetch all categories
   */
  fetchCategories: async () => {
    try {
      set({ loading: true, error: null });
      const categories = await categoryService.getCategories();

      set({
        categories: categories || [],
        loading: false,
      });
    } catch (error) {
      console.error("❌ Failed to fetch categories:", error);
      set({
        error: error.message,
        loading: false,
        categories: [],
      });
    }
  },

  /**
   * Get category by ID
   */
  getCategoryById: async (categoryId) => {
    try {
      const category = await categoryService.getCategoryById(categoryId);
      return category;
    } catch (error) {
      console.error("❌ Failed to get category:", error);
      return null;
    }
  },

  /**
   * Set selected category
   */
  setSelectedCategory: (categoryId) => {
    set({ selectedCategory: categoryId });
  },

  // ========================================
  // PRODUCT ACTIONS
  // ========================================

  /**
   * Fetch all products with filters
   */
  fetchProducts: async (params = {}) => {
    try {
      set({ loading: true, error: null });

      const { filters, currentPage, limit } = get();

      const response = await productService.getAllProducts({
        page: currentPage,
        limit,
        ...filters,
        ...params,
      });

      set({
        products: response.products || [],
        totalPages: response.pagination?.totalPages || 1,
        currentPage: response.pagination?.currentPage || 1,
        loading: false,
      });
    } catch (error) {
      console.error("❌ Failed to fetch products:", error);
      set({ loading: false, error: error.message, products: [] });
    }
  },

  /**
   * Fetch featured products
   */
  fetchFeaturedProducts: async () => {
    try {
      set({ loading: true, error: null });

      const products = await productService.getFeaturedProducts();

      set({
        featuredProducts: products || [],
        loading: false,
      });

      return products;
    } catch (error) {
      console.error("❌ Failed to fetch featured products:", error);
      set({ loading: false, error: error.message, featuredProducts: [] });
      return [];
    }
  },

  /**
   * Fetch products by category
   */
  fetchProductsByCategory: async (categoryId, params = {}) => {
    try {
      set({ loading: true, error: null, selectedCategory: categoryId });

      const { filters, limit } = get();

      const response = await productService.getProductsByCategory(categoryId, {
        limit,
        ...filters,
        ...params,
      });

      set({
        products: response.products || [],
        totalPages: response.pagination?.totalPages || 1,
        currentPage: response.pagination?.currentPage || 1,
        loading: false,
      });

      return response;
    } catch (error) {
      console.error("❌ Failed to fetch category products:", error);
      set({ loading: false, error: error.message, products: [] });
      return { products: [] };
    }
  },

  /**
   * Get product by ID
   */
  fetchProductById: async (productId) => {
    try {
      set({ loading: true, error: null });

      const product = await productService.getProductById(productId);

      set({
        selectedProduct: product,
        loading: false,
      });

      return product;
    } catch (error) {
      console.error("❌ Failed to fetch product:", error);
      set({ loading: false, error: error.message });
      return null;
    }
  },

  /**
   * Search products
   */
  searchProducts: async (query, params = {}) => {
    try {
      if (!query.trim()) {
        set({ searchResults: [], searchQuery: "" });
        return;
      }

      set({ loading: true, error: null, searchQuery: query });

      const response = await productService.searchProducts(query, {
        limit: 20,
        ...params,
      });

      set({
        searchResults: response.products || [],
        loading: false,
      });

      return response;
    } catch (error) {
      console.error("❌ Failed to search products:", error);
      set({ loading: false, error: error.message, searchResults: [] });
      return { products: [] };
    }
  },

  /**
   * Fetch featured products
   */
  fetchFeaturedProducts: async () => {
    try {
      set({ loading: true, error: null });

      const response = await productService.getFeaturedProducts();

      set({
        featuredProducts: response.products || response || [],
        loading: false,
      });
    } catch (error) {
      console.error("❌ Failed to fetch featured products:", error);
      set({ loading: false, error: error.message });
    }
  },

  /**
   * Clear search results
   */
  clearSearch: () => {
    set({ searchResults: [], searchQuery: "" });
  },

  /**
   * Update filters
   */
  setFilters: (newFilters) => {
    set({ filters: { ...get().filters, ...newFilters }, currentPage: 1 });
  },

  /**
   * Set current page
   */
  setCurrentPage: (page) => {
    set({ currentPage: page });
  },

  /**
   * Clear selected product
   */
  clearSelectedProduct: () => {
    set({ selectedProduct: null });
  },
}));

export default useProductStore;

import { create } from "zustand";
import * as productService from "../services/product.service";
import * as categoryService from "../services/category.service";
import toast from "react-hot-toast";

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

      const categories = await categoryService.getAllCategories();

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
      toast.error("Failed to load category");
      return null;
    }
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
      set({ loading: false, error: error.message });
      toast.error("Product not found");
      return null;
    }
  },

  /**
   * Search products
   */
  searchProducts: async (query, params = {}) => {
    try {
      set({ loading: true, error: null, searchQuery: query });

      const response = await productService.searchProducts(query, params);

      // ✅ FIX: Access nested pagination
      set({
        searchResults: response.products,
        totalPages: response.pagination?.totalPages || 1,
        currentPage: response.pagination?.page || 1,
        loading: false,
      });
    } catch (error) {
      set({ loading: false, error: error.message });
      toast.error("Search failed");
    }
  },

  /**
   * Fetch featured products
   */
  fetchFeaturedProducts: async () => {
    try {
      const response = await productService.getFeaturedProducts({ limit: 10 });

      set({
        featuredProducts: response.products || [],
      });
    } catch (error) {
      console.error("❌ Failed to fetch featured products:", error);
    }
  },

  // ========================================
  // FILTER ACTIONS
  // ========================================

  /**
   * Update filters
   */
  setFilters: (newFilters) => {
    set({
      filters: { ...get().filters, ...newFilters },
      currentPage: 1, // Reset to page 1
    });
    get().fetchProducts();
  },

  /**
   * Reset filters
   */
  resetFilters: () => {
    set({
      filters: {
        minPrice: 0,
        maxPrice: 10000,
        inStock: true,
        sortBy: "createdAt",
        sortOrder: "desc",
      },
      currentPage: 1,
    });
    get().fetchProducts();
  },

  // ========================================
  // PAGINATION
  // ========================================

  setPage: (page) => {
    set({ currentPage: page });
    get().fetchProducts();
  },

  nextPage: () => {
    const { currentPage, totalPages } = get();
    if (currentPage < totalPages) {
      get().setPage(currentPage + 1);
    }
  },

  prevPage: () => {
    const { currentPage } = get();
    if (currentPage > 1) {
      get().setPage(currentPage - 1);
    }
  },

  // ========================================
  // UTILITIES
  // ========================================

  clearSearch: () => {
    set({ searchResults: [], searchQuery: "" });
  },

  clearSelectedProduct: () => {
    set({ selectedProduct: null });
  },

  clearProducts: () => {
    set({ products: [] });
  },
}));

export default useProductStore;

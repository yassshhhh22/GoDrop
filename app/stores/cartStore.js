import { create } from "zustand";
import * as cartService from "../services/cart.service";
import useAuthStore from "./authStore";

/**
 * Cart Store
 * Manages shopping cart items and operations
 */
const useCartStore = create((set, get) => ({
  // ========================================
  // STATE
  // ========================================
  items: [],
  isLoading: false,
  isSyncing: false,
  error: null,

  // Backend calculated values
  subtotal: 0,
  totalItems: 0,
  appliedCoupon: null,
  couponDiscount: 0,

  // Gift wrap state
  giftWrap: {
    enabled: false,
    message: "",
  },

  // ========================================
  // CART ACTIONS
  // ========================================

  /**
   * Fetch cart from backend
   */
  fetchCart: async () => {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      set({
        items: [],
        subtotal: 0,
        totalItems: 0,
        appliedCoupon: null,
        couponDiscount: 0,
        giftWrap: { enabled: false, message: "" },
      });
      return;
    }

    try {
      set({ isLoading: true, error: null });
      const cartData = await cartService.getCart();

      set({
        items: cartData.items || [],
        subtotal: cartData.subtotal || cartData.total || 0,
        totalItems: cartData.totalItems || cartData.items?.length || 0,
        appliedCoupon: cartData.appliedCoupon || null,
        couponDiscount: cartData.couponDiscount || 0,
        isLoading: false,
      });
    } catch (error) {
      console.error("❌ Failed to fetch cart:", error);
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Add item to cart
   */
  addItem: async (productId, quantity = 1) => {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      // Guest cart - add to local state only
      const { items } = get();
      const existingItem = items.find((item) => item._id === productId);

      if (existingItem) {
        set({
          items: items.map((item) =>
            item._id === productId
              ? { ...item, count: item.count + quantity }
              : item
          ),
        });
      } else {
        // When adding new item in guest mode, assume basic product structure
        set({
          items: [...items, { _id: productId, count: quantity }],
        });
      }
      return;
    }

    // Authenticated cart - sync with backend
    try {
      set({ isLoading: true, error: null });
      const data = await cartService.addToCart(productId, quantity);

      set({
        items: data.items || [],
        subtotal: data.subtotal || data.total || 0,
        totalItems: data.totalItems || data.items?.length || 0,
        isLoading: false,
      });

      return data;
    } catch (error) {
      console.error("❌ Add to cart error:", error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Update item quantity
   */
  updateQuantity: async (itemId, quantity) => {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      // Guest cart
      const { items } = get();
      if (quantity <= 0) {
        set({
          items: items.filter((item) => item._id !== itemId),
        });
      } else {
        set({
          items: items.map((item) =>
            item._id === itemId ? { ...item, count: quantity } : item
          ),
        });
      }
      return;
    }

    // Authenticated cart
    try {
      set({ isLoading: true, error: null });
      const data = await cartService.updateCartItem(itemId, quantity);

      set({
        items: data.items || [],
        subtotal: data.subtotal || data.total || 0,
        totalItems: data.totalItems || data.items?.length || 0,
        isLoading: false,
      });
    } catch (error) {
      console.error("❌ Update quantity error:", error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Remove item from cart
   */
  removeItem: async (itemId) => {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      // Guest cart
      const { items } = get();
      set({
        items: items.filter((item) => item._id !== itemId),
      });
      return;
    }

    // Authenticated cart
    try {
      set({ isLoading: true, error: null });
      const data = await cartService.removeFromCart(itemId);

      set({
        items: data.items || [],
        subtotal: data.subtotal || data.total || 0,
        totalItems: data.totalItems || data.items?.length || 0,
        isLoading: false,
      });
    } catch (error) {
      console.error("❌ Remove from cart error:", error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Clear entire cart
   */
  clearCart: async () => {
    const { isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated) {
      // Guest cart
      set({ items: [], subtotal: 0, totalItems: 0 });
      return;
    }

    // Authenticated cart
    try {
      set({ isLoading: true, error: null });
      await cartService.clearCart();

      set({
        items: [],
        subtotal: 0,
        totalItems: 0,
        appliedCoupon: null,
        couponDiscount: 0,
        isLoading: false,
      });
    } catch (error) {
      console.error("❌ Clear cart error:", error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  /**
   * Get cart total
   */
  getTotal: () => {
    const { subtotal, couponDiscount } = get();
    return Math.max(0, subtotal - couponDiscount);
  },

  /**
   * Get cart item count
   */
  getItemCount: () => {
    const { items } = get();
    return items.reduce((total, item) => total + (item.count || 1), 0);
  },

  /**
   * Check if item is in cart
   */
  isInCart: (productId) => {
    const { items } = get();
    return items.some((item) => item._id === productId);
  },

  /**
   * Get item in cart
   */
  getItem: (productId) => {
    const { items } = get();
    return items.find((item) => item._id === productId);
  },

  /**
   * Get complete order summary with all values fetched from backend
   * Should be called before checkout to ensure all prices are current
   */
  getOrderSummary: async (includeGiftWrap = false) => {
    try {
      // Import dynamically to avoid circular dependency
      const { default: useConfigStore } = await import("./configStore");

      const { subtotal, couponDiscount, giftWrap } = get();
      const configStore = useConfigStore.getState();

      // Ensure config is fetched from backend
      await configStore.fetchAllConfig();

      const deliveryFee = configStore.getDeliveryFee(subtotal);
      const giftWrapCharge =
        includeGiftWrap && giftWrap.enabled
          ? configStore.getGiftWrapCharge()
          : 0;

      const total = subtotal - couponDiscount + deliveryFee + giftWrapCharge;

      return {
        subtotal,
        couponDiscount,
        deliveryFee,
        giftWrapCharge,
        total: Math.max(0, total),
        minOrderMet: subtotal >= configStore.getMinOrderAmount(),
        qualifiesForFreeDelivery:
          subtotal >= configStore.deliveryConfig.freeDeliveryThreshold,
      };
    } catch (error) {
      console.error("❌ Error getting order summary:", error);
      // Return basic summary if backend fetch fails
      const { subtotal, couponDiscount, giftWrap } = get();
      return {
        subtotal,
        couponDiscount,
        deliveryFee: subtotal >= 500 ? 0 : 50, // Fallback
        giftWrapCharge: giftWrap.enabled ? 30 : 0, // Fallback
        total: Math.max(
          0,
          subtotal -
            couponDiscount +
            (subtotal >= 500 ? 0 : 50) +
            (giftWrap.enabled ? 30 : 0)
        ),
        minOrderMet: subtotal >= 50,
        qualifiesForFreeDelivery: subtotal >= 500,
      };
    }
  },

  /**
   * Sync cart from guest to authenticated after login
   */
  syncGuestCartToBackend: async () => {
    const { items } = get();

    if (items.length === 0) return;

    try {
      set({ isSyncing: true });

      // Add each guest cart item to backend
      for (const item of items) {
        await cartService.addToCart(item._id, item.count || 1);
      }

      // Fetch updated cart from backend
      await get().fetchCart();
      set({ isSyncing: false });
    } catch (error) {
      console.error("❌ Sync guest cart error:", error);
      set({ isSyncing: false, error: error.message });
    }
  },

  /**
   * Increment item quantity
   */
  incrementQuantity: async (itemId) => {
    const { items } = get();
    const item = items.find((i) => i._id === itemId);

    if (item) {
      await get().updateQuantity(itemId, item.count + 1);
    }
  },

  /**
   * Decrement item quantity
   */
  decrementQuantity: async (itemId) => {
    const { items } = get();
    const item = items.find((i) => i._id === itemId);

    if (item) {
      if (item.count > 1) {
        await get().updateQuantity(itemId, item.count - 1);
      } else {
        await get().removeItem(itemId);
      }
    }
  },

  /**
   * Enable/disable gift wrap
   */
  setGiftWrap: (enabled, message = "") => {
    set({
      giftWrap: {
        enabled,
        message: enabled ? message : "",
      },
    });
  },

  /**
   * Update gift wrap message
   */
  updateGiftWrapMessage: (message) => {
    const { giftWrap } = get();
    set({
      giftWrap: {
        ...giftWrap,
        message,
      },
    });
  },
}));

export default useCartStore;

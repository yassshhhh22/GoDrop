import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as cartService from "../services/cart.service";
import * as couponService from "../services/coupon.service";
import useAuthStore from "./authStore";
import useConfigStore from "./configStore";
import { successAlert, errorAlert, promiseAlert } from "../utils/alerts.jsx";

const useCartStore = create(
  persist(
    (set, get) => ({
      // ========================================
      // STATE
      // ========================================
      items: [],
      isCartOpen: false,
      isLoading: false,
      isSyncing: false,
      error: null,

      appliedCoupon: null, // Stores coupon object (backend populates, frontend just uses code/value)
      couponDiscount: 0,

      // ✅ NEW: Store backend-calculated values
      _backendSubtotal: 0,
      _backendTotalItems: 0,

      // Gift wrap state (client-side managed until order creation)
      giftWrap: {
        enabled: false,
        message: "",
      },

      // ========================================
      // CART ACTIONS
      // ========================================

      fetchCart: async () => {
        const { isAuthenticated, getCustomerType } = useAuthStore.getState();
        const customerType = getCustomerType();

        if (!isAuthenticated) {
          // For guest users, recalculate subtotal from persisted items
          const { items } = get();
          const guestSubtotal = items.reduce((total, item) => {
            const itemPrice =
              customerType === "Business"
                ? item.businessPrice || item.price || 0
                : item.discountPrice || item.price || 0;
            return total + itemPrice * item.count;
          }, 0);

          const guestTotalItems = items.reduce(
            (total, item) => total + (item.count || 0),
            0
          );

          set({
            _backendSubtotal: guestSubtotal,
            _backendTotalItems: guestTotalItems,
          });
          return;
        }

        try {
          set({ isLoading: true, error: null });
          const cartData = await cartService.getCart();

          const newState = {
            items: cartData.items || [],
            _backendSubtotal: cartData.subtotal || 0,
            _backendTotalItems: cartData.totalItems || 0,
            appliedCoupon: cartData.appliedCoupon || null,
            couponDiscount: cartData.couponDiscount || 0,
            isLoading: false,
          };

          set(newState);
        } catch (error) {
          set({ isLoading: false, error: error.message });
          console.error("Failed to fetch cart:", error);
        }
      },

      addItem: async (product, quantity = 1) => {
        const { isAuthenticated, getCustomerType } = useAuthStore.getState();
        const customerType = getCustomerType();

        if (!isAuthenticated) {
          // Guest cart
          const { items } = get();
          const existingItem = items.find((item) => item._id === product._id);

          let updatedItems;
          if (existingItem) {
            updatedItems = items.map((item) =>
              item._id === product._id
                ? { ...item, count: item.count + quantity }
                : item
            );
            successAlert(`Added ${quantity} item(s)`);
          } else {
            updatedItems = [...items, { ...product, count: quantity }];
            successAlert(`Added ${quantity} item(s) to cart`);
          }

          // Calculate subtotal and total items for guest cart
          const guestSubtotal = updatedItems.reduce((total, item) => {
            const itemPrice =
              customerType === "Business"
                ? item.businessPrice || item.price || 0
                : item.discountPrice || item.price || 0;
            return total + itemPrice * item.count;
          }, 0);

          const guestTotalItems = updatedItems.reduce(
            (total, item) => total + (item.count || 0),
            0
          );

          set({
            items: updatedItems,
            _backendSubtotal: guestSubtotal,
            _backendTotalItems: guestTotalItems,
          });
          return;
        }

        // Authenticated cart
        try {
          console.log("📤 Sending to backend:", {
            productId: product._id,
            count: quantity,
          });

          const data = await cartService.addToCart(product._id, product.moq);

          console.log("✅ Backend response:", data);

          set({
            items: data.items || [],
            _backendSubtotal: data.subtotal || 0,
            _backendTotalItems: data.totalItems || 0,
          });
          successAlert(`Added ${quantity} item(s) to cart!`);

          return data;
        } catch (error) {
          console.error("❌ Add to cart error:", {
            message: error.response?.data?.message,
            status: error.response?.status,
            data: error.response?.data,
          });
          errorAlert(error.response?.data?.message || "Failed to add item");
          throw error;
        }
      },

      updateQuantity: async (productId, quantity) => {
        const { isAuthenticated, getCustomerType } = useAuthStore.getState();
        const customerType = getCustomerType();

        if (!isAuthenticated) {
          const { items } = get();
          const updatedItems = items
            .map((item) =>
              item._id === productId ? { ...item, count: quantity } : item
            )
            .filter((item) => item.count > 0);

          // Calculate guest subtotal and total items
          const guestSubtotal = updatedItems.reduce((total, item) => {
            const itemPrice =
              customerType === "Business"
                ? item.businessPrice || item.price || 0
                : item.discountPrice || item.price || 0;
            return total + itemPrice * item.count;
          }, 0);

          const guestTotalItems = updatedItems.reduce(
            (total, item) => total + (item.count || 0),
            0
          );

          set({
            items: updatedItems,
            _backendSubtotal: guestSubtotal,
            _backendTotalItems: guestTotalItems,
          });
          successAlert(quantity > 0 ? "Quantity updated" : "Item removed");
          return;
        }

        try {
          set({ isSyncing: true });
          const data = await cartService.updateCartItem(productId, quantity);

          set({
            items: data.items,
            _backendSubtotal: data.subtotal || 0,
            _backendTotalItems: data.totalItems || 0,
          });
          successAlert(quantity > 0 ? "Quantity updated" : "Item removed");
        } catch (error) {
          errorAlert(error.response?.data?.message || "Update failed");
        } finally {
          set({ isSyncing: false });
        }
      },

      // ✅ FIX: Handle both backend and guest cart structures
      incrementQuantity: async (productId) => {
        const { isAuthenticated } = useAuthStore.getState();
        const { items } = get();

        const item = isAuthenticated
          ? items.find((item) => item.item._id === productId) // Backend: { item: {...}, count }
          : items.find((item) => item._id === productId); // Guest: { ...product, count }

        if (item) {
          await get().updateQuantity(productId, item.count + 1);
        }
      },

      // ✅ FIX: Handle both backend and guest cart structures
      decrementQuantity: async (productId) => {
        const { isAuthenticated } = useAuthStore.getState();
        const { items } = get();

        const item = isAuthenticated
          ? items.find((item) => item.item._id === productId)
          : items.find((item) => item._id === productId);

        if (item) {
          await get().updateQuantity(productId, item.count - 1);
        }
      },

      removeItem: async (productId) => {
        const { isAuthenticated, getCustomerType } = useAuthStore.getState();
        const customerType = getCustomerType();

        if (!isAuthenticated) {
          const { items } = get();
          const updatedItems = items.filter((item) => item._id !== productId);

          // Calculate guest subtotal and total items
          const guestSubtotal = updatedItems.reduce((total, item) => {
            const itemPrice =
              customerType === "Business"
                ? item.businessPrice || item.price || 0
                : item.discountPrice || item.price || 0;
            return total + itemPrice * item.count;
          }, 0);

          const guestTotalItems = updatedItems.reduce(
            (total, item) => total + (item.count || 0),
            0
          );

          set({
            items: updatedItems,
            _backendSubtotal: guestSubtotal,
            _backendTotalItems: guestTotalItems,
          });
          successAlert("Item removed from cart");
          return;
        }

        return promiseAlert(
          cartService.removeCartItem(productId).then((data) => {
            // ✅ FIX: Store ALL backend values
            set({
              items: data.items,
              _backendSubtotal: data.subtotal || 0,
              _backendTotalItems: data.totalItems || 0,
            });
            return data;
          }),
          {
            loading: "Removing item...",
            success: "Item removed from cart",
            error: "Failed to remove item",
          }
        );
      },

      clearCart: async () => {
        const { isAuthenticated } = useAuthStore.getState();

        if (!isAuthenticated) {
          set({
            items: [],
            _backendSubtotal: 0,
            _backendTotalItems: 0,
            giftWrap: { enabled: false, message: "" },
            appliedCoupon: null, // Clear coupon
            couponDiscount: 0, // Clear coupon discount
          });
          successAlert("Cart cleared");
          return;
        }

        return promiseAlert(
          cartService.clearCart().then(() => {
            set({
              items: [],
              _backendSubtotal: 0,
              _backendTotalItems: 0,
              appliedCoupon: null, // Clear coupon on backend cart clear
              couponDiscount: 0, // Clear coupon discount on backend cart clear
            });
          }),
          {
            loading: "Clearing cart...",
            success: "Cart cleared",
            error: "Failed to clear cart",
          }
        );
      },

      syncGuestCart: async () => {
        const { items } = get();
        if (items.length === 0) return;

        try {
          set({ isSyncing: true });

          for (const item of items) {
            await cartService.addToCart(item._id, item.count);
          }

          await get().fetchCart();
          toast.success("Cart synced successfully!");
        } catch (error) {
          set({ isSyncing: false, error: error.message });
          toast.error("Failed to sync cart");
        }
      },

      // ========================================
      // UI ACTIONS
      // ========================================
      toggleCart: () => set({ isCartOpen: !get().isCartOpen }),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      // Gift wrap actions
      toggleGiftWrap: () =>
        set((state) => ({
          giftWrap: { ...state.giftWrap, enabled: !state.giftWrap.enabled },
        })),
      setGiftWrapMessage: (message) =>
        set((state) => ({ giftWrap: { ...state.giftWrap, message } })),

      // Coupon actions
      applyCouponCode: async (code) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          throw new Error("Please login to apply coupons");
        }
        try {
          console.log("🎟️ Cart store: Applying coupon:", code);

          // ✅ Call backend service to apply coupon
          const { coupon, pricing } = await couponService.applyCoupon(code);

          console.log("✅ Coupon response:", { coupon, pricing });

          // ✅ Update state immediately with response
          set({
            appliedCoupon: coupon,
            couponDiscount: pricing.discount,
          });

          // ✅ CRITICAL: Fetch full cart to ensure all values are synced
          console.log("🔄 Fetching full cart after coupon apply...");
          await get().fetchCart();

          console.log("✅ Cart state after fetch:", {
            appliedCoupon: get().appliedCoupon,
            couponDiscount: get().couponDiscount,
            _backendSubtotal: get()._backendSubtotal,
          });
        } catch (error) {
          console.error("❌ Coupon error in store:", error);
          throw error;
        }
      },

      removeCouponCode: async () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          throw new Error("Cannot remove coupon from guest cart");
        }
        try {
          console.log("🗑️ Removing coupon from store...");

          // Call backend service to remove coupon
          await couponService.removeCoupon();

          // Clear local state
          set({
            appliedCoupon: null,
            couponDiscount: 0,
          });

          // Fetch cart to ensure sync
          console.log("🔄 Fetching cart after coupon remove...");
          await get().fetchCart();

          console.log("✅ Coupon removed, cart updated");
        } catch (error) {
          console.error("❌ Remove coupon error in store:", error);
          throw error;
        }
      },

      // ========================================
      // COMPUTED VALUES
      // ========================================
      get cartCount() {
        const { _backendTotalItems, items } = get();
        const { isAuthenticated } = useAuthStore.getState();

        if (!isAuthenticated) {
          // Guest cart: calculate
          return items.reduce((total, item) => total + (item.count || 0), 0);
        }

        // ✅ Backend cart: use backend value
        return _backendTotalItems;
      },

      get totalItems() {
        return get().cartCount;
      },

      // ✅ FIX: Use backend-provided subtotal ALWAYS
      get subtotal() {
        const { _backendSubtotal, items } = get();
        const { isAuthenticated } = useAuthStore.getState();

        if (!isAuthenticated || items.length === 0) {
          // Guest cart calculation
          return items.reduce((total, cartItem) => {
            const price = cartItem.discountPrice || cartItem.price || 0;
            return total + price * (cartItem.count || 0);
          }, 0);
        }

        // Backend cart: use backend-calculated subtotal
        return _backendSubtotal;
      },

      // ✅ UPDATED: Use config store for delivery fee
      get deliveryFee() {
        const subtotal = get().subtotal;
        const { getDeliveryFee } = useConfigStore.getState();
        return getDeliveryFee(subtotal);
      },

      // ✅ REMOVED: These don't exist in backend
      get handlingCharge() {
        return 0;
      },

      get smallCartCharge() {
        return 0;
      },

      get total() {
        const subtotal = get().subtotal;
        const deliveryFee = get().deliveryFee;
        const couponDiscount = get().couponDiscount;
        const { giftWrapCharge } = useConfigStore.getState(); // Get from config store
        const giftWrapFee = get().giftWrap.enabled ? giftWrapCharge : 0; // Calculate gift wrap fee

        // ✅ NO TAX - only subtotal + delivery - coupon + gift wrap
        return subtotal + deliveryFee - couponDiscount + giftWrapFee; // Include giftWrapFee
      },

      get savings() {
        const { items } = get();
        const { getCustomerType, isAuthenticated } = useAuthStore.getState();
        const customerType = getCustomerType();

        return items.reduce((total, cartItem) => {
          // ✅ FIX: Handle both guest and backend cart structure
          const product = isAuthenticated ? cartItem.item : cartItem;
          if (!product) return total;

          if (customerType === "Business") {
            const saving =
              (product.price || 0) -
              (product.businessPrice || product.price || 0);
            return total + saving * (cartItem.count || 0);
          } else {
            const saving =
              (product.price || 0) -
              (product.discountPrice || product.price || 0);
            return total + saving * (cartItem.count || 0);
          }
        }, 0);
      },
    }),
    {
      name: "godrop-cart",
      partialize: (state) => ({
        items: state.items,
        appliedCoupon: state.appliedCoupon,
        couponDiscount: state.couponDiscount,
        // ✅ Also persist backend values
        _backendSubtotal: state._backendSubtotal,
        _backendTotalItems: state._backendTotalItems,
        giftWrap: state.giftWrap, // Persist gift wrap state
      }),
      version: 3, // Increment version for coupon changes
      migrate: (persistedState, version) => {
        if (version < 3) {
          // Add new coupon related fields with defaults
          return {
            ...persistedState,
            appliedCoupon: null,
            couponDiscount: 0,
          };
        }
        return persistedState;
      },
    }
  )
);

export default useCartStore;

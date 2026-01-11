import { create } from "zustand";
import { persist } from "zustand/middleware";

const useConfigStore = create(
  persist(
    (set, get) => ({
      // ========================================
      // STATE
      // ========================================
      deliveryConfig: {
        fee: 50, // Default fallback
        freeDeliveryThreshold: 500,
      },
      isLoading: false,
      error: null,
      giftWrapCharge: 30, // Add giftWrapCharge to state with a default

      // ========================================
      // ACTIONS
      // ========================================

      /**
       * Fetch delivery configuration from backend
       */
      fetchDeliveryConfig: async () => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch("/api/config/public", {
            // Changed to /api/config/public
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch config: ${response.statusText}`);
          }

          const data = await response.json();

          // ✅ Extract delivery config from response
          const deliveryConfig = data.data.delivery || {
            // Access data.data.delivery
            fee: 50,
            freeDeliveryThreshold: 500,
            giftWrapCharge: 30, // Default for giftWrapCharge
          };

          set({
            deliveryConfig,
            giftWrapCharge: deliveryConfig.giftWrapCharge, // Update giftWrapCharge from fetched config
            isLoading: false,
          });

          return deliveryConfig;
        } catch (error) {
          set({
            isLoading: false,
            error: error.message,
          });

          // Return default values on error
          return get().deliveryConfig;
        }
      },

      // ========================================
      // COMPUTED VALUES
      // ========================================

      /**
       * Calculate delivery fee based on subtotal
       */
      getDeliveryFee: (subtotal) => {
        const { deliveryConfig } = get();
        return subtotal >= deliveryConfig.freeDeliveryThreshold
          ? 0
          : deliveryConfig.fee;
      },

      /**
       * Check if order qualifies for free delivery
       */
      qualifiesForFreeDelivery: (subtotal) => {
        const { deliveryConfig } = get();
        return subtotal >= deliveryConfig.freeDeliveryThreshold;
      },

      /**
       * Get amount needed for free delivery
       */
      getAmountForFreeDelivery: (subtotal) => {
        const { deliveryConfig } = get();
        const remaining = deliveryConfig.freeDeliveryThreshold - subtotal;
        return Math.max(0, remaining);
      },
    }),
    {
      name: "godrop-config",
      partialize: (state) => ({
        deliveryConfig: state.deliveryConfig,
        giftWrapCharge: state.giftWrapCharge, // Ensure this is persisted
      }),
      version: 4, // Increment version to force re-initialization after API route fix
      migrate: (persistedState, version) => {
        if (version < 4) {
          return {
            ...persistedState,
            giftWrapCharge: 30, // Default for older versions, will be overwritten by fetch
          };
        }
        return persistedState;
      },
    }
  )
);

export default useConfigStore;

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as configService from "../services/config.service";

/**
 * Config Store
 * Manages global app configuration (delivery fees, pricing, etc.)
 * All values are fetched from backend, not hardcoded
 */
const useConfigStore = create(
  persist(
    (set, get) => ({
      // ========================================
      // STATE
      // ========================================
      deliveryConfig: {
        fee: 50, // Default fallback (in rupees)
        freeDeliveryThreshold: 500, // Free delivery above this amount
      },
      giftWrapCharge: 30, // Default gift wrap charge (fallback only)
      minOrderAmount: 50, // Minimum order amount (fallback only)
      isLoading: false,
      error: null,
      lastFetchedAt: null,

      // ========================================
      // ACTIONS
      // ========================================

      /**
       * Fetch ALL configuration from backend (recommended)
       */
      fetchAllConfig: async () => {
        try {
          set({ isLoading: true, error: null });

          const pricing = await configService.getAllPricing();

          set({
            deliveryConfig: pricing.delivery,
            giftWrapCharge: pricing.giftWrap,
            minOrderAmount: pricing.minOrderAmount,
            isLoading: false,
            lastFetchedAt: Date.now(),
          });

          return pricing;
        } catch (error) {
          // Silently use defaults - don't throw
          set({ isLoading: false });
          return {
            delivery: get().deliveryConfig,
            giftWrap: get().giftWrapCharge,
            minOrderAmount: get().minOrderAmount,
          };
        }
      },

      /**
       * Fetch delivery configuration from backend
       */
      fetchDeliveryConfig: async () => {
        try {
          set({ isLoading: true, error: null });

          const deliveryConfig = await configService.getDeliveryConfig();

          set({
            deliveryConfig,
            isLoading: false,
            lastFetchedAt: Date.now(),
          });

          return deliveryConfig;
        } catch (error) {
          console.error("❌ Error fetching delivery config:", error);
          set({
            isLoading: false,
            error: error.message,
          });
          throw error;
        }
      },

      /**
       * Fetch gift wrap pricing from backend
       */
      fetchGiftWrapPricing: async () => {
        try {
          set({ isLoading: true, error: null });

          const giftWrapCharge = await configService.getGiftWrapPricing();

          set({
            giftWrapCharge,
            isLoading: false,
            lastFetchedAt: Date.now(),
          });

          return giftWrapCharge;
        } catch (error) {
          console.error("❌ Error fetching gift wrap pricing:", error);
          set({
            isLoading: false,
            error: error.message,
          });
          throw error;
        }
      },

      /**
       * Check if delivery is available for a pincode
       */
      checkDeliveryAvailability: async (pincode) => {
        try {
          const availability = await configService.checkDeliveryAvailability(
            pincode
          );
          return availability;
        } catch (error) {
          console.error("❌ Error checking delivery availability:", error);
          throw error;
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

      /**
       * Calculate gift wrap charge
       */
      getGiftWrapCharge: () => {
        return get().giftWrapCharge;
      },

      /**
       * Get minimum order amount
       */
      getMinOrderAmount: () => {
        return get().minOrderAmount;
      },
    }),
    {
      name: "godrop-config",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useConfigStore;

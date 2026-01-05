/**
 * Configuration Service
 * Fetches app configuration from backend (delivery fees, pricing, etc.)
 */
import axiosInstance from "./api";

/**
 * Get public configuration (delivery fees, gift wrap charges, etc.)
 * No authentication required
 */
export const getPublicConfig = async () => {
  try {
    const response = await axiosInstance.get("/config/public");
    return response.data.data || {};
  } catch (error) {
    // Silent fail - return empty object, let caller handle defaults
    throw error;
  }
};

/**
 * Get delivery fees configuration
 */
export const getDeliveryConfig = async () => {
  try {
    const config = await getPublicConfig();
    return (
      config.delivery || {
        fee: 50,
        freeDeliveryThreshold: 500,
      }
    );
  } catch (error) {
    // Return defaults on error
    return { fee: 50, freeDeliveryThreshold: 500 };
  }
};

/**
 * Get gift wrap pricing
 */
export const getGiftWrapPricing = async () => {
  try {
    const config = await getPublicConfig();
    return config.giftWrapCharge || 30;
  } catch (error) {
    return 30; // Default fallback
  }
};

/**
 * Get all pricing information at once
 */
export const getAllPricing = async () => {
  try {
    const config = await getPublicConfig();
    return {
      delivery: config.delivery || {
        fee: 50,
        freeDeliveryThreshold: 500,
      },
      giftWrap: config.giftWrapCharge || 30,
      minOrderAmount: config.minOrderAmount || 50,
    };
  } catch (error) {
    // Return fallback defaults when offline
    return {
      delivery: { fee: 50, freeDeliveryThreshold: 500 },
      giftWrap: 30,
      minOrderAmount: 50,
    };
  }
};

/**
 * Check if delivery is available for a location
 */
export const checkDeliveryAvailability = async (pincode) => {
  try {
    const response = await axiosInstance.get(
      `/config/delivery/availability/${pincode}`
    );
    return response.data.data || {};
  } catch (error) {
    return { available: false }; // Default to unavailable when offline
  }
};

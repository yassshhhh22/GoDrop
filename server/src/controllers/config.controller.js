import asyncHandler from 'express-async-handler';
import ApiResponse from '../utils/ApiResponse.js';
import { DELIVERY_CONFIG } from '../config/config.js';

/**
 * @desc    Get public application configuration
 * @route   GET /api/config/public
 * @access  Public
 */
export const getPublicConfig = asyncHandler(async (req, res) => {
  const publicConfig = {
    delivery: {
      fee: DELIVERY_CONFIG.fee,
      freeDeliveryThreshold: DELIVERY_CONFIG.freeDeliveryThreshold,
      giftWrapCharge: DELIVERY_CONFIG.giftWrapCharge, // Expose giftWrapCharge
    },
    // You can expose other public constants here as needed
  };

  res
    .status(200)
    .json(new ApiResponse(200, publicConfig, 'Public configuration retrieved'));
});
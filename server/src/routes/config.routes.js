import express from 'express';
import asyncHandler from 'express-async-handler';
import { DELIVERY_CONFIG } from '../config/config.js';
import ApiResponse from '../utils/ApiResponse.js';
import { getPublicConfig } from '../controllers/config.controller.js'; // Import getPublicConfig

const router = express.Router();

/**
 * GET /api/config/delivery
 * Get delivery fee configuration
 * @access Public
 */
router.get(
  '/delivery',
  asyncHandler(async (req, res) => {
    res.json(
      new ApiResponse(
        200,
        {
          fee: DELIVERY_CONFIG.fee,
          freeDeliveryThreshold: DELIVERY_CONFIG.freeDeliveryThreshold,
          giftWrapCharge: DELIVERY_CONFIG.giftWrapCharge, // Also include giftWrapCharge here for consistency if this route is still used directly
        },
        'Delivery configuration retrieved successfully'
      )
    );
  })
);

/**
 * GET /api/config/public
 * Get all public application configuration
 * @access Public
 */
router.get('/public', getPublicConfig); // Ensure this route exists and points to your controller

export default router;

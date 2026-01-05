import express from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  cancelOrder,
  trackOrder,
  getPendingOrdersCount,
  getRecentPendingOrders, // ✅ ADD: Import new controller
} from '../controllers/order.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import { createOrderValidator } from '../validators/order.validator.js';

const router = express.Router();

// Create normal order from cart
router.post(
  '/create',
  authenticate,
  authorize('Customer', 'BusinessUser'),
  validate(createOrderValidator),
  createOrder
);

// Get all orders (filtered by role)
router.get(
  '/',
  authenticate,
  authorize('Customer', 'BusinessUser'),
  getAllOrders // ✅ CHANGE: getOrders → getAllOrders
);

// Get single order by ID
router.get(
  '/:orderId',
  authenticate,
  authorize('Customer', 'BusinessUser', 'DeliveryPartner'), // ✅ ADDED: DeliveryPartner role
  getOrderById
);

// ✅ ADD: New route for pending order count (for Admin)
router.get(
  '/pending/count',
  authenticate,
  authorize('Admin'),
  getPendingOrdersCount
);

// ✅ ADD: New route for recent pending orders (for Admin Dashboard)
router.get(
  '/recent/pending',
  authenticate,
  authorize('Admin'),
  getRecentPendingOrders
);

// Cancel order (Customer/Admin)
router.post(
  '/:orderId/cancel',
  authenticate,
  authorize('Customer', 'BusinessUser'),
  cancelOrder
);

// Track order (real-time status)
router.get(
  '/:orderId/track',
  authenticate,
  authorize('Customer', 'BusinessUser', 'DeliveryPartner'), // ✅ ADDED: DeliveryPartner role
  trackOrder
);

export default router;

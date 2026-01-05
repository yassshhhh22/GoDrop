import express from 'express';
import {
  getAssignedOrders,
  updateOrderStatus,
  updateLocation,
  updateAvailability,
} from '../controllers/deliveryPartner.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  updateOrderStatusValidator,
  updateLocationValidator,
  updateAvailabilityValidator,
} from '../validators/deliveryPartner.validator.js';

const router = express.Router();

// All routes require authentication as DeliveryPartner
router.use(authenticate);
router.use(authorize('DeliveryPartner'));

// Get assigned orders
router.get('/orders', getAssignedOrders);

// Update order status
router.put(
  '/orders/:orderId/status',
  validate(updateOrderStatusValidator),
  updateOrderStatus
);

// Update real-time location
router.put('/location', validate(updateLocationValidator), updateLocation);

// Toggle availability
router.put(
  '/availability',
  validate(updateAvailabilityValidator),
  updateAvailability
);

export default router;
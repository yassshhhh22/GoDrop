import express from 'express';
import { validate } from '../middlewares/validation.middleware.js';
import {
  createPrintOrderValidator,
  printOrderIdValidator,
  assignDeliveryPartnerValidator,
  updatePrintOrderStatusValidator,
} from '../validators/index.js';
import {
  createPrintOrder,
  getPrintOrders,
  getPrintOrder,
  assignDeliveryPartner,
  updatePrintOrderStatus,
} from '../controllers/printOrder.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { uploadMultiple } from '../middlewares/upload.middleware.js';
import { orderLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorize('Customer'),
  orderLimiter,
  uploadMultiple('files', 10),
  validate(createPrintOrderValidator),
  createPrintOrder
);
router.get('/', authorize('Customer', 'Admin'), getPrintOrders);
router.get(
  '/:orderId',
  authorize('Customer', 'Admin', 'DeliveryPartner'),
  validate(printOrderIdValidator),
  getPrintOrder
);
router.post(
  '/assign',
  authorize('Admin'),
  validate(assignDeliveryPartnerValidator),
  assignDeliveryPartner
);
router.put(
  '/:orderId/status',
  authorize('DeliveryPartner', 'Admin'),
  validate(updatePrintOrderStatusValidator),
  updatePrintOrderStatus
);

export default router;

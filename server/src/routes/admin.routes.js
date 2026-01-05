import express from 'express';
import { uploadSingle } from '../middlewares/upload.middleware.js';
import { uploadImageForAdmin } from '../controllers/admin.controller.js';
import { assignDeliveryPartner } from '../controllers/order.controller.js';
import { validate } from '../middlewares/validation.middleware.js';
import { assignPartnerValidator } from '../validators/order.validator.js';

const router = express.Router();

router.post('/admin/upload-image', uploadSingle('image'), uploadImageForAdmin);

router.post(
  '/admin/assign-partner',
  validate(assignPartnerValidator),
  assignDeliveryPartner
);

export default router;
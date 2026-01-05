import express from 'express';
import {
  getAvailableCoupons,
  applyCoupon,
  validateCoupon,
  removeCoupon,
} from '../controllers/coupon.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  applyCouponValidator,
  validateCouponValidator,
  removeCouponValidator,
} from '../validators/index.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('Customer'));

router.get('/available', getAvailableCoupons);
router.post('/apply', validate(applyCouponValidator), applyCoupon);
router.post('/validate', validate(validateCouponValidator), validateCoupon);
router.delete('/remove', validate(removeCouponValidator), removeCoupon);

export default router;

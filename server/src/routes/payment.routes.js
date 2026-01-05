import express from 'express';
import {
  getRazorpayKey,
  createRazorpayOrderOnly,
  verifyPaymentAndCreateOrder,
  handlePaymentFailure,
  getPaymentDetails,
  initiateRefund,
} from '../controllers/payment.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { paymentLimiter } from '../middlewares/rateLimiter.middleware.js';
import { getRazorpayStatus } from '../services/razorpay.service.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  createRazorpayOrderValidator,
  verifyAndCreateOrderValidator,
} from '../validators/payment.validator.js';

const router = express.Router();

// ✅ NEW: Debug endpoint to check Razorpay configuration
router.get('/debug/status', (req, res) => {
  const status = getRazorpayStatus();
  res.json({
    configured: status.configured,
    instance: status.instance,
    message: !status.configured
      ? 'Razorpay not configured. Check .env file.'
      : 'Razorpay is ready.',
  });
});

router.get('/razorpay-key', getRazorpayKey);

router.use(authenticate);

// ✅ NEW: Create Razorpay order WITHOUT DB order
router.post(
  '/create-razorpay-order',
  paymentLimiter,
  validate(createRazorpayOrderValidator),
  createRazorpayOrderOnly
);

// ✅ NEW: Verify payment AND create DB order
router.post(
  '/verify-and-create-order',
  paymentLimiter,
  validate(verifyAndCreateOrderValidator),
  verifyPaymentAndCreateOrder
);

// ✅ DEPRECATED: Old endpoints (keep for backward compatibility)
router.post('/create-order', paymentLimiter, createRazorpayOrderOnly);
router.post('/verify', paymentLimiter, verifyPaymentAndCreateOrder);

router.post('/failure', handlePaymentFailure);
router.get('/details/:paymentId', getPaymentDetails);
router.post('/refund', authorize('Admin'), initiateRefund);

export default router;

import express from 'express';
import {
  sendOTP,
  verifyOTP,
  refreshToken,
  logout,
  getCurrentUser,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  otpLimiter,
  authLimiter,
} from '../middlewares/rateLimiter.middleware.js';
import {
  sendOTPValidator,
  verifyOTPValidator,
  refreshTokenValidator,
} from '../validators/index.js';

const router = express.Router();

router.post('/send-otp', otpLimiter, validate(sendOTPValidator), sendOTP);
router.post(
  '/verify-otp',
  authLimiter,
  validate(verifyOTPValidator),
  verifyOTP
);
router.post('/refresh-token', validate(refreshTokenValidator), refreshToken);
router.post('/logout', logout);
router.get('/me', authenticate, getCurrentUser);

export default router;

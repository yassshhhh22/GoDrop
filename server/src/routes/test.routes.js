import express from 'express';
import {
  sendOTP,
  getServiceStatus as getFast2SMSStatus,
} from '../services/fast2sms.service.js';
import { getRazorpayStatus } from '../services/razorpay.service.js';
import { verifyOTP } from '../config/redis.js';

const router = express.Router();

router.get('/status', async (req, res) => {
  const fast2smsStatus = getFast2SMSStatus();
  const razorpayStatus = getRazorpayStatus();

  res.json({
    success: true,
    services: {
      fast2sms: fast2smsStatus.fast2sms,
      redis: fast2smsStatus.redis,
      razorpay: razorpayStatus,
    },
    message:
      fast2smsStatus.redis.connected &&
      fast2smsStatus.fast2sms.configured &&
      razorpayStatus.configured
        ? 'All services operational'
        : 'Some services are unavailable',
  });
});

router.post('/send-otp', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required',
    });
  }

  const result = await sendOTP(phone);
  res.json(result);
});

router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({
      success: false,
      message: 'Phone and OTP are required',
    });
  }

  const result = await verifyOTP(phone, otp);
  res.json(result);
});

export default router;

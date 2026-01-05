import express from 'express';
import { handleRazorpayWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

router.post(
  '/razorpay',
  express.raw({ type: 'application/json' }),
  handleRazorpayWebhook
);

export default router;

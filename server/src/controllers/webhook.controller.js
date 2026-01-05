import crypto from 'crypto';
import { RAZORPAY_CONFIG } from '../config/config.js';
import { Order } from '../models/index.js';
import logger from '../utils/logger.js';

export const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = RAZORPAY_CONFIG.webhookSecret;

    if (!webhookSecret) {
      logger.error('Razorpay webhook secret not configured');
      return res.status(500).json({
        success: false,
        message: 'Webhook not configured',
      });
    }

    const shasum = crypto.createHmac('sha256', webhookSecret);
    // FIX: Convert the raw Buffer body to its string representation
    shasum.update(req.body.toString()); 
    const digest = shasum.digest('hex');

    if (digest !== req.headers['x-razorpay-signature']) {
      logger.error('Invalid webhook signature');
      return res.status(400).json({
        success: false,
        message: 'Invalid signature',
      });
    }

    const event = req.body.event;
    let payload; // Declare payload here

    // Log the received event for debugging
  

    switch (event) {
      case 'payment.captured':
      case 'payment.failed':
        payload = req.body.payload.payment.entity;
        await (event === 'payment.captured' ? handlePaymentCaptured(payload) : handlePaymentFailed(payload));
        break;
      case 'refund.processed':
        payload = req.body.payload.refund.entity; // Correctly get the refund entity
        await handleRefundProcessed(payload);
        break;
      default:
        logger.info(`Unhandled webhook event: ${event}`);
        // For unhandled events, we still return success to Razorpay to prevent retries
        return res.json({ success: true, message: `Unhandled event type: ${event}` });
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
    });
  }
};

async function handlePaymentCaptured(payment) {
  const order = await Order.findOne({
    'payment.razorpayOrderId': payment.order_id,
  });

  if (order) {
    order.payment.status = 'success';
    order.payment.paidAt = new Date(payment.created_at * 1000);
    await order.save();

    logger.info(`Payment captured for order ${order.orderId}`);
  }
}

async function handlePaymentFailed(payment) {
  const order = await Order.findOne({
    'payment.razorpayOrderId': payment.order_id,
  });

  if (order) {
    order.payment.status = 'failed';
    await order.save();

    logger.info(`Payment failed for order ${order.orderId}`);
  }
}

async function handleRefundProcessed(refund) {
  const order = await Order.findOne({
    'payment.razorpayPaymentId': refund.payment_id,
  });

  if (order) {
    order.payment.status = 'refunded';
    await order.save();

    logger.info(`Refund processed for order ${order.orderId}`);
  }
}

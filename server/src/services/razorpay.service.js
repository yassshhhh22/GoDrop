import Razorpay from 'razorpay';
import crypto from 'crypto';
import { RAZORPAY_CONFIG } from '../config/config.js';
import logger from '../utils/logger.js';
import { getLogTimestamp } from '../utils/time.js';

let razorpayInstance = null;

try {
  if (RAZORPAY_CONFIG.keyId && RAZORPAY_CONFIG.keySecret) {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_CONFIG.keyId,
      key_secret: RAZORPAY_CONFIG.keySecret,
    });
    console.log(
      `${getLogTimestamp()}  Razorpay initialized with key: ${RAZORPAY_CONFIG.keyId.substring(
        0,
        15
      )}...`
    );
  } else {
    console.warn(`${getLogTimestamp()}  Razorpay credentials missing:`, {
      keyId: !!RAZORPAY_CONFIG.keyId,
      keySecret: !!RAZORPAY_CONFIG.keySecret,
    });
  }
} catch (error) {
  console.error(
    `${getLogTimestamp()} Razorpay initialization error:`,
    error.message
  );
}

export const createOrder = async (
  amount,
  currency = 'INR',
  receipt,
  notes = {}
) => {
  try {
    if (!razorpayInstance) {
      console.error(' Razorpay instance not initialized');
      console.error(
        'Check .env file for RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET'
      );

      logger.error('Razorpay not initialized');
      return {
        success: false,
        message: 'Payment service not configured. Please contact support.',
      };
    }

    if (!amount || amount <= 0) {
      console.error('❌ Invalid amount:', amount);
      return {
        success: false,
        message: 'Invalid amount',
      };
    }

    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt,
      notes,
    };



    const order = await razorpayInstance.orders.create(options);

   

    return {
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      message: 'Order created successfully',
    };
  } catch (error) {
    const razorpayError = error.error || error;

    console.error(' Razorpay API error details:');
    console.error('Message:', error.message);
    console.error('Description:', razorpayError.description);
    console.error('Code:', razorpayError.code);
    console.error('Source:', razorpayError.source);
    console.error('Step:', razorpayError.step);
    console.error('Reason:', razorpayError.reason);
    console.error('Full error:', JSON.stringify(error, null, 2));

    logger.error('Error creating Razorpay order', {
      amount,
      receipt,
      error: error.message,
      description: razorpayError.description,
      code: razorpayError.code,
      source: razorpayError.source,
      step: razorpayError.step,
      reason: razorpayError.reason,
    });

    const errorMessage =
      razorpayError.description || error.message || 'Unknown error occurred';

    return {
      success: false,
      message: `Failed to create payment order: ${errorMessage}`,
      errorCode: razorpayError.code,
      errorSource: razorpayError.source,
    };
  }
};

export const verifyPayment = (orderId, paymentId, signature) => {
  try {
    if (!RAZORPAY_CONFIG.keySecret) {
      logger.error('Razorpay key secret not configured');
      return {
        valid: false,
        message: 'Payment verification unavailable',
      };
    }

    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_CONFIG.keySecret)
      .update(text)
      .digest('hex');

    const isValid = expectedSignature === signature;

    if (isValid) {
      return {
        valid: true,
        message: 'Payment verified successfully',
      };
    } else {
      logger.error('Payment signature verification failed', {
        orderId,
        paymentId,
      });

      return {
        valid: false,
        message: 'Payment verification failed',
      };
    }
  } catch (error) {
    logger.error('Error verifying payment', {
      orderId,
      paymentId,
      error: error.message,
    });

    return {
      valid: false,
      message: 'Payment verification error',
    };
  }
};

export const fetchPayment = async (paymentId) => {
  try {
    if (!razorpayInstance) {
      return {
        success: false,
        message: 'Payment service unavailable',
      };
    }

    const payment = await razorpayInstance.payments.fetch(paymentId);

    return {
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount / 100,
        currency: payment.currency,
        status: payment.status,
        method: payment.method,
        email: payment.email,
        contact: payment.contact,
        createdAt: payment.created_at,
      },
      message: 'Payment details fetched successfully',
    };
  } catch (error) {
    logger.error('Error fetching payment details', {
      paymentId,
      error: error.message,
    });

    return {
      success: false,
      message: 'Failed to fetch payment details',
    };
  }
};

export const refundPayment = async (paymentId, amount = null) => {
  try {
    if (!razorpayInstance) {
      return {
        success: false,
        message: 'Payment service unavailable',
      };
    }

    const options = {};
    if (amount) {
      options.amount = Math.round(amount * 100);
    }

    const refund = await razorpayInstance.payments.refund(paymentId, options);

    return {
      success: true,
      refund: {
        id: refund.id,
        paymentId: refund.payment_id,
        amount: refund.amount / 100,
        status: refund.status,
      },
      message: 'Refund initiated successfully',
    };
  } catch (error) {
    logger.error('Error initiating refund', {
      paymentId,
      amount,
      // Log the full error structure from Razorpay for better debugging
      error: error.error || error.message,
    });

    // Extract a more specific error message from the Razorpay API response
    const errorMessage = error.error?.description || error.message || 'Failed to initiate refund';

    return {
      success: false,
      message: errorMessage, // Return the specific message instead of a generic one
    };
  }
};

export const getRazorpayStatus = () => {
  return {
    configured: !!(RAZORPAY_CONFIG.keyId && RAZORPAY_CONFIG.keySecret),
    instance: !!razorpayInstance,
  };
};

export const getRazorpayKeyId = () => {
  return RAZORPAY_CONFIG.keyId || '';
};

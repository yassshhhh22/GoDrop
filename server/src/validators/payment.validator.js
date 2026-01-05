import { body, param } from 'express-validator';

export const createPaymentOrderValidator = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isString()
    .withMessage('Order ID must be a string'),
];

export const verifyPaymentValidator = [
  body('razorpayOrderId')
    .notEmpty()
    .withMessage('Razorpay order ID is required'),
  body('razorpayPaymentId')
    .notEmpty()
    .withMessage('Razorpay payment ID is required'),
  body('razorpaySignature')
    .notEmpty()
    .withMessage('Razorpay signature is required'),
  body('orderId').notEmpty().withMessage('Order ID is required'),
];

export const paymentFailureValidator = [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('razorpayOrderId').optional().isString(),
  body('error').optional().isString(),
];

export const refundValidator = [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('amount')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0'),
];

export const paymentIdValidator = [
  param('paymentId').notEmpty().withMessage('Payment ID is required'),
];

export const createRazorpayOrderValidator = [
  body('deliveryAddress')
    .notEmpty()
    .withMessage('Delivery address is required')
    .isObject()
    .withMessage('Delivery address must be an object'),
  body('deliveryAddress.address')
    .notEmpty()
    .withMessage('Address is required'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['razorpay', 'cod'])
    .withMessage('Invalid payment method'),
];

export const verifyAndCreateOrderValidator = [
  body('razorpayOrderId')
    .notEmpty()
    .withMessage('Razorpay order ID is required'),
  body('razorpayPaymentId')
    .notEmpty()
    .withMessage('Razorpay payment ID is required'),
  body('razorpaySignature')
    .notEmpty()
    .withMessage('Razorpay signature is required'),
  body('deliveryAddress')
    .notEmpty()
    .withMessage('Delivery address is required')
    .isObject()
    .withMessage('Delivery address must be an object'),
  body('deliveryAddress.address')
    .notEmpty()
    .withMessage('Address is required'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required'),
];

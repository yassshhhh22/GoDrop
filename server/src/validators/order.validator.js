import { body, param } from 'express-validator';

export const createOrderValidator = [
  body('deliveryAddress')
    .notEmpty()
    .withMessage('Delivery address is required')
    .isObject()
    .withMessage('Delivery address must be an object'),
  body('deliveryAddress.address')
    .trim()
    .notEmpty()
    .withMessage('Address text is required'),
  body('deliveryAddress.coordinates')
    .optional()
    .isObject()
    .withMessage('Coordinates must be an object'),
  body('paymentMethod')
    .trim()
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['cod', 'razorpay'])
    .withMessage('Payment method must be cod or razorpay'),
  body('couponCode')
    .optional()
    .trim()
    .isString()
    .withMessage('Coupon code must be a string'),
  body('giftWrap')
    .optional()
    .isObject()
    .withMessage('Gift wrap must be an object'),
  body('giftWrap.enabled')
    .optional()
    .isBoolean()
    .withMessage('Gift wrap enabled must be a boolean'),
  body('giftWrap.message')
    .optional()
    .trim()
    .isString()
    .withMessage('Gift wrap message must be a string')
    .isLength({ max: 200 })
    .withMessage('Gift wrap message must not exceed 200 characters'),
  body('deliveryInstructions')
    .optional()
    .trim()
    .isString()
    .withMessage('Delivery instructions must be a string'),
];

export const orderIdValidator = [
  param('orderId')
    .trim()
    .notEmpty()
    .withMessage('Order ID is required')
    .isString()
    .withMessage('Order ID must be a string'),
];

export const updateOrderStatusValidator = [
  param('orderId').trim().notEmpty().withMessage('Order ID is required'),
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn([
      'pending',
      'confirmed',
      'picked',
      'arriving',
      'delivered',
      'cancelled',
    ])
    .withMessage('Invalid order status'),
];

export const cancelOrderValidator = [
  param('orderId').trim().notEmpty().withMessage('Order ID is required'),
  body('reason')
    .optional()
    .trim()
    .isString()
    .withMessage('Cancellation reason must be a string')
    .isLength({ max: 500 })
    .withMessage('Reason must not exceed 500 characters'),
];

export const assignPartnerValidator = [
  body('orderId')
    .trim()
    .notEmpty()
    .withMessage('Order ID is required')
    .isString()
    .withMessage('Order ID must be a string'),
  body('deliveryPartnerId')
    .trim()
    .notEmpty()
    .withMessage('Delivery Partner ID is required')
    .isMongoId()
    .withMessage('Invalid Delivery Partner ID'),
];

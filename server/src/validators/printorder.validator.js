import { body, param } from 'express-validator';

export const createPrintOrderValidator = [
  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),

  body('colorType')
    .notEmpty()
    .withMessage('Color type is required')
    .isIn(['bw', 'color'])
    .withMessage('Color type must be either "bw" or "color"'),

  body('printSides')
    .optional()
    .isIn(['single-sided', 'double-sided'])
    .withMessage('Print sides must be "single-sided" or "double-sided"'),

  body('bindingType')
    .optional()
    .isIn(['none', 'stapled', 'spiral'])
    .withMessage('Binding type must be "none", "stapled", or "spiral"'),

  body('deliveryAddress.label')
    .optional()
    .isIn(['Home', 'Work', 'Other'])
    .withMessage('Delivery address label must be Home, Work, or Other'),

  body('deliveryAddress.address')
    .notEmpty()
    .withMessage('Delivery address is required')
    .isString()
    .withMessage('Address must be a string')
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters')
    .trim(),

  body('deliveryAddress.landmark')
    .optional()
    .isString()
    .withMessage('Landmark must be a string')
    .trim(),

  body('deliveryAddress.city')
    .optional()
    .isString()
    .withMessage('City must be a string')
    .trim(),

  body('deliveryAddress.state')
    .optional()
    .isString()
    .withMessage('State must be a string')
    .trim(),

  body('deliveryAddress.pincode')
    .notEmpty()
    .withMessage('Pincode is required')
    .isString()
    .withMessage('Pincode must be a string')
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be 6 digits'),

  body('paymentMethod')
    .optional()
    .isIn(['razorpay', 'cod'])
    .withMessage('Payment method must be "razorpay" or "cod"'),

  body('giftWrap.enabled')
    .optional()
    .isBoolean()
    .withMessage('Gift wrap enabled must be a boolean'),

  body('giftWrap.message')
    .optional()
    .isString()
    .withMessage('Gift wrap message must be a string')
    .isLength({ max: 200 })
    .withMessage('Gift wrap message cannot exceed 200 characters')
    .trim(),
];

export const printOrderIdValidator = [
  param('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isString()
    .withMessage('Order ID must be a string'),
];

export const assignDeliveryPartnerValidator = [
  body('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isString()
    .withMessage('Order ID must be a string'),

  body('deliveryPartnerId')
    .notEmpty()
    .withMessage('Delivery Partner ID is required')
    .isMongoId()
    .withMessage('Invalid Delivery Partner ID'),
];

export const updatePrintOrderStatusValidator = [
  param('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isString()
    .withMessage('Order ID must be a string'),

  body('status')
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
    .withMessage('Invalid status value'),
];

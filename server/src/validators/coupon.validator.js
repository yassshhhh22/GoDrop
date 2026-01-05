import { body } from 'express-validator';

export const applyCouponValidator = [
  body('code')
    .notEmpty()
    .withMessage('Coupon code is required')
    .trim()
    .isString()
    .withMessage('Coupon code must be a string')
    .isLength({ min: 3, max: 20 })
    .withMessage('Coupon code must be between 3 and 20 characters')
    .toUpperCase(),
];

export const validateCouponValidator = [
  body('code')
    .notEmpty()
    .withMessage('Coupon code is required')
    .trim()
    .isString()
    .withMessage('Coupon code must be a string')
    .isLength({ min: 3, max: 20 })
    .withMessage('Coupon code must be between 3 and 20 characters')
    .toUpperCase(),

  body('orderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Order amount must be a positive number'),
];

export const removeCouponValidator = [
  // No validation needed for DELETE request - coupon will be removed from user's cart
  // No body required
];

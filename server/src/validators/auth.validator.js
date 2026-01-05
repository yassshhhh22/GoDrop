import { body } from 'express-validator';

export const sendOTPValidator = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['Customer', 'DeliveryPartner', 'BusinessUser']) // ✅ FIXED: Added BusinessUser
    .withMessage(
      'Invalid role. Must be Customer, DeliveryPartner, or BusinessUser'
    ),
];

export const verifyOTPValidator = [
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),
  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['Customer', 'DeliveryPartner', 'BusinessUser']) 
    .withMessage(
      'Invalid role. Must be Customer, DeliveryPartner, or BusinessUser'
    ),
];

export const refreshTokenValidator = [
  body('refreshToken')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Refresh token is required'),
];

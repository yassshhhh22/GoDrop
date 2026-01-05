import { body, param } from 'express-validator';

export const updateProfileValidator = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
];

export const addAddressValidator = [
  body('label')
    .notEmpty()
    .withMessage('Address label is required')
    .isString()
    .withMessage('Label must be a string')
    .isIn(['Home', 'Work', 'Other'])
    .withMessage('Label must be Home, Work, or Other'),

  body('address')
    .notEmpty()
    .withMessage('Address is required')
    .isString()
    .withMessage('Address must be a string')
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters')
    .trim(),

  body('landmark')
    .optional()
    .isString()
    .withMessage('Landmark must be a string')
    .trim(),

  body('city')
    .optional()
    .isString()
    .withMessage('City must be a string')
    .trim(),

  body('state')
    .optional()
    .isString()
    .withMessage('State must be a string')
    .trim(),

  body('pincode')
    .optional()
    .isString()
    .withMessage('Pincode must be a string')
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be 6 digits'),
];

export const updateAddressValidator = [
  param('addressId')
    .notEmpty()
    .withMessage('Address ID is required')
    .isMongoId()
    .withMessage('Invalid address ID'),

  body('label')
    .optional()
    .isString()
    .withMessage('Label must be a string')
    .isIn(['Home', 'Work', 'Other'])
    .withMessage('Label must be Home, Work, or Other'),

  body('address')
    .optional()
    .isString()
    .withMessage('Address must be a string')
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters')
    .trim(),

  body('landmark')
    .optional()
    .isString()
    .withMessage('Landmark must be a string')
    .trim(),

  body('city')
    .optional()
    .isString()
    .withMessage('City must be a string')
    .trim(),

  body('state')
    .optional()
    .isString()
    .withMessage('State must be a string')
    .trim(),

  body('pincode')
    .optional()
    .isString()
    .withMessage('Pincode must be a string')
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be 6 digits'),
];

export const addressIdValidator = [
  param('addressId')
    .notEmpty()
    .withMessage('Address ID is required')
    .isMongoId()
    .withMessage('Invalid address ID'),
];

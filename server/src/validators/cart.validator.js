import { body, param } from 'express-validator';

export const addItemToCartValidator = [
  // ✅ FIXED: Changed from 'productId' to 'item' to match controller
  body('item')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID format'),

  body('count')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Count must be at least 1'),
];

export const updateCartItemValidator = [
  param('itemId')
    .notEmpty()
    .withMessage('Item ID is required')
    .isMongoId()
    .withMessage('Invalid item ID format'),

  body('count')
    .notEmpty()
    .withMessage('Count is required')
    .isInt({ min: 0 })
    .withMessage('Count must be 0 or greater'),
];

export const removeCartItemValidator = [
  param('itemId')
    .notEmpty()
    .withMessage('Item ID is required')
    .isMongoId()
    .withMessage('Invalid item ID format'),
];
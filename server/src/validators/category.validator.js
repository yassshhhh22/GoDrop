import { param, query } from 'express-validator';

export const getAllCategoriesValidator = [
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
];

export const categoryIdValidator = [
  param('id')
    .notEmpty()
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Invalid category ID format'),
];

export const getProductsInCategoryValidator = [
  param('id')
    .notEmpty()
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Invalid category ID format'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sortBy')
    .optional()
    .isIn(['price', 'name', 'rating', 'createdAt'])
    .withMessage('sortBy must be one of: price, name, rating, createdAt'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order must be asc or desc'),
];
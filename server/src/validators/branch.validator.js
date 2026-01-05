import { query, param } from 'express-validator';

export const getAllBranchesValidator = [
  query('active')
    .optional()
    .isBoolean()
    .withMessage('active must be a boolean value'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

export const branchIdValidator = [
  param('id').isMongoId().withMessage('Invalid branch ID'),
];
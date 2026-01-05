import { body, param } from 'express-validator';

export const updateOrderStatusValidator = [
  param('orderId')
    .notEmpty()
    .withMessage('Order ID is required')
    .isString()
    .withMessage('Order ID must be a string'),

  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['picked', 'arriving', 'delivered'])
    .withMessage('Invalid status. Allowed: picked, arriving, delivered'),
];

export const updateLocationValidator = [
  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
];

export const updateAvailabilityValidator = [
  body('isAvailable')
    .notEmpty()
    .withMessage('isAvailable is required')
    .isBoolean()
    .withMessage('isAvailable must be a boolean value'),
];
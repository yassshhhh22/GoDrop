import Joi from 'joi';
import { body } from 'express-validator';

export const businessRegistrationSchema = Joi.object({
  companyName: Joi.string().min(2).max(100).required().trim().messages({
    'string.empty': 'Company name is required',
    'string.min': 'Company name must be at least 2 characters',
    'string.max': 'Company name cannot exceed 100 characters',
  }),

  gstNumber: Joi.string()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .required()
    .uppercase()
    .messages({
      'string.empty': 'GST number is required',
      'string.pattern.base':
        'Invalid GST number format (e.g., 29ABCDE1234F1Z5)',
    }),

  contactPerson: Joi.string().min(2).max(50).required().trim().messages({
    'string.empty': 'Contact person name is required',
    'string.min': 'Name must be at least 2 characters',
  }),

  email: Joi.string().email().required().lowercase().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
  }),

  address: Joi.string().min(10).max(200).required().trim().messages({
    'string.empty': 'Business address is required',
    'string.min': 'Address must be at least 10 characters',
    'string.max': 'Address cannot exceed 200 characters',
  }),
});

export const businessProfileUpdateSchema = Joi.object({
  companyName: Joi.string().min(2).max(100).trim(),
  gstNumber: Joi.string()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .uppercase(),
  contactPerson: Joi.string().min(2).max(50).trim(),
  email: Joi.string().email().lowercase(),
  address: Joi.string().min(10).max(200).trim(),
}).min(1); // At least one field required

// ✅ NEW: Validator for registered address update
export const updateAddressSchema = [
  body('registeredAddress')
    .optional()
    .isObject()
    .withMessage('Address must be an object'),
  body('registeredAddress.street')
    .notEmpty()
    .withMessage('Street address is required')
    .trim()
    .isLength({ min: 5 })
    .withMessage('Street address must be at least 5 characters'),
  body('registeredAddress.city')
    .notEmpty()
    .withMessage('City is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('City must be at least 2 characters'),
  body('registeredAddress.state')
    .notEmpty()
    .withMessage('State is required')
    .trim()
    .isLength({ min: 2 })
    .withMessage('State must be at least 2 characters'),
  body('registeredAddress.pincode')
    .notEmpty()
    .withMessage('Pincode is required')
    .matches(/^\d{6}$/)
    .withMessage('Pincode must be 6 digits'),
  body('registeredAddress.landmark')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Landmark cannot exceed 100 characters'),
];

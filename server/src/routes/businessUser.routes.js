import express from 'express';
import {
  completeBusinessRegistration,
  getBusinessProfile,
  updateBusinessProfile,
  checkVerificationStatus,
  updateRegisteredAddress, // ✅ NEW
} from '../controllers/businessUser.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validation.middleware.js';
import {
  businessRegistrationSchema,
  businessProfileUpdateSchema,
  updateAddressSchema, // ✅ NEW
} from '../validators/businessUser.validator.js';

const router = express.Router();

// All routes require BusinessUser authentication
router.use(authenticate);
router.use(authorize('BusinessUser'));

/**
 * @route POST /api/business-users/register
 * @desc Complete business registration after OTP verification
 * @access Private (BusinessUser)
 */
router.post(
  '/register',
  validate(businessRegistrationSchema),
  completeBusinessRegistration
);

/**
 * @route GET /api/business-users/profile
 * @desc Get business user profile
 * @access Private (BusinessUser)
 */
router.get('/profile', getBusinessProfile);

/**
 * @route PUT /api/business-users/profile
 * @desc Update business profile (re-apply if rejected)
 * @access Private (BusinessUser)
 */
router.put(
  '/profile',
  validate(businessProfileUpdateSchema),
  updateBusinessProfile
);

/**
 * @route GET /api/business-users/verification-status
 * @desc Check verification status
 * @access Private (BusinessUser)
 */
router.get('/verification-status', checkVerificationStatus);

/**
 * @route PUT /api/business-users/profile/address
 * @desc Update registered delivery address
 * @access Private (BusinessUser)
 */
router.put(
  '/profile/address',
  validate(updateAddressSchema), // ✅ NEW
  updateRegisteredAddress // ✅ NEW
);

export default router;

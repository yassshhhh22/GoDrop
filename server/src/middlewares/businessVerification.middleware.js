import asyncHandler from 'express-async-handler';
import ApiError from '../utils/ApiError.js';
import { BusinessUser } from '../models/index.js';
import { VERIFICATION_STATUS } from '../config/constants.js';

/**
 * Middleware to check if business user is approved
 * Only applies to BusinessUser role
 */
export const requireApprovedBusiness = asyncHandler(async (req, res, next) => {
  // Skip check if not a business user
  if (req.userRole !== 'BusinessUser') {
    return next();
  }

  const businessUser = await BusinessUser.findById(req.userId);

  if (!businessUser) {
    throw new ApiError(404, 'Business user not found');
  }

  if (businessUser.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
    const statusMessages = {
      [VERIFICATION_STATUS.PENDING]:
        'Your business account is pending admin approval',
      [VERIFICATION_STATUS.REJECTED]: `Your business account was rejected. Reason: ${businessUser.rejectionReason || 'Contact support for details'}`,
    };

    throw new ApiError(
      403,
      statusMessages[businessUser.verificationStatus] ||
        'Business account verification required'
    );
  }

  // Attach business user to request for later use
  req.businessUser = businessUser;
  next();
});

/**
 * Middleware to check if user has completed business registration
 */
export const requireBusinessRegistration = asyncHandler(
  async (req, res, next) => {
    if (req.userRole !== 'BusinessUser') {
      return next();
    }

    const businessUser = await BusinessUser.findById(req.userId);

    if (!businessUser || !businessUser.businessDetails?.companyName) {
      throw new ApiError(400, 'Please complete business registration first');
    }

    next();
  }
);

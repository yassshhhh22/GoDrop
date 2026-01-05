import asyncHandler from 'express-async-handler';
import { BusinessUser } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { VERIFICATION_STATUS, MESSAGES } from '../config/constants.js';
import logger from '../utils/logger.js';

/**
 * Complete business registration
 * @route POST /api/business/register
 * @access Private (BusinessUser - after OTP verification)
 */
export const completeBusinessRegistration = asyncHandler(async (req, res) => {
  const { companyName, gstNumber, contactPerson, email, address } = req.body;

  // Find business user
  const businessUser = await BusinessUser.findById(req.userId);

  if (!businessUser) {
    throw new ApiError(
      404,
      'Business user not found. Please verify OTP first.'
    );
  }

  if (
    businessUser.businessDetails?.companyName &&
    businessUser.verificationStatus !== VERIFICATION_STATUS.REJECTED
  ) {
    throw new ApiError(400, 'Business registration already completed');
  }

  // Update business details
  businessUser.businessDetails = {
    companyName,
    gstNumber: gstNumber.toUpperCase(),
    contactPerson,
    email: email.toLowerCase(),
    address,
  };

  // Reset verification status to Pending
  businessUser.verificationStatus = VERIFICATION_STATUS.PENDING;
  businessUser.rejectionReason = undefined; // Clear any previous rejection

  await businessUser.save();

  

  res.json(
    new ApiResponse(
      200,
      {
        user: {
          _id: businessUser._id,
          phone: businessUser.phone,
          role: businessUser.role,
          verificationStatus: businessUser.verificationStatus,
          businessDetails: businessUser.businessDetails,
        },
      },
      'Business registration submitted successfully. Pending admin approval.'
    )
  );
});

/**
 * Get business user profile
 * @route GET /api/business/profile
 * @access Private (BusinessUser)
 */
export const getBusinessProfile = asyncHandler(async (req, res) => {
  const businessUser = await BusinessUser.findById(req.userId);

  if (!businessUser) {
    throw new ApiError(404, 'Business user not found');
  }

  res.json(
    new ApiResponse(
      200,
      { user: businessUser },
      'Profile retrieved successfully'
    )
  );
});

/**
 * Update business profile
 * @route PUT /api/business/profile
 * @access Private (BusinessUser - only if Rejected, can re-apply)
 */
export const updateBusinessProfile = asyncHandler(async (req, res) => {
  const {
    companyName,
    gstNumber,
    contactPerson,
    email,
    address,
    registeredAddress,
  } = req.body;

  const businessUser = await BusinessUser.findById(req.userId);

  if (!businessUser) {
    throw new ApiError(404, 'Business user not found');
  }

  // Update business details
  businessUser.businessDetails = {
    companyName: companyName || businessUser.businessDetails?.companyName,
    gstNumber: gstNumber || businessUser.businessDetails?.gstNumber,
    contactPerson: contactPerson || businessUser.businessDetails?.contactPerson,
    email: email || businessUser.businessDetails?.email,
    address: address || businessUser.businessDetails?.address,
  };

  if (registeredAddress) {
    businessUser.registeredAddress = {
      street:
        registeredAddress.street || businessUser.registeredAddress?.street,
      city: registeredAddress.city || businessUser.registeredAddress?.city,
      state: registeredAddress.state || businessUser.registeredAddress?.state,
      pincode:
        registeredAddress.pincode || businessUser.registeredAddress?.pincode,
      landmark:
        registeredAddress.landmark ||
        businessUser.registeredAddress?.landmark ||
        '',
    };
  }

  // Reset verification status to Pending after edit (only if previously rejected)
  if (businessUser.verificationStatus === VERIFICATION_STATUS.REJECTED) {
    businessUser.verificationStatus = VERIFICATION_STATUS.PENDING;
    businessUser.rejectionReason = undefined;
  }

  await businessUser.save();

  res.json(
    new ApiResponse(
      200,
      { user: businessUser },
      'Business profile updated successfully'
    )
  );
});

/**
 * Check verification status
 * @route GET /api/business/verification-status
 * @access Private (BusinessUser)
 */
export const checkVerificationStatus = asyncHandler(async (req, res) => {
  const businessUser = await BusinessUser.findById(req.userId).select(
    'verificationStatus rejectionReason approvedAt approvedBy'
  );

  if (!businessUser) {
    throw new ApiError(404, 'Business user not found');
  }

  res.json(
    new ApiResponse(
      200,
      {
        verificationStatus: businessUser.verificationStatus,
        rejectionReason: businessUser.rejectionReason,
        approvedAt: businessUser.approvedAt,
      },
      'Verification status retrieved'
    )
  );
});

/**
 * Update registered delivery address
 * @route PUT /api/business-users/profile/address
 * @access Private (BusinessUser)
 */
export const updateRegisteredAddress = asyncHandler(async (req, res) => {
  const { registeredAddress } = req.body;
  const businessUserId = req.userId;

  const businessUser = await BusinessUser.findById(businessUserId);

  if (!businessUser) {
    throw new ApiError(404, 'Business user not found');
  }

  if (registeredAddress) {
    businessUser.registeredAddress = {
      street: registeredAddress.street,
      city: registeredAddress.city,
      state: registeredAddress.state,
      pincode: registeredAddress.pincode,
      landmark: registeredAddress.landmark || '',
      updatedAt: new Date(),
    };
  }

  await businessUser.save();



  res.json(
    new ApiResponse(
      200,
      {
        registeredAddress: businessUser.registeredAddress,
      },
      'Address updated successfully'
    )
  );
});

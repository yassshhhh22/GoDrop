import asyncHandler from 'express-async-handler';
import {
  Customer,
  DeliveryPartner,
  Admin,
  BusinessUser,
} from '../models/index.js'; // ✅ Add BusinessUser
import { sendOTP as sendOTPService } from '../services/fast2sms.service.js';
import {
  verifyOTP as verifyOTPService,
  checkOTPRateLimit,
} from '../config/redis.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt.utils.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import logger from '../utils/logger.js';
import { MESSAGES } from '../config/constants.js';

export const sendOTP = asyncHandler(async (req, res) => {
  const { phone, role } = req.body;

  // ✅ FIXED: Include BusinessUser
  if (!['Customer', 'DeliveryPartner', 'BusinessUser'].includes(role)) {
    throw new ApiError(400, 'Invalid role. Admin login via /admin only');
  }

  if (!phone) {
    throw new ApiError(400, 'Phone number is required');
  }

  const phoneRegex = /^\+91[6-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    throw new ApiError(400, 'Invalid phone number format. Use +91XXXXXXXXXX');
  }

  const canSendOTP = await checkOTPRateLimit(phone);
  if (!canSendOTP) {
    throw new ApiError(
      429,
      'Too many OTP requests. Please try again after 1 hour.'
    );
  }

  const result = await sendOTPService(phone);

  if (!result.success) {
    throw new ApiError(503, result.message);
  }

  logger.info('OTP sent successfully', { phone, role });

  res.json(new ApiResponse(200, { phone }, result.message));
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { phone, otp, role } = req.body;

  // ✅ Updated: Include BusinessUser
  if (!['Customer', 'DeliveryPartner', 'BusinessUser'].includes(role)) {
    throw new ApiError(400, 'Invalid role. Admin login via /admin only');
  }

  const verification = await verifyOTPService(phone, otp);

  if (!verification.valid) {
    throw new ApiError(400, verification.message);
  }

  let user;
  let Model;

  // ✅ Updated: Handle BusinessUser
  if (role === 'Customer') {
    Model = Customer;
  } else if (role === 'DeliveryPartner') {
    Model = DeliveryPartner;
  } else if (role === 'BusinessUser') {
    Model = BusinessUser;
  }

  user = await Model.findOne({ phone });

  // ✅ FIXED: Create BusinessUser immediately with empty details
  let needsRegistration = false;

  if (!user) {
    user = await Model.create({
      phone,
      role,
      isActivated: true,
      // ✅ NEW: For BusinessUser, mark that registration is incomplete
      ...(role === 'BusinessUser' && {
        verificationStatus: 'Pending', // Will stay Pending until registration complete
      }),
    });

    // ✅ NEW: Flag if business user needs to complete registration
    if (role === 'BusinessUser') {
      needsRegistration = true;
    }

    logger.info('New user created', { phone, role, userId: user._id });
  } else if (!user.isActivated) {
    user.isActivated = true;
    await user.save();
  }

  // ✅ FIXED: Check if existing BusinessUser has completed registration
  if (role === 'BusinessUser' && !user.businessDetails?.companyName) {
    needsRegistration = true;
  }

  // ✅ Generate tokens for all users (including new BusinessUser)
  const accessToken = generateAccessToken({
    userId: user._id,
    role: user.role,
    customerType:
      role === 'BusinessUser'
        ? 'BusinessUser'
        : role === 'Customer'
          ? 'Customer'
          : null,
  });

  const refreshToken = generateRefreshToken({
    userId: user._id,
    role: user.role,
    customerType:
      role === 'BusinessUser'
        ? 'BusinessUser'
        : role === 'Customer'
          ? 'Customer'
          : null,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  logger.info('User logged in successfully', { phone, role, userId: user._id });

  res.json(
    new ApiResponse(
      200,
      {
        user: {
          _id: user._id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          isActivated: user.isActivated,
          // ✅ NEW: Include verification status for business users
          ...(role === 'BusinessUser' && {
            verificationStatus: user.verificationStatus,
            businessDetails: user.businessDetails || {},
            needsRegistration, // ✅ NEW: Tell frontend if registration needed
          }),
        },
        accessToken,
        // ✅ NEW: Add flag for frontend to show registration form
        ...(needsRegistration && { needsRegistration: true }),
      },
      needsRegistration
        ? 'OTP verified. Please complete business registration.'
        : MESSAGES.LOGIN_SUCCESS
    )
  );
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body || req.cookies;

  if (!token) {
    throw new ApiError(401, 'Refresh token is required');
  }

  try {
    const decoded = verifyRefreshToken(token);

    let user;
    switch (decoded.role) {
      case 'Customer':
        user = await Customer.findById(decoded.userId);
        break;
      case 'DeliveryPartner':
        user = await DeliveryPartner.findById(decoded.userId);
        break;
      case 'Admin':
        user = await Admin.findById(decoded.userId);
        break;
      // ✅ NEW: Add BusinessUser case
      case 'BusinessUser':
        user = await BusinessUser.findById(decoded.userId);
        break;
      default:
        throw new ApiError(401, 'Invalid user role');
    }

    if (!user || !user.isActivated) {
      throw new ApiError(401, 'User not found or inactive');
    }

    // ✅ FIXED: Include customerType in new tokens
    const newAccessToken = generateAccessToken({
      userId: user._id,
      role: user.role,
      customerType: decoded.customerType,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user._id,
      role: user.role,
      customerType: decoded.customerType,
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json(
      new ApiResponse(
        200,
        {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        'Token refreshed successfully'
      )
    );
  } catch (error) {
    logger.error('Token refresh failed', { error: error.message });
    throw new ApiError(401, 'Invalid or expired refresh token');
  }
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  logger.info('User logged out', { userId: req.userId });

  res.json(new ApiResponse(200, null, MESSAGES.LOGOUT_SUCCESS));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  let user;

  switch (req.userRole) {
    case 'Customer':
      user = await Customer.findById(req.userId).select('-__v');
      break;
    case 'DeliveryPartner':
      user = await DeliveryPartner.findById(req.userId)
        .select('-password -__v')
        .populate('branch', 'name location');
      break;
    case 'Admin':
      user = await Admin.findById(req.userId).select('-password -__v');
      break;
    case 'BusinessUser':
      user = await BusinessUser.findById(req.userId).select('-__v');
      break;
    default:
      throw new ApiError(400, 'Invalid user role');
  }

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json(new ApiResponse(200, { user }, 'User retrieved successfully'));
});

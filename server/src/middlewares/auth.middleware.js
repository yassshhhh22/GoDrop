import {
  verifyAccessToken,
  extractTokenFromHeader,
} from '../utils/jwt.utils.js';
import ApiError from '../utils/ApiError.js';
import { Customer, DeliveryPartner, BusinessUser } from '../models/index.js';
import { USER_ROLES } from '../config/constants.js';
import asyncHandler from 'express-async-handler';

export const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Not authorized. No token provided');
  }

  try {
    const decoded = verifyAccessToken(token);

    req.userId = decoded.userId;
    req.userRole = decoded.role;

    req.customerType =
      decoded.role === 'BusinessUser' ? 'BusinessUser' : 'Customer';

    next();
  } catch (error) {
    throw new ApiError(401, 'Not authorized. Invalid token');
  }
});

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.userId || !req.userRole) {
      return next(new ApiError(401, 'Authentication required'));
    }

    if (!allowedRoles.includes(req.userRole)) {
      return next(new ApiError(403, 'Access denied. Insufficient permissions'));
    }

    next();
  };
};

// Optional authentication (doesn't throw error if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req);

    if (token) {
      const decoded = verifyAccessToken(token);

      let user;
      switch (decoded.role) {
        case USER_ROLES.CUSTOMER:
          user = await Customer.findById(decoded.userId);
          break;
        case USER_ROLES.DELIVERY_PARTNER:
          user = await DeliveryPartner.findById(decoded.userId);
          break;
        case 'BusinessUser':
          user = await BusinessUser.findById(decoded.userId);
          break;
      }

      if (user && user.isActivated) {
        req.user = user;
        req.userId = user._id;
        req.userRole = user.role;
        req.customerType = decoded.customerType || null;
      }
    }
  } catch (error) {
    // Silently fail for optional auth
  }

  next();
};

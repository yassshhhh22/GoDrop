import crypto from 'crypto';
import { DELIVERY_CONFIG } from '../config/config.js';

/**
 * Calculate order pricing (NO branch assignment logic)
 */
export const calculateOrderPricing = async (
  cartItems,
  couponCode = null,
  giftWrap = null
) => {
  try {
    const { Coupon } = await import('../models/index.js');

    const subtotal = cartItems.reduce((total, cartItem) => {
      const product = cartItem.product || cartItem.item;
      if (!product) {
        throw new Error('Invalid cart item structure');
      }
      const price = product.discountPrice || product.price;
      return total + price * cartItem.count;
    }, 0);

    // Fix: Use DELIVERY_CONFIG.fee instead of .defaultFee, and correct coupon.minOrderAmount
    const deliveryFee = DELIVERY_CONFIG.fee;

    let discount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
      });

      if (coupon) {
        if (subtotal >= coupon.minOrderAmount) {
          // Fix: Changed from minOrderValue to minOrderAmount
          if (coupon.discountType === 'percentage') {
            discount = Math.round((subtotal * coupon.discountValue) / 100);
            if (coupon.maxDiscount) {
              discount = Math.min(discount, coupon.maxDiscount);
            }
          } else {
            discount = coupon.discountValue;
          }
        }
      }
    }

    const giftWrapCharge = giftWrap?.enabled
      ? DELIVERY_CONFIG.giftWrapCharge
      : 0;

    const totalPrice = subtotal + deliveryFee - discount + giftWrapCharge;

    return {
      success: true,
      subtotal,
      deliveryFee,
      discount,
      giftWrapCharge,
      totalPrice,
    };
  } catch (error) {
    console.error('Error calculating order pricing:', error);
    return {
      success: false,
      message: error.message || 'Error calculating order pricing',
    };
  }
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export const calculateDeliveryFee = (distance) => {
  if (distance <= 2) return 0; // Free delivery within 2km
  if (distance <= 5) return 20;
  if (distance <= 10) return 40;
  return 60;
};

export const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Add +91 if not present
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  }

  return cleaned;
};

export const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

export const getPaginationParams = (page = 1, limit = 20) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const skip = (pageNum - 1) * limitNum;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
  };
};

export const formatPaginationResponse = (data, page, limit, total) => {
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    },
  };
};

export const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;
  delete userObj.__v;
  return userObj;
};

export const getEstimatedDeliveryTime = (distance) => {
  const baseTime = 10;
  const timePerKm = 5;
  return baseTime + Math.ceil(distance) * timePerKm;
};

export const formatDeliveryTime = (minutes) => {
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

/**
 * Check if order can be cancelled
 * @param {String} status - Current order status
 * @param {Date} createdAt - Order creation date
 * @returns {Object} { allowed: Boolean, message: String }
 */
export const canCancelOrder = (status, createdAt) => {
  // ✅ FIX: Allow cancellation for pending and confirmed orders
  const cancellableStatuses = ['pending', 'confirmed'];

  if (!cancellableStatuses.includes(status)) {
    return {
      allowed: false,
      message: `Order cannot be cancelled once it is ${status}`,
    };
  }

  // ✅ OPTIONAL: Time-based cancellation (e.g., within 5 minutes of creation)
  // Uncomment if you want time restriction
  /*
  const orderAge = Date.now() - new Date(createdAt).getTime();
  const maxCancelTime = 5 * 60 * 1000; // 5 minutes in milliseconds

  if (orderAge > maxCancelTime) {
    return {
      allowed: false,
      message: 'Order can only be cancelled within 5 minutes of placement',
    };
  }
  */

  return {
    allowed: true,
    message: 'Order can be cancelled',
  };
};

export const generateInvoiceNumber = (orderId) => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `INV-${year}${month}-${orderId}`;
};

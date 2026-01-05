import asyncHandler from 'express-async-handler';
import { Coupon, Cart, Order } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import logger from '../utils/logger.js';

export const getAvailableCoupons = asyncHandler(async (req, res) => {
  const now = new Date();

  // Find active coupons that are currently valid
  const coupons = await Coupon.find({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
  })
    .select('-usedBy -createdBy -__v')
    .sort({ discountValue: -1 });

  // Filter coupons based on user eligibility
  const eligibleCoupons = [];

  for (const coupon of coupons) {
    // Check if usage limit reached
    if (coupon.isUsageLimitReached) {
      continue;
    }

    // Check if user has reached per-user limit
    if (!coupon.canUserUseCoupon(req.userId)) {
      continue;
    }

    // Check first order restriction
    if (coupon.firstOrderOnly) {
      const userOrderCount = await Order.countDocuments({
        customer: req.userId,
        status: {
          $in: ['delivered', 'confirmed', 'picked', 'out_for_delivery'],
        },
      });

      if (userOrderCount > 0) {
        continue;
      }
    }

    eligibleCoupons.push({
      _id: coupon._id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscount: coupon.maxDiscount,
      minOrderAmount: coupon.minOrderAmount,
      validUntil: coupon.validUntil,
      perUserLimit: coupon.perUserLimit,
      firstOrderOnly: coupon.firstOrderOnly,
    });
  }

  res.json(
    new ApiResponse(
      200,
      {
        coupons: eligibleCoupons,
        count: eligibleCoupons.length,
      },
      'Available coupons retrieved successfully'
    )
  );
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    throw new ApiError(400, 'Coupon code is required');
  }

  const cart = await Cart.findOne({ customer: req.userId }).populate(
    'items.item',
    'name price discountPrice businessPrice category'
  );

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  // ✅ NEW: Use correct pricing based on user type
  const subtotal = cart.items.reduce((total, item) => {
    let price;
    if (req.userRole === 'BusinessUser' && item.item.businessPrice) {
      price = item.item.businessPrice;
    } else {
      price = item.item.discountPrice || item.item.price;
    }
    return total + price * item.count;
  }, 0);

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    throw new ApiError(404, 'Invalid coupon code');
  }

  // Check if coupon is expired
  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validUntil) {
    throw new ApiError(400, 'This coupon has expired or is not yet valid');
  }

  // Check usage limit
  if (coupon.isUsageLimitReached) {
    throw new ApiError(400, 'This coupon usage limit has been reached');
  }

  // Check per-user limit
  if (!coupon.canUserUseCoupon(req.userId)) {
    throw new ApiError(400, 'You have already used this coupon maximum times');
  }

  // Check first order restriction
  if (coupon.firstOrderOnly) {
    const userOrderCount = await Order.countDocuments({
      customer: req.userId,
      status: { $in: ['delivered', 'confirmed', 'picked', 'out_for_delivery'] },
    });

    if (userOrderCount > 0) {
      throw new ApiError(400, 'This coupon is valid only for first order');
    }
  }

  if (
    coupon.applicableTo.categories.length > 0 ||
    coupon.applicableTo.products.length > 0
  ) {
    let hasApplicableItems = false;

    for (const item of cart.items) {
      // Check if product is in applicable products

      if (
        coupon.applicableTo.products.some(
          (p) => p.toString() === item.item._id.toString()
        )
      ) {
        hasApplicableItems = true;
        break;
      }

      // Check if product category is in applicable categories

      if (
        coupon.applicableTo.categories.some(
          (c) => c.toString() === item.item.category.toString()
        )
      ) {
        hasApplicableItems = true;
        break;
      }
    }

    if (!hasApplicableItems) {
      throw new ApiError(
        400,
        'This coupon is not applicable to items in your cart'
      );
    }
  }

  const discountResult = coupon.calculateDiscount(subtotal);

  if (!discountResult.valid) {
    throw new ApiError(400, discountResult.message);
  }

  cart.appliedCoupon = coupon._id;
  cart.couponDiscount = discountResult.discount;
  await cart.save();

  res.json(
    new ApiResponse(
      200,
      {
        coupon: {
          _id: coupon._id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minOrderAmount: coupon.minOrderAmount, // Include minOrderAmount
          maxDiscount: coupon.maxDiscount, // Include maxDiscount
        },
        pricing: {
          subtotal,
          discount: discountResult.discount,
          finalAmount: discountResult.finalAmount,
        },
      },
      'Coupon applied successfully'
    )
  );
});

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;

  if (!code) {
    throw new ApiError(400, 'Coupon code is required');
  }

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    return res.json(
      new ApiResponse(
        200,
        {
          valid: false,
          message: 'Invalid coupon code',
        },
        'Coupon validation completed'
      )
    );
  }

  const now = new Date();
  if (now < coupon.validFrom) {
    return res.json(
      new ApiResponse(
        200,
        {
          valid: false,
          message: `This coupon will be valid from ${coupon.validFrom.toLocaleDateString()}`,
        },
        'Coupon validation completed'
      )
    );
  }

  if (now > coupon.validUntil) {
    return res.json(
      new ApiResponse(
        200,
        {
          valid: false,
          message: 'This coupon has expired',
        },
        'Coupon validation completed'
      )
    );
  }

  if (coupon.isUsageLimitReached) {
    return res.json(
      new ApiResponse(
        200,
        {
          valid: false,
          message: 'This coupon usage limit has been reached',
        },
        'Coupon validation completed'
      )
    );
  }

  if (!coupon.canUserUseCoupon(req.userId)) {
    return res.json(
      new ApiResponse(
        200,
        {
          valid: false,
          message: 'You have already used this coupon maximum times',
        },
        'Coupon validation completed'
      )
    );
  }

  if (coupon.firstOrderOnly) {
    const userOrderCount = await Order.countDocuments({
      customer: req.userId,
      status: { $in: ['delivered', 'confirmed', 'picked', 'out_for_delivery'] },
    });

    if (userOrderCount > 0) {
      return res.json(
        new ApiResponse(
          200,
          {
            valid: false,
            message: 'This coupon is valid only for first order',
          },
          'Coupon validation completed'
        )
      );
    }
  }

  let discountResult = { valid: true };
  if (orderAmount) {
    discountResult = coupon.calculateDiscount(orderAmount);
  }

  res.json(
    new ApiResponse(
      200,
      {
        valid: discountResult.valid,
        message: discountResult.message || 'Coupon is valid',
        coupon: {
          _id: coupon._id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maxDiscount: coupon.maxDiscount,
          minOrderAmount: coupon.minOrderAmount,
        },
        discount: discountResult.discount || null,
      },
      'Coupon validation completed'
    )
  );
});

export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ customer: req.userId }).populate(
    'items.item',
    'name price discountPrice'
  );

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  cart.appliedCoupon = undefined; // Or null
  cart.couponDiscount = 0;
  await cart.save();

  // Recalculate subtotal for response, as it might have changed
  const subtotal = cart.items.reduce((total, item) => {
    const price = item.item.discountPrice || item.item.price;
    return total + price * item.count;
  }, 0);

  const totalItems = cart.items.reduce((total, item) => total + item.count, 0);

  res.json(
    new ApiResponse(
      200,
      {
        cart: {
          _id: cart._id,
          items: cart.items,
          subtotal,
          totalItems,
          discount: 0,
          finalAmount: subtotal, // Final amount will be subtotal after removing discount
          appliedCoupon: null, // Explicitly set to null in response
          couponDiscount: 0, // Explicitly set to 0 in response
        },
      },
      'Coupon removed successfully'
    )
  );
});

import asyncHandler from 'express-async-handler';
import { Order } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import {
  createOrder as createRazorpayOrder,
  verifyPayment,
  fetchPayment,
  refundPayment,
  getRazorpayKeyId,
} from '../services/razorpay.service.js';
import logger from '../utils/logger.js';
import { RAZORPAY_CONFIG } from '../config/config.js';
import { PAYMENT_METHODS, VERIFICATION_STATUS } from '../config/constants.js';
import { DELIVERY_CONFIG } from '../config/config.js';

export const getRazorpayKey = asyncHandler(async (req, res) => {
  const keyId = getRazorpayKeyId();

  if (!keyId) {
    throw new ApiError(503, 'Payment service not configured');
  }

  res.json(
    new ApiResponse(200, { keyId }, 'Razorpay key retrieved successfully')
  );
});

/**
 * Create Razorpay Order (NOT DB Order)
 * @route POST /api/payment/create-order
 * @access Private
 * @description Creates Razorpay order, DB order created after payment verification
 */
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

 

  const order = await Order.findOne({ orderId, status: 'pending' });

  if (!order) {
    throw new ApiError(404, 'Order not found or invalid status for payment');
  }


  if (order.payment.status !== 'pending') {
    console.error('❌ Payment already processed for order:', orderId);
    throw new ApiError(400, 'Payment already processed for this order');
  }

  try {

    const razorpayResult = await createRazorpayOrder(
      order.totalPrice,
      'INR',
      orderId, // receipt
      {
        orderId: order.orderId,
        customerId: order.customer.toString(),
      }
    );


    if (!razorpayResult.success) {
      
      throw new ApiError(500, razorpayResult.message);
    }

    logger.info('Razorpay order created', {
      razorpayOrderId: razorpayResult.order.id,
      dbOrderId: orderId,
      amount: order.totalPrice,
    });

    res.json(
      new ApiResponse(
        200,
        {
          razorpayOrderId: razorpayResult.order.id,
          amount: razorpayResult.order.amount / 100, // Convert from paise to rupees
          currency: razorpayResult.order.currency,
          orderId: order.orderId,
        },
        'Payment order created successfully'
      )
    );
  } catch (error) {
    logger.error('Error creating Razorpay order', {
      orderId,
      error: error.message,
      stack: error.stack,
    });

    throw error;
  }
});

/**
 * Verify Payment Signature
 * @route POST /api/payment/verify
 * @access Private
 * @description Verifies Razorpay signature and confirms payment
 */
export const verifyPaymentSignature = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } =
    req.body;

  const verification = verifyPayment(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  if (!verification.valid) {
    logger.error('Payment signature verification failed', {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
    });

    throw new ApiError(400, 'Payment verification failed. Invalid signature');
  }

  const order = await Order.findOne({ orderId });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  order.payment.status = 'success';
  order.payment.razorpayOrderId = razorpayOrderId;
  order.payment.razorpayPaymentId = razorpayPaymentId;
  order.payment.verifiedAt = new Date();



  await order.save();

  const io = req.app.get('io');
  if (io) {
    // Notify admin dashboard that payment was successful
    io.to('admin_dashboard').emit('paymentVerified', {
      orderId,
      razorpayPaymentId,
      message: 'Payment verified. Awaiting admin approval',
    });
  }

  logger.info('Payment verified successfully', {
    orderId,
    razorpayPaymentId,
    customerId: order.customer,
  });

  res.json(
    new ApiResponse(
      200,
      {
        orderId: order.orderId,
        status: order.status, 
        paymentStatus: order.payment.status, 
      },
      'Payment verified successfully. Your order is pending admin approval.'
    )
  );
});

export const handlePaymentFailure = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, error } = req.body;

  if (!orderId) {
    throw new ApiError(400, 'Order ID is required');
  }

  const order = await Order.findOne({ orderId });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.customer.toString() !== req.userId.toString()) {
    throw new ApiError(403, 'You are not authorized to update this payment');
  }

  logger.error('Payment failed', {
    orderId,
    razorpayOrderId,
    error,
  });

  order.payment.status = 'failed';
  await order.save();

  const io = req.app.get('io');
  io.to(`order_${orderId}`).emit('paymentFailed', {
    orderId,
    status: 'failed',
  });

  res.json(
    new ApiResponse(
      200,
      { orderId, paymentStatus: 'failed' },
      'Payment failure recorded'
    )
  );
});

export const getPaymentDetails = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  if (!paymentId) {
    throw new ApiError(400, 'Payment ID is required');
  }

  const result = await fetchPayment(paymentId);

  if (!result.success) {
    throw new ApiError(500, result.message);
  }

  res.json(
    new ApiResponse(200, result.payment, 'Payment details fetched successfully')
  );
});

export const initiateRefund = asyncHandler(async (req, res) => {
  const { orderId, amount } = req.body;

  if (!orderId) {
    throw new ApiError(400, 'Order ID is required');
  }

  const order = await Order.findOne({ orderId });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (
    req.userRole !== 'Admin' &&
    order.customer.toString() !== req.userId.toString()
  ) {
    throw new ApiError(403, 'You are not authorized to refund this order');
  }

  if (order.payment.status !== 'success') {
    throw new ApiError(400, 'Cannot refund unpaid order');
  }

  if (order.payment.status === 'refunded') {
    throw new ApiError(400, 'Order already refunded');
  }

  const result = await refundPayment(order.payment.razorpayPaymentId, amount);

  if (!result.success) {
    throw new ApiError(500, result.message);
  }

  order.payment.status = 'refunded';
  order.status = 'cancelled';
  order.statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    updatedBy: req.userId,
  });

  await order.save();

  const io = req.app.get('io');
  io.to(`order_${orderId}`).emit('refundInitiated', {
    orderId,
    refundId: result.refund.id,
    amount: result.refund.amount,
  });

  res.json(
    new ApiResponse(200, result.refund, 'Refund initiated successfully')
  );
});

/**
 * Create Razorpay Order WITHOUT creating DB order
 * @route POST /api/payment/create-razorpay-order
 * @access Private
 */
export const createRazorpayOrderOnly = asyncHandler(async (req, res) => {
  const { deliveryAddress, paymentMethod, giftWrap } = req.body;


  const { getRazorpayStatus } = await import('../services/razorpay.service.js');
  const razorpayStatus = getRazorpayStatus();

  if (!razorpayStatus.configured || !razorpayStatus.instance) {
    throw new ApiError(
      503,
      'Payment gateway not configured. Please contact support.'
    );
  }

  const Cart = (await import('../models/index.js')).Cart;
  const cart = await Cart.findOne({ customer: req.userId }).populate({
    path: 'items.item',
    select: 'name price businessPrice discountPrice stock inStock',
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  const { getProductPrice } = await import('../utils/businessHelpers.js');

  const itemsTotal = cart.items.reduce((sum, item) => {
    const product = item.item;
    const appliedPrice = getProductPrice(product, req.customerType);
    return sum + appliedPrice * item.count;
  }, 0);

  let effectiveItemsTotal = itemsTotal;
  const cartCouponDiscount = cart.couponDiscount || 0;
  effectiveItemsTotal -= cartCouponDiscount;

  const deliveryFee =
    effectiveItemsTotal >= DELIVERY_CONFIG.freeDeliveryThreshold
      ? 0
      : DELIVERY_CONFIG.fee;

  const giftWrapCharge = giftWrap?.enabled ? DELIVERY_CONFIG.giftWrapCharge : 0;

  const totalPrice = effectiveItemsTotal + deliveryFee + giftWrapCharge;

 

  if (!totalPrice || totalPrice <= 0) {
    throw new ApiError(400, 'Invalid order amount');
  }

  const userIdShort = req.userId.toString().substring(0, 8);
  const timestampShort = Date.now().toString().slice(-8);
  const receipt = `TMP_${userIdShort}_${timestampShort}`;

  const razorpayResult = await createRazorpayOrder(totalPrice, 'INR', receipt, {
    customerId: req.userId.toString(),
    itemCount: cart.items.length,
  });

  if (!razorpayResult.success) {
    console.error('❌ Razorpay order creation failed:', razorpayResult);
    throw new ApiError(
      500,
      razorpayResult.message || 'Failed to create payment order',
      {
        errorCode: razorpayResult.errorCode,
        errorSource: razorpayResult.errorSource,
      }
    );
  }

  logger.info('Razorpay order created (no DB order yet)', {
    razorpayOrderId: razorpayResult.order.id,
    userId: req.userId,
    amount: totalPrice,
    couponDiscount: cartCouponDiscount,
  });

  res.json(
    new ApiResponse(
      200,
      {
        razorpayOrderId: razorpayResult.order.id,
        amount: totalPrice,
        currency: razorpayResult.order.currency,
      },
      'Razorpay order created successfully'
    )
  );
});

/**
 * Verify Payment AND Create DB Order
 * @route POST /api/payment/verify-and-create-order
 * @access Private
 */
export const verifyPaymentAndCreateOrder = asyncHandler(async (req, res) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    deliveryAddress,
    paymentMethod,
    giftWrap, // Add giftWrap to payload
  } = req.body; // couponCode will be read from cart

  

  const verification = verifyPayment(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  if (!verification.valid) {
    logger.error('Payment signature verification failed', {
      razorpayOrderId,
      razorpayPaymentId,
    });
    throw new ApiError(400, 'Payment verification failed. Invalid signature');
  }


  const { Cart, Product, BusinessUser, Coupon } = await import(
    '../models/index.js'
  );

  const cart = await Cart.findOne({ customer: req.userId }).populate({
    path: 'items.item',
    select:
      'name price businessPrice discountPrice images inStock stock moq category',
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  for (const cartItem of cart.items) {
    const product = cartItem.item;
    if (!product.inStock || product.stock < cartItem.count) {
      throw new ApiError(400, `Insufficient stock for ${product.name}`);
    }
  }

  const { getProductPrice } = await import('../utils/businessHelpers.js');

  const orderItems = cart.items.map((cartItem) => {
    const product = cartItem.item;
    const appliedPrice = getProductPrice(product, req.customerType);
    return {
      item: product._id,
      count: cartItem.count,
      price: appliedPrice,
      subtotal: appliedPrice * cartItem.count,
    };
  });

  let itemsTotalBeforeDiscount = orderItems.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );
  let discount = cart.couponDiscount || 0; // Use couponDiscount directly from cart

  let effectiveItemsTotal = itemsTotalBeforeDiscount - discount;

  const deliveryFee =
    effectiveItemsTotal >= DELIVERY_CONFIG.freeDeliveryThreshold
      ? 0
      : DELIVERY_CONFIG.fee;

  const giftWrapCharge = giftWrap?.enabled // Calculate gift wrap charge
    ? DELIVERY_CONFIG.giftWrapCharge
    : 0;

  const totalPrice = effectiveItemsTotal + deliveryFee + giftWrapCharge;

  const customerType =
    req.userRole === 'BusinessUser' ? 'BusinessUser' : 'Customer';

  if (req.userRole === 'BusinessUser') {
    const { VERIFICATION_STATUS } = await import('../config/constants.js');
    const businessUser = await BusinessUser.findById(req.userId);

    if (businessUser?.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
      throw new ApiError(403, 'Business account not approved');
    }
  }

  const Order = (await import('../models/index.js')).Order;

  const order = await Order.create({
    customer: req.userId,
    customerType,
    orderType: 'normal',
    items: orderItems,
    deliveryAddress: {
      label: deliveryAddress.label || 'Other',
      address: deliveryAddress.address,
      landmark: deliveryAddress.landmark || '',
      city: deliveryAddress.city || '',
      state: deliveryAddress.state || '',
      pincode: deliveryAddress.pincode || '',
    },
    giftWrap: {
      // Store gift wrap details
      enabled: giftWrap?.enabled || false,
      message: giftWrap?.message || '',
      charge: giftWrapCharge,
    },
    payment: {
      method: paymentMethod,
      status: 'success',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paidAt: new Date(),
    },
    itemsTotal: itemsTotalBeforeDiscount, // Store total before discount here
    discount: discount, // Store the actual discount applied
    deliveryFee,
    totalPrice,
    status: 'pending',
    statusHistory: [
      {
        status: 'pending',
        timestamp: new Date(),
        updatedBy: req.userId,
        updatedByModel: customerType,
      },
    ],
  });

  for (const cartItem of cart.items) {
    await Product.findByIdAndUpdate(cartItem.item._id, {
      $inc: { stock: -cartItem.count },
    });
  }

  cart.items = [];
  await cart.save();

  // ✅ Populate customer details before emitting socket event
  await order.populate('customer', 'name');

  // Emit a socket event to notify the admin dashboard
  const io = req.app.get('io');
  if (io) {
    io.to('admin_dashboard').emit('paymentVerified', {
      orderId: order.orderId,
      _id: order._id,
      // ✅ Send the populated customer name and total price
      customerName: order.customer.name,
      totalPrice: order.totalPrice,
      status: order.status,
    });
  }

  logger.info('Order created after payment verification', {
    orderId: order.orderId,
    razorpayPaymentId,
    customerId: req.userId,
  });

  res.json(
    new ApiResponse(
      201,
      {
        orderId: order.orderId,
        status: order.status,
        paymentStatus: order.payment.status,
      },
      'Payment verified and order created successfully. Awaiting admin approval.'
    )
  );
});

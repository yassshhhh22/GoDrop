import asyncHandler from 'express-async-handler';
import {
  DeliveryPartner,
  Order,
  Cart,
  Product,
  BusinessUser,
} from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import logger from '../utils/logger.js';
import {
  calculateOrderPricing,
  canCancelOrder,
  generateInvoiceNumber,
} from '../utils/helpers.js';
import { sendOTP } from '../services/fast2sms.service.js';
import { ORDER_STATUS } from '../config/constants.js';
import { getProductPrice } from '../utils/businessHelpers.js';
import { VERIFICATION_STATUS } from '../config/constants.js';
import { DELIVERY_CONFIG } from '../config/config.js';

export const createOrder = asyncHandler(async (req, res) => {
  const {
    deliveryAddress,
    paymentMethod,
    orderType,
    deliveryInstructions,
    giftWrap,
    couponCode,
  } = req.body;

  if (req.userRole === 'BusinessUser') {
    const businessUser = await BusinessUser.findById(req.userId);

    if (!businessUser) {
      throw new ApiError(404, 'Business user not found');
    }

    if (businessUser.verificationStatus !== VERIFICATION_STATUS.APPROVED) {
      throw new ApiError(
        403,
        'Your business account is not approved yet. Please wait for admin approval.'
      );
    }
  }

  if (!deliveryAddress || !deliveryAddress.address) {
    throw new ApiError(400, 'Delivery address is required');
  }

  const cart = await Cart.findOne({ customer: req.userId }).populate({
    path: 'items.item',
    select:
      'name price businessPrice discountPrice images inStock stock moq category',
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(
      400,
      'Cart is empty. Please add items before creating an order.'
    );
  }

  for (const cartItem of cart.items) {
    const product = cartItem.item; // Already populated

    if (!product) {
      throw new ApiError(404, `Product not found in cart`);
    }

    if (!product.inStock) {
      throw new ApiError(400, `Product ${product.name} is out of stock`);
    }

    if (product.stock < cartItem.count) {
      throw new ApiError(
        400,
        `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${cartItem.count}`
      );
    }
  }

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

  const itemsTotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  let appliedCouponId = null;
  let discount = 0;

  if (couponCode) {
    const Coupon = (await import('../models/index.js')).Coupon;
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });

    if (coupon) {
      const discountResult = coupon.calculateDiscount(itemsTotal);
      if (discountResult.valid) {
        discount = Math.round(discountResult.discount);
        appliedCouponId = coupon._id;
      }
    }
  }

  const deliveryFee =
    itemsTotal >= DELIVERY_CONFIG.freeDeliveryThreshold
      ? 0
      : DELIVERY_CONFIG.fee;

  const giftWrapFee = giftWrap?.enabled ? DELIVERY_CONFIG.giftWrapCharge : 0;

  const effectiveItemsTotal = itemsTotal - discount; // Subtract discount
  const totalPrice = effectiveItemsTotal + deliveryFee + giftWrapFee;

  const customerType =
    req.userRole === 'BusinessUser' ? 'BusinessUser' : 'Customer';

  const order = await Order.create({
    customer: req.userId,
    customerType,
    orderType: orderType || 'normal',
    items: orderItems,
    deliveryAddress: {
      label: deliveryAddress.label || 'Other',
      address: deliveryAddress.address,
      landmark: deliveryAddress.landmark || '',
      city: deliveryAddress.city || '',
      state: deliveryAddress.state || '',
      pincode: deliveryAddress.pincode || '',
    },
    deliveryInstructions: deliveryInstructions || '',
    giftWrap: {
      enabled: giftWrap?.enabled || false,
      message: giftWrap?.message || '',
      charge: giftWrapFee,
    },
    payment: {
      method: paymentMethod || 'cod',
      status: 'pending',
    },
    itemsTotal,
    discount,
    appliedCoupon: appliedCouponId,
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
    ...(customerType === 'BusinessUser' && {
      businessDetails: {
        companyName: req.businessUser?.businessDetails?.companyName,
        gstNumber: req.businessUser?.businessDetails?.gstNumber,
      },
    }),
  });

  for (const cartItem of cart.items) {
    await Product.findByIdAndUpdate(cartItem.item._id, {
      $inc: { stock: -cartItem.count },
    });
  }

  cart.items = [];
  await cart.save();

  await order.populate([
    { path: 'customer', select: 'name phone email' },
    {
      path: 'items.item',
      select: 'name price businessPrice discountPrice images category',
    },
  ]);

  try {
    const smsResult = await sendOTP(order.customer.phone);
    if (smsResult.success) {
      logger.info('Order confirmation SMS sent', {
        orderId: order.orderId,
        phone: order.customer.phone,
      });
    }
  } catch (error) {
    logger.error('Failed to send order confirmation SMS', {
      error: error.message,
    });
  }

  const io = req.app.get('io');
  if (io) {
    io.to('admin_dashboard').emit('newOrder', {
      orderId: order.orderId,
      customerName: order.customer.name,
      customerType,
      totalPrice: order.totalPrice,
      itemCount: order.items.length,
    });
  }

  logger.info('Order created successfully', {
    orderId: order.orderId,
    userId: req.userId,
    customerType,
    itemsTotal,
    discount,
    deliveryFee,
    totalPrice,
  });

  res.status(201).json(
    new ApiResponse(
      201,
      {
        orderId: order.orderId,
        _id: order._id,
        orderType: order.orderType,
        customer: {
          _id: order.customer._id,
          name: order.customer.name,
          email: order.customer.email,
          phone: order.customer.phone,
        },
        items: order.items.map((item) => ({
          _id: item._id,
          product: {
            _id: item.item._id,
            name: item.item.name,
            images: item.item.images,
            category: item.item.category,
          },
          quantity: item.count,
          price: item.price,
          subtotal: item.subtotal,
        })),
        deliveryAddress: order.deliveryAddress,
        payment: order.payment,
        pricing: {
          subtotal: order.itemsTotal,
          discount: order.discount,
          deliveryFee: order.deliveryFee,
          giftWrapFee: order.giftWrap?.charge || 0,
          totalPrice: order.totalPrice,
        },
        appliedCoupon: order.appliedCoupon,
        status: order.status,
        timeline: order.statusHistory,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      'Order created successfully with discount applied.'
    )
  );
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findOne({ orderId })
    .populate('customer', 'name phone email')
    .populate('items.item', 'name price discountPrice businessPrice images category')
    .populate('deliveryPartner', 'name phone vehicleDetails liveLocation')
    .populate('branch', 'name location address')
    .populate('appliedCoupon', 'code discountType discountValue')
    .lean();

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (
    req.userRole !== 'Admin' &&
    order.customer._id.toString() !== req.userId.toString() &&
    (!order.deliveryPartner ||
      order.deliveryPartner._id.toString() !== req.userId.toString())
  ) {
    throw new ApiError(403, 'You are not authorized to view this order');
  }

  // Format response with pricing breakdown
  const formattedOrder = {
    ...order,
    pricing: {
      subtotal: order.itemsTotal,
      discount: order.discount,
      deliveryFee: order.deliveryFee,
      giftWrapFee: order.giftWrap?.charge || 0,
      totalPrice: order.totalPrice,
    },
  };

  res.json(
    new ApiResponse(
      200,
      { order: formattedOrder },
      'Order retrieved successfully'
    )
  );
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, orderType, page = 1, limit = 10 } = req.query;

  const query = {};

  if (req.userRole === 'Customer') {
    query.customer = req.userId;
    query.customerType = 'Customer';
  } else if (req.userRole === 'BusinessUser') {
    query.customer = req.userId;
    query.customerType = 'BusinessUser';
  } else if (req.userRole === 'DeliveryPartner') {
    query.deliveryPartner = req.userId;
  }
  // Admin sees all orders (no filter)

  // Additional filters
  if (status) {
    query.status = status;
  }

  if (orderType) {
    query.orderType = orderType;
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate('customer', 'name phone')
    .populate('deliveryPartner', 'name phone')
    .populate('items.item', 'name price image')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(query);

  res.json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
      'Orders retrieved successfully'
    )
  );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  // Validate status
  if (!Object.values(ORDER_STATUS).includes(status)) {
    throw new ApiError(400, 'Invalid order status');
  }

  const order = await Order.findOne({ orderId });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (req.userRole === 'DeliveryPartner') {
    if (
      !order.deliveryPartner ||
      order.deliveryPartner.toString() !== req.userId.toString()
    ) {
      throw new ApiError(
        403,
        'You are not authorized to update this order status'
      );
    }
  }

  // Update status
  order.status = status;
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy: req.userId,
  });

  // Handle delivery completion
  if (status === 'delivered') {
    order.actualDeliveryTime = new Date();
    order.invoiceUrl = generateInvoiceNumber(order.orderId);
  }

  await order.save();

  const io = req.app.get('io');
  if (io) {
    io.to(`order_${orderId}`).emit('orderStatusUpdated', {
      orderId,
      status,
      timestamp: new Date(),
    });
  }

  logger.info('Order status updated', {
    orderId,
    newStatus: status,
    updatedBy: req.userId,
  });

  res.json(
    new ApiResponse(
      200,
      {
        orderId: order.orderId,
        status: order.status,
        statusHistory: order.statusHistory,
      },
      'Order status updated successfully'
    )
  );
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  const order = await Order.findOne({ orderId });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (
    req.userRole === 'Customer' &&
    order.customer.toString() !== req.userId.toString()
  ) {
    throw new ApiError(403, 'You are not authorized to cancel this order');
  }

  if (
    req.userRole === 'BusinessUser' &&
    order.customer.toString() !== req.userId.toString()
  ) {
    throw new ApiError(403, 'You are not authorized to cancel this order');
  }

  const canCancel = canCancelOrder(order.status, order.createdAt);

  logger.info('Cancel order attempt', {
    orderId,
    currentStatus: order.status,
    canCancel: canCancel.allowed,
    reason: canCancel.message,
    requestedBy: req.userRole,
  });

  if (!canCancel.allowed) {
    throw new ApiError(400, canCancel.message);
  }

  order.status = 'cancelled';
  order.cancellationReason = reason;
  order.cancelledBy = req.userRole; //Assumes role is on req.user
  order.statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    updatedBy: req.userId,
  });

  await order.save();
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.item, {
      $inc: { stock: item.count },
    });
  }

  // ✅ Populate customer details to get the name for the notification
  await order.populate('customer', 'name');

  // ✅ Emit a socket event to the admin dashboard
  const io = req.app.get('io');
  if (io) {
    io.to('admin_dashboard').emit('orderCancelled', {
      orderId: order.orderId,
      _id: order._id,
      customerName: order.customer?.name || 'Unknown Customer',
      cancellationReason: order.cancellationReason || 'No reason provided',
    });
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        orderId: order.orderId,
        status: order.status,
        cancellationReason: order.cancellationReason,
      },
      'Order cancelled successfully'
    )
  );
});

export const trackOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findOne({ orderId })
    .populate('customer', 'name phone')
    .populate('deliveryPartner', 'name phone liveLocation vehicleDetails')
    .populate('branch', 'name location address')
    .select(
      'orderId status statusHistory deliveryPartner deliveryAddress estimatedDeliveryTime actualDeliveryTime createdAt'
    );

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (
    req.userRole === 'Customer' &&
    order.customer._id.toString() !== req.userId.toString()
  ) {
    throw new ApiError(403, 'You are not authorized to track this order');
  }

  res.json(
    new ApiResponse(
      200,
      {
        orderId: order.orderId,
        status: order.status,
        statusHistory: order.statusHistory,
        deliveryPartner: order.deliveryPartner,
        deliveryAddress: order.deliveryAddress,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        actualDeliveryTime: order.actualDeliveryTime,
        branch: order.branch,
      },
      'Order tracking information retrieved successfully'
    )
  );
});

export const getPendingOrdersCount = asyncHandler(async (req, res) => {
  const count = await Order.countDocuments({ status: 'pending' });
  res.json(
    new ApiResponse(
      200,
      { count },
      'Pending order count retrieved successfully'
    )
  );
});

export const getRecentPendingOrders = asyncHandler(async (req, res) => {
  const recentOrders = await Order.find({ status: 'pending' })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('customer', 'name');

  res.json(
    new ApiResponse(
      200,
      recentOrders,
      'Recent pending orders retrieved successfully'
    )
  );
});

export const assignDeliveryPartner = asyncHandler(async (req, res) => {
  const { orderId, deliveryPartnerId } = req.body;

  const order = await Order.findOne({ orderId });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.deliveryPartner) {
    throw new ApiError(400, 'Order already assigned to a delivery partner');
  }

  const deliveryPartner = await DeliveryPartner.findById(deliveryPartnerId);

  if (!deliveryPartner) {
    throw new ApiError(404, 'Delivery partner not found');
  }

  if (!deliveryPartner.isAvailable) {
    throw new ApiError(400, 'Delivery partner is not available');
  }

  // Update order
  order.deliveryPartner = deliveryPartnerId;
  order.status = 'confirmed';

  order.statusHistory.push({
    status: 'confirmed',
    timestamp: new Date(),
  });

  await order.save();

  // Emit Socket.IO event
  const io = req.app.get('io');
  if (io) {
    // Notify delivery partner
    io.to(`delivery_${deliveryPartnerId}`).emit('newOrderAssigned', {
      orderId: order.orderId,
      message: 'New order assigned to you',
      order: {
        orderId: order.orderId,
        customer: order.customer,
        totalPrice: order.totalPrice,
        deliveryAddress: order.deliveryAddress,
      },
    });

    // Notify admin dashboard
    io.to('admin_dashboard').emit('orderUpdated', {
      orderId: order.orderId,
      status: 'confirmed',
      deliveryPartner: deliveryPartner.name,
    });
  }

  logger.info('Delivery partner assigned to order', {
    orderId: order.orderId,
    deliveryPartnerId,
    assignedBy: 'Admin',
  });

  res.json(
    new ApiResponse(
      200,
      {
        orderId: order.orderId,
        status: order.status,
        deliveryPartner: {
          id: deliveryPartner._id,
          name: deliveryPartner.name,
          phone: deliveryPartner.phone,
        },
      },
      'Delivery partner assigned successfully'
    )
  );
});

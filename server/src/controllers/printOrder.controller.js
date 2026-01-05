import asyncHandler from 'express-async-handler';
import { Order, DeliveryPartner } from '../models/index.js';
import {
  processPrintFile,
  calculatePrintCost,
  deletePrintFiles,
} from '../services/printFile.service.js';
import { DELIVERY_CONFIG } from '../config/config.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import logger from '../utils/logger.js';


export const createPrintOrder = asyncHandler(async (req, res) => {
  const {
    description,
    colorType,
    printSides,
    bindingType,
    deliveryAddress,
    paymentMethod,
    giftWrap,
  } = req.body;

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'At least one file is required');
  }

  if (!colorType || !['bw', 'color'].includes(colorType)) {
    throw new ApiError(400, 'Valid color type (bw/color) is required');
  }

  if (!deliveryAddress || !deliveryAddress.address) {
    throw new ApiError(400, 'Delivery address is required');
  }

  const processedFiles = [];

  try {
    for (const file of req.files) {
      const processedFile = await processPrintFile(file);
      processedFiles.push(processedFile);
    }

    const totalPages = processedFiles.reduce(
      (sum, file) => sum + file.pageCount,
      0
    );

    const printCost = calculatePrintCost(
      totalPages,
      colorType,
      DELIVERY_CONFIG.printPricing
    );

    const deliveryFee =
      printCost >= DELIVERY_CONFIG.freeDeliveryThreshold
        ? 0
        : DELIVERY_CONFIG.fee;
    const giftWrapCharge = giftWrap?.enabled
      ? DELIVERY_CONFIG.giftWrapCharge
      : 0;
    const totalPrice = printCost + deliveryFee + giftWrapCharge;

    const order = await Order.create({
      orderType: 'print',
      customer: req.userId,
      printDetails: {
        files: processedFiles,
        description: description || '',
        colorType,
        pageSize: 'A4',
        printSides: printSides || 'single-sided',
        bindingType: bindingType || 'none',
        totalPages,
        printCost,
      },
      giftWrap: {
        enabled: giftWrap?.enabled || false,
        charge: giftWrapCharge,
        message: giftWrap?.message || '',
      },
      deliveryAddress: {
        label: deliveryAddress.label || 'Other',
        address: deliveryAddress.address.trim(),
        landmark: deliveryAddress.landmark?.trim() || '',
        city: deliveryAddress.city?.trim() || '',
        state: deliveryAddress.state?.trim() || '',
        pincode: deliveryAddress.pincode?.trim() || '',
      },
      payment: {
        method: paymentMethod || 'razorpay',
        status: 'pending',
      },
      itemsTotal: printCost,
      deliveryFee,
      totalPrice,
      status: 'pending',
    });

    await order.populate('customer', 'name phone');

    const io = req.app.get('io');
    if (io) {
      io.to('admin_dashboard').emit('newPrintOrder', {
        orderId: order.orderId,
        customerName: order.customer.name,
        fileName: order.printDetails.fileName,
        pages: order.printDetails.pages,
        totalPrice: order.totalPrice, 
      });
    }

    res.status(201).json(
      new ApiResponse(
        201,
        {
          orderId: order.orderId,
          orderType: order.orderType,
          printDetails: order.printDetails,
          totalPrice: order.totalPrice,
          status: order.status,
        },
        'Print order created successfully'
      )
    );
  } catch (error) {
    if (processedFiles.length > 0) {
      await deletePrintFiles(processedFiles);
    }

    logger.error('Error creating print order:', error);
    throw error;
  }
});


export const getPrintOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { orderType: 'print' };

  // Filter by user role
  if (req.userRole === 'Customer') {
    query.customer = req.userId;
  }

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate('customer', 'name phone')
    .populate('deliveryPartner', 'name phone')
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
      'Print orders retrieved successfully'
    )
  );
});


export const getPrintOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findOne({ orderId, orderType: 'print' })
    .populate('customer', 'name phone email')
    .populate('deliveryPartner', 'name phone vehicleDetails liveLocation');

  if (!order) {
    throw new ApiError(404, 'Print order not found');
  }

  if (
    req.userRole !== 'Admin' &&
    order.customer._id.toString() !== req.userId.toString() &&
    (!order.deliveryPartner ||
      order.deliveryPartner._id.toString() !== req.userId.toString())
  ) {
    throw new ApiError(403, 'You are not authorized to view this order');
  }

  res.json(new ApiResponse(200, order, 'Print order retrieved successfully'));
});


export const assignDeliveryPartner = asyncHandler(async (req, res) => {
  const { orderId, deliveryPartnerId } = req.body;

  if (!orderId || !deliveryPartnerId) {
    throw new ApiError(400, 'Order ID and Delivery Partner ID are required');
  }

  const order = await Order.findOne({ orderId });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.deliveryPartner) {
    throw new ApiError(400, 'Delivery partner already assigned to this order');
  }

  const deliveryPartner = await DeliveryPartner.findById(deliveryPartnerId);

  if (!deliveryPartner) {
    throw new ApiError(404, 'Delivery partner not found');
  }

  order.deliveryPartner = deliveryPartnerId;
  order.assignedBy = req.userId;
  order.assignedAt = new Date();
  order.status = 'confirmed';
  order.statusHistory.push({
    status: 'confirmed',
    timestamp: new Date(),
    updatedBy: req.userId,
  });

  await order.save();
  await order.populate('deliveryPartner', 'name phone email');

  const io = req.app.get('io');
  if (io) {
    io.to(`delivery_${deliveryPartnerId}`).emit('newOrderAssigned', {
      orderId: order.orderId,
      orderType: order.orderType,
      deliveryAddress: order.deliveryAddress,
      totalPrice: order.totalPrice,
    });
  }

  logger.info('Delivery partner assigned to print order', {
    orderId,
    deliveryPartnerId,
  });

  res.json(
    new ApiResponse(
      200,
      {
        orderId: order.orderId,
        deliveryPartner: order.deliveryPartner,
        status: order.status,
      },
      'Delivery partner assigned successfully'
    )
  );
});


export const updatePrintOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'picked', 'arriving', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid order status');
  }

  const order = await Order.findOne({ orderId, orderType: 'print' });

  if (!order) {
    throw new ApiError(404, 'Print order not found');
  }

  order.status = status;
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy: req.userId,
  });

  if (status === 'delivered') {
    order.actualDeliveryTime = new Date();
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

  logger.info('Print order status updated', {
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
      'Print order status updated successfully'
    )
  );
});

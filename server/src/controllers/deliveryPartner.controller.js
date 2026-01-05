import asyncHandler from 'express-async-handler';
import { DeliveryPartner, Order } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import logger from '../utils/logger.js';

/**
 * Get assigned orders for delivery partner
 * @route GET /api/delivery/orders
 * @access Private (DeliveryPartner)
 */
export const getAssignedOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const deliveryPartnerId = req.userId;

  const query = {
    deliveryPartner: deliveryPartnerId,
  };

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate('customer', 'name phone')
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
      'Assigned orders retrieved successfully'
    )
  );
});

/**
 * Update order status by delivery partner
 * @route PUT /api/delivery/orders/:orderId/status
 * @access Private (DeliveryPartner)
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const deliveryPartnerId = req.userId;

  // Validate status
  const validStatuses = ['picked', 'arriving', 'delivered'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(
      400,
      'Invalid status. Allowed: picked, arriving, delivered'
    );
  }

  const order = await Order.findOne({ orderId });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Check if order is assigned to this delivery partner
  if (
    !order.deliveryPartner ||
    order.deliveryPartner.toString() !== deliveryPartnerId.toString()
  ) {
    throw new ApiError(
      403,
      'You are not authorized to update this order status'
    );
  }

  // Update status
  order.status = status;
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    updatedBy: deliveryPartnerId,
  });

  // Handle delivery completion
  if (status === 'delivered') {
    order.actualDeliveryTime = new Date();
  }

  await order.save();

  // Emit Socket.IO event
  const io = req.app.get('io');
  if (io) {
    io.to(`order_${orderId}`).emit('orderStatusUpdated', {
      orderId,
      status,
      timestamp: new Date(),
    });

    io.to('admin_dashboard').emit('orderUpdated', {
      orderId,
      status,
      deliveryPartner: deliveryPartnerId,
    });
  }


  res.json(
    new ApiResponse(
      200,
      {
        orderId: order.orderId,
        status: order.status,
        updatedAt: new Date(),
      },
      'Order status updated successfully'
    )
  );
});

/**
 * Update delivery partner location (real-time)
 * @route PUT /api/delivery/location
 * @access Private (DeliveryPartner)
 */
export const updateLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;
  const deliveryPartnerId = req.userId;

  if (!latitude || !longitude) {
    throw new ApiError(400, 'Latitude and longitude are required');
  }

  // Validate coordinates
  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new ApiError(400, 'Invalid coordinates');
  }

  const deliveryPartner = await DeliveryPartner.findById(deliveryPartnerId);

  if (!deliveryPartner) {
    throw new ApiError(404, 'Delivery partner not found');
  }

  // Update live location
  deliveryPartner.liveLocation = {
    latitude,
    longitude,
    lastUpdated: new Date(),
  };

  await deliveryPartner.save();

  // Find active orders for this delivery partner
  const activeOrders = await Order.find({
    deliveryPartner: deliveryPartnerId,
    status: { $in: ['picked', 'arriving'] },
  }).select('orderId');

  // Emit location update to all active orders
  const io = req.app.get('io');
  if (io) {
    activeOrders.forEach((order) => {
      io.to(`order_${order.orderId}`).emit('deliveryPartnerLocation', {
        orderId: order.orderId,
        latitude,
        longitude,
        timestamp: new Date(),
      });
    });
  }

 

  res.json(
    new ApiResponse(
      200,
      {
        latitude,
        longitude,
        lastUpdated: deliveryPartner.liveLocation.lastUpdated,
      },
      'Location updated successfully'
    )
  );
});

/**
 * Toggle delivery partner availability
 * @route PUT /api/delivery/availability
 * @access Private (DeliveryPartner)
 */
export const updateAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;
  const deliveryPartnerId = req.userId;

  if (typeof isAvailable !== 'boolean') {
    throw new ApiError(400, 'isAvailable must be a boolean value');
  }

  const deliveryPartner = await DeliveryPartner.findById(deliveryPartnerId);

  if (!deliveryPartner) {
    throw new ApiError(404, 'Delivery partner not found');
  }

  deliveryPartner.isAvailable = isAvailable;
  await deliveryPartner.save();

  // Emit to admin dashboard
  const io = req.app.get('io');
  if (io) {
    io.to('admin_dashboard').emit('deliveryPartnerAvailabilityChanged', {
      deliveryPartnerId,
      isAvailable,
      timestamp: new Date(),
    });
  }



  res.json(
    new ApiResponse(
      200,
      {
        isAvailable: deliveryPartner.isAvailable,
      },
      `Availability set to ${isAvailable ? 'available' : 'unavailable'}`
    )
  );
});
import asyncHandler from 'express-async-handler';
import { Branch, DeliveryPartner } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import logger from '../utils/logger.js';

/**
 * Get all branches
 * @route GET /api/branches
 * @access Public
 */
export const getAllBranches = asyncHandler(async (req, res) => {
  const { active, page = 1, limit = 10 } = req.query;

  const query = {};

  // Filter by active status if provided
  if (active !== undefined) {
    query.isActive = active === 'true';
  }

  const skip = (page - 1) * limit;

  const branches = await Branch.find(query)
    .populate('deliveryPartners', 'name phone isAvailable')
    .sort({ name: 1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Branch.countDocuments(query);

  // Add available delivery partner count to each branch
  const branchesWithStats = await Promise.all(
    branches.map(async (branch) => {
      const availablePartners = await DeliveryPartner.countDocuments({
        branch: branch._id,
        isAvailable: true,
      });

      return {
        ...branch.toObject(),
        availableDeliveryPartners: availablePartners,
      };
    })
  );

  logger.info('Branches retrieved', {
    count: branchesWithStats.length,
    filter: query,
  });

  res.json(
    new ApiResponse(
      200,
      {
        branches: branchesWithStats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
      'Branches retrieved successfully'
    )
  );
});

/**
 * Get branch by ID
 * @route GET /api/branches/:id
 * @access Public
 */
export const getBranchById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const branch = await Branch.findById(id).populate(
    'deliveryPartners',
    'name phone email vehicleDetails isAvailable liveLocation'
  );

  if (!branch) {
    throw new ApiError(404, 'Branch not found');
  }

  // Count available delivery partners
  const availablePartners = await DeliveryPartner.countDocuments({
    branch: branch._id,
    isAvailable: true,
  });

  const branchWithStats = {
    ...branch.toObject(),
    availableDeliveryPartners: availablePartners,
    totalDeliveryPartners: branch.deliveryPartners.length,
  };

  logger.info('Branch retrieved by ID', {
    branchId: id,
    branchName: branch.name,
  });

  res.json(
    new ApiResponse(200, branchWithStats, 'Branch retrieved successfully')
  );
});
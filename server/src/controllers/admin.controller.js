import asyncHandler from 'express-async-handler';
import { uploadToCloudinary } from '../middlewares/upload.middleware.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import logger from '../utils/logger.js';

/**
 * Upload image to Cloudinary for AdminJS
 * @route POST /api/admin/upload-image
 * @access Private (AdminJS only)
 */
export const uploadImageForAdmin = asyncHandler(async (req, res) => {
 
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

 
  const result = await uploadToCloudinary(req.file, 'godrop/products');

  logger.info('Image uploaded via AdminJS', {
    filename: req.file.originalname,
    url: result.url,
    publicId: result.publicId,
  });

 
  res.json(
    new ApiResponse(
      200,
      {
        url: result.url,
        publicId: result.publicId,
      },
      'Image uploaded successfully'
    )
  );
});
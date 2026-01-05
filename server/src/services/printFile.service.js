import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../middlewares/upload.middleware.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

import { PDFParse } from 'pdf-parse';
import sharp from 'sharp'; // Re-add sharp import, it was removed in previous steps

/**
 * Process uploaded file (PDF or Image)
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>} Processed file details
 */
export const processPrintFile = async (file) => {
  try {
    let pageCount = 0;
    let fileType = 'image';

    if (file.mimetype === 'application/pdf') {
      const parser = new PDFParse({ data: file.buffer });
      const pdfInfo = await parser.getInfo({ parsePageInfo: false }); 
      pageCount = pdfInfo.total; 
      await parser.destroy(); 
      fileType = 'pdf';

      logger.info('PDF processed successfully', {
        filename: file.originalname,
        pages: pageCount,
      });
    } else if (file.mimetype.startsWith('image/')) {
      pageCount = 1;
      fileType = 'image';

      try {
        const optimizedBuffer = await sharp(file.buffer)
          .resize(1200, null, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer();

        file.buffer = optimizedBuffer;

        
      } catch (sharpError) {
        logger.warn('Image optimization failed, using original:', {
          filename: file.originalname,
          error: sharpError.message,
        });
      }
    } else {
      throw new ApiError(
        400,
        'Invalid file type. Only PDF and images are allowed'
      );
    }

    const uploadResult = await uploadToCloudinary(file, 'godrop/print-orders');

    logger.info('Print file uploaded to Cloudinary', {
      filename: file.originalname,
      fileType,
      pageCount,
      publicId: uploadResult.publicId,
    });

    return {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      filename: file.originalname,
      pageCount,
      fileType,
    };
  } catch (error) {
    logger.error('Error processing print file:', {
      filename: file?.originalname,
      error: error.message,
      stack: error.stack,
    });

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(500, `Failed to process print file: ${error.message}`);
  }
};

/**
 * Calculate total print cost
 * @param {number} totalPages - Total number of pages
 * @param {string} colorType - 'bw' or 'color'
 * @param {Object} printPricing - Pricing configuration
 * @returns {number} Total cost
 */
export const calculatePrintCost = (totalPages, colorType, printPricing) => {
  if (!printPricing || !printPricing.bwPerPage || !printPricing.colorPerPage) {
    logger.error('Invalid print pricing configuration', { printPricing });
    throw new ApiError(500, 'Print pricing not configured');
  }

  const pricePerPage =
    colorType === 'color' ? printPricing.colorPerPage : printPricing.bwPerPage;

  const totalCost = totalPages * pricePerPage;

  logger.info('Print cost calculated', {
    totalPages,
    colorType,
    pricePerPage,
    totalCost,
  });

  return totalCost;
};

/**
 * Delete print files from Cloudinary
 * @param {Array} files - Array of file objects with publicId
 * @returns {Promise<void>}
 */
export const deletePrintFiles = async (files) => {
  if (!files || files.length === 0) {
    return;
  }

  try {
    const deletePromises = files.map((file) => {
      if (file.publicId) {
        return deleteFromCloudinary(file.publicId);
      }
      return Promise.resolve();
    });

    await Promise.all(deletePromises);

  
  } catch (error) {
    logger.error('Error deleting print files:', {
      error: error.message,
      files: files.map((f) => f.publicId),
    });
    // Don't throw error, just log it
  }
};

/**
 * Validate file before processing
 * @param {Object} file - Multer file object
 * @returns {boolean}
 */
export const validatePrintFile = (file) => {
  const allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new ApiError(
      400,
      'Invalid file type. Only PDF, JPEG, PNG, and WebP are allowed'
    );
  }

  // Max file size: 10MB
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new ApiError(400, 'File size exceeds 10MB limit');
  }

  return true;
};

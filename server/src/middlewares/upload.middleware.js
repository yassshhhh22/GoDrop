import multer from 'multer';
import { UPLOAD_CONFIG } from '../config/config.js';
import ApiError from '../utils/ApiError.js';
import cloudinary from '../config/cloudinary.js';

// ✅ Memory storage (for uploading buffer to Cloudinary)
const storage = multer.memoryStorage();

// File filter (allow only images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = UPLOAD_CONFIG.allowedTypes;
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

// Multer configuration
const multerConfig = {
  storage,
  limits: {
    fileSize: UPLOAD_CONFIG.maxFileSize, // 5MB
    files: 5,
  },
  fileFilter,
};

// Export upload instances
export const upload = multer(multerConfig);

// Specific upload handlers
export const uploadSingle = (fieldName) => upload.single(fieldName);
export const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
export const uploadFields = (fields) => upload.fields(fields);

// Handle multer errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new ApiError(400, 'File size too large. Maximum 5MB allowed'));
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return next(new ApiError(400, 'Too many files. Maximum 5 files allowed'));
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(new ApiError(400, 'Unexpected file field'));
    }
    return next(new ApiError(400, err.message));
  }
  next(err);
};


export const uploadToCloudinary = async (file, folder = 'godrop') => {
  try {
    // Convert buffer to base64
    const base64 = file.buffer.toString('base64');
    const dataURI = `data:${file.mimetype};base64,${base64}`;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder,
      resource_type: 'auto',
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    });
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new ApiError(500, 'Failed to upload image');
  }
};

// Delete from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new ApiError(500, 'Failed to delete image');
  }
};
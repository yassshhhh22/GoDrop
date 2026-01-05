import { v2 as cloudinary } from 'cloudinary';
import { CLOUDINARY_CONFIG } from './config.js';

cloudinary.config({
  cloud_name: CLOUDINARY_CONFIG.cloudName,
  api_key: CLOUDINARY_CONFIG.apiKey,
  api_secret: CLOUDINARY_CONFIG.apiSecret,
});

export default cloudinary;

export const uploadImage = async (filePath, folder = 'godrop') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    throw new Error('Failed to upload image');
  }
};

export const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error('Failed to delete image');
  }
};

export const deleteMultipleImages = async (publicIds) => {
  if (!publicIds || publicIds.length === 0) return;

  try {
    const deletePromises = publicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId).catch((err) => {
        return null;
      })
    );
    await Promise.all(deletePromises);
  } catch (error) {
  }
};

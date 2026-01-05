import 'dotenv/config';

export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

export const MONGO_URI = process.env.MONGO_URI;

export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET,
  expire: process.env.JWT_EXPIRE || '1d',
  refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
};

export const FAST2SMS_CONFIG = {
  apiKey: process.env.FAST2SMS_API_KEY,
  senderId: process.env.FAST2SMS_SENDER_ID || 'TXTLTD',
  dltTemplateId: process.env.FAST2SMS_DLT_TEMPLATE_ID,
};

export const RAZORPAY_CONFIG = {
  keyId: process.env.RAZORPAY_KEY_ID,
  keySecret: process.env.RAZORPAY_KEY_SECRET,
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
};

export const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};

export const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@godrop.com',
  password: process.env.ADMIN_PASSWORD || 'Admin@123',
};

export const CORS_ORIGINS = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:3001',
];

export const RATE_LIMIT_CONFIG = {
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  otpMax: parseInt(process.env.OTP_RATE_LIMIT_MAX) || 3,
};

export const DELIVERY_CONFIG = {
  fee: parseInt(process.env.DELIVERY_FEE, 10) || 50,
  freeDeliveryThreshold:
    parseInt(process.env.FREE_DELIVERY_THRESHOLD, 10) || 500,
  freeDeliveryRadius: 5,
  maxDeliveryRadius: 15,
  perKmCharge: 5,
  giftWrapCharge: parseInt(process.env.GIFT_WRAP_CHARGE, 10) || 30, // Make sure this line is EXACTLY like this
  printPricing: {
    bwPerPage: 2,
    colorPerPage: 10,
  },
};

export const UPLOAD_CONFIG = {
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
  allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
  ],
};

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:');
  missingEnvVars.forEach((envVar) => console.error(`   - ${envVar}`));
  process.exit(1);
}

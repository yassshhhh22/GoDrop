import { createClient } from 'redis';
import { REDIS_CONFIG, RATE_LIMIT_CONFIG } from './config.js';
import bcrypt from 'bcrypt';
import { getLogTimestamp } from '../utils/time.js';

let redisClient;

export const connectRedis = async () => {
  try {
    redisClient = createClient({
      socket: {
        host: REDIS_CONFIG.host,
        port: REDIS_CONFIG.port,
      },
      password: REDIS_CONFIG.password,
    });

    redisClient.on('error', (err) => {
      console.error(`${getLogTimestamp()} Redis error:`, err);
    });

    redisClient.on('connect', () => {
      console.log(
        `${getLogTimestamp()} Redis connected: ${REDIS_CONFIG.host}:${REDIS_CONFIG.port}`
      );
    });

    redisClient.on('end', () => {
      console.log(`${getLogTimestamp()} Redis connection closed`);
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error(
      `${getLogTimestamp()} Redis connection error:`,
      error.message
    );
    console.log(`${getLogTimestamp()} Running without Redis cache`);
    return null;
  }
};

export const getRedisClient = () => redisClient;

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = async (phone, otp, expiryInSeconds = 300) => {
  if (!redisClient || !redisClient.isOpen) {
    console.error(
      `${getLogTimestamp()} Redis not connected. Cannot store OTP.`
    );
    return false;
  }

  try {
    const hashedOTP = await bcrypt.hash(otp, 10);
    await redisClient.setEx(
      `otp:${phone}`,
      expiryInSeconds,
      JSON.stringify({
        otp: hashedOTP,
        attempts: 0,
        createdAt: new Date().toISOString(),
      })
    );
    return true;
  } catch (error) {
    console.error(`${getLogTimestamp()} Error storing OTP:`, error);
    return false;
  }
};

export const getOTP = async (phone) => {
  if (!redisClient || !redisClient.isOpen) {
    console.error(
      `${getLogTimestamp()} Redis not connected. Cannot retrieve OTP.`
    );
    return null;
  }

  try {
    const data = await redisClient.get(`otp:${phone}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`${getLogTimestamp()} Error getting OTP:`, error);
    return null;
  }
};

export const verifyOTP = async (phone, enteredOTP) => {
  if (!redisClient || !redisClient.isOpen) {
    return {
      valid: false,
      message: 'OTP service unavailable. Please try again later.',
    };
  }

  try {
    const otpData = await getOTP(phone);

    if (!otpData) {
      return { valid: false, message: 'OTP expired or not found' };
    }

    if (otpData.attempts >= 3) {
      await deleteOTP(phone);
      return {
        valid: false,
        message: 'Maximum verification attempts exceeded',
      };
    }

    const isValid = await bcrypt.compare(enteredOTP, otpData.otp);

    if (!isValid) {
      otpData.attempts += 1;
      await redisClient.setEx(`otp:${phone}`, 300, JSON.stringify(otpData));

      return {
        valid: false,
        message: `Invalid OTP. ${3 - otpData.attempts} attempts remaining`,
        attemptsLeft: 3 - otpData.attempts,
      };
    }

    await deleteOTP(phone);
    return { valid: true, message: 'OTP verified successfully' };
  } catch (error) {
    console.error(`${getLogTimestamp()} Error verifying OTP:`, error);
    return { valid: false, message: 'Verification failed' };
  }
};

export const deleteOTP = async (phone) => {
  if (!redisClient || !redisClient.isOpen) return;
  try {
    await redisClient.del(`otp:${phone}`);
  } catch (error) {
    console.error(`${getLogTimestamp()} Error deleting OTP:`, error);
  }
};

export const checkOTPRateLimit = async (phone) => {
  const key = `otp_ratelimit:${phone}`;
  return await checkRateLimit(key, 3, 3600000);
};

export const checkRateLimit = async (
  key,
  maxAttempts = RATE_LIMIT_CONFIG.otpMax,
  windowMs = RATE_LIMIT_CONFIG.windowMs
) => {
  if (!redisClient || !redisClient.isOpen) return true;

  try {
    const attempts = await redisClient.get(`ratelimit:${key}`);

    if (!attempts) {
      await redisClient.setEx(
        `ratelimit:${key}`,
        Math.floor(windowMs / 1000),
        '1'
      );
      return true;
    }

    if (parseInt(attempts) >= maxAttempts) {
      return false;
    }

    await redisClient.incr(`ratelimit:${key}`);
    return true;
  } catch (error) {
    console.error(`${getLogTimestamp()} Error checking rate limit:`, error);
    return true;
  }
};

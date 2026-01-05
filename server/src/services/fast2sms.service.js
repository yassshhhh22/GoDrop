import axios from 'axios';
import { FAST2SMS_CONFIG, NODE_ENV } from '../config/config.js';
import { generateOTP, storeOTP, getRedisClient } from '../config/redis.js';
import logger from '../utils/logger.js';
import { getLogTimestamp } from '../utils/time.js';

let fast2smsConfigured = false;

try {
  if (FAST2SMS_CONFIG.apiKey && FAST2SMS_CONFIG.dltTemplateId) {
    fast2smsConfigured = true;
    console.log(`${getLogTimestamp()} Fast2SMS initialized`);
  } else {
    console.warn(
      `${getLogTimestamp()} Fast2SMS credentials not found. Using fallback OTP.`
    );
  }
} catch (error) {
  console.error(
    `${getLogTimestamp()} Fast2SMS initialization error:`,
    error.message
  );
}

export const sendOTP = async (phone) => {
  try {
    const redisClient = getRedisClient();
    if (!redisClient || !redisClient.isOpen) {
      logger.error('Redis is not connected. Cannot store OTP.', { phone });
      return {
        success: false,
        message: 'OTP service unavailable. Please try again later.',
      };
    }

    const otp = NODE_ENV === 'development' ? '123456' : generateOTP();
    const stored = await storeOTP(phone, otp, 300);

    if (!stored) {
      logger.error('Failed to store OTP in Redis', { phone });
      return {
        success: false,
        message: 'Failed to generate OTP. Please try again.',
      };
    }

    if (fast2smsConfigured && NODE_ENV === 'production') {
      try {
        const cleanPhone = phone.replace(/^\+91/, '');

        const response = await axios.post(
          'https://www.fast2sms.com/dev/bulkV2',
          {
            route: 'dlt_manual',
            sender_id: FAST2SMS_CONFIG.senderId,
            message: FAST2SMS_CONFIG.dltTemplateId,
            variables_values: `${otp}|5`,
            numbers: cleanPhone,
          },
          {
            headers: {
              authorization: FAST2SMS_CONFIG.apiKey,
            },
          }
        );

        if (response.data.return === true) {
          return {
            success: true,
            message: 'OTP sent successfully',
            ...(NODE_ENV === 'development' && { otp }),
          };
        } else {
          logger.error('Fast2SMS API error', {
            phone,
            response: response.data,
          });

          return {
            success: true,
            message: 'OTP generated (SMS service unavailable)',
            otp,
          };
        }
      } catch (error) {
        logger.error('Error sending OTP via Fast2SMS', {
          phone,
          error: error.response?.data || error.message,
        });

        return {
          success: true,
          message: 'OTP generated (SMS service unavailable)',
          otp,
        };
      }
    } else {
      return {
        success: true,
        message: 'OTP generated (Development mode - SMS disabled)',
        otp,
      };
    }
  } catch (error) {
    logger.error('Error in sendOTP', {
      phone,
      error: error.message,
    });

    return {
      success: false,
      message: 'Failed to send OTP. Please try again.',
    };
  }
};

export const resendOTP = async (phone) => {
  return await sendOTP(phone);
};

export const getFast2SMSStatus = () => {
  return {
    configured: fast2smsConfigured,
    apiKey: !!FAST2SMS_CONFIG.apiKey,
    dltTemplateId: !!FAST2SMS_CONFIG.dltTemplateId,
  };
};

export const getServiceStatus = () => {
  const redisClient = getRedisClient();

  return {
    fast2sms: {
      configured: fast2smsConfigured,
      apiKey: !!FAST2SMS_CONFIG.apiKey,
      dltTemplateId: !!FAST2SMS_CONFIG.dltTemplateId,
    },
    redis: {
      configured: !!redisClient,
      connected: redisClient ? redisClient.isOpen : false,
    },
  };
};

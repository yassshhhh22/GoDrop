import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { getRedisClient } from '../config/redis.js';
import { RATE_LIMIT_CONFIG } from '../config/config.js';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_CONFIG.windowMs,
  max: RATE_LIMIT_CONFIG.max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/admin'),
  store: getRedisClient() ? new RedisStore({
    client: getRedisClient(),
    prefix: 'rl:api:',
  }) : undefined,
});

// Strict rate limiter for authentication routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
  },
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.body.phone || req.body.email || req.ip,
  store: getRedisClient() ? new RedisStore({
    client: getRedisClient(),
    prefix: 'rl:auth:',
  }) : undefined,
});

// OTP rate limiter
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: RATE_LIMIT_CONFIG.otpMax,
  message: {
    success: false,
    message: 'Too many OTP requests. Please try again after 1 hour',
  },
  skipSuccessfulRequests: false,
  keyGenerator: (req) => req.body.phone || req.ip,
  store: getRedisClient() ? new RedisStore({
    client: getRedisClient(),
    prefix: 'rl:otp:',
  }) : undefined,
});

// Payment rate limiter
export const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: {
    success: false,
    message: 'Too many payment attempts. Please try again after 5 minutes',
  },
  keyGenerator: (req) => req.userId || req.ip,
  store: getRedisClient() ? new RedisStore({
    client: getRedisClient(),
    prefix: 'rl:payment:',
  }) : undefined,
});

// Order creation rate limiter
export const orderLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 3,
  message: {
    success: false,
    message: 'Too many order attempts. Please wait a moment',
  },
  keyGenerator: (req) => req.userId || req.ip,
  store: getRedisClient() ? new RedisStore({
    client: getRedisClient(),
    prefix: 'rl:order:',
  }) : undefined,
});
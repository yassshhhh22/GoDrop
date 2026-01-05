import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/config.js';

// Generate Access Token
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_CONFIG.secret, {
    expiresIn: JWT_CONFIG.expire,
  });
};

// Generate Refresh Token
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_CONFIG.refreshSecret, {
    expiresIn: JWT_CONFIG.refreshExpire,
  });
};

// Generate Both Tokens
export const generateTokens = (userId, role) => {
  const payload = { userId, role };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

// Verify Access Token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_CONFIG.secret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Access token expired');
    }
    throw new Error('Invalid access token');
  }
};

// Verify Refresh Token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_CONFIG.refreshSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token expired');
    }
    throw new Error('Invalid refresh token');
  }
};

// Decode Token Without Verification (for debugging)
export const decodeToken = (token) => {
  return jwt.decode(token);
};

// Get Token from Request Header
export const extractTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); 
  }
  return null;
};

// Get Token from Cookie
export const extractTokenFromCookie = (req) => {
  return req.cookies?.refreshToken || null;
};

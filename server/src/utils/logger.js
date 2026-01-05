import winston from 'winston';
import { NODE_ENV } from '../config/config.js';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const transports = [
  // Always log errors to error.log
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  // Always log all necessary levels to combined.log
  new winston.transports.File({
    filename: 'logs/combined.log',
  }),
];

// In development, log everything to the console with colors.
// In production, ONLY log errors to the console.
if (NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      level: 'debug',
      format: combine(colorize(), logFormat),
    })
  );
} else {
  transports.push(
    new winston.transports.Console({
      level: 'error', // This is the key change for production
      format: combine(colorize(), logFormat),
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    logFormat
  ),
  transports: transports,
});

export default logger;

import mongoose from 'mongoose';
import { MONGO_URI } from './config.js';
import { getLogTimestamp } from '../utils/time.js';

export const connectDB = async (MONGO_URI) => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(
      `${getLogTimestamp()} MongoDB Connected: ${conn.connection.host}`
    );

    mongoose.connection.on('error', (err) => {
      console.error(`${getLogTimestamp()} MongoDB connection error:`, err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log(`${getLogTimestamp()} MongoDB disconnected`);
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log(`${getLogTimestamp()} MongoDB connection closed`);
      process.exit(0);
    });
  } catch (error) {
    console.error(`${getLogTimestamp()} Database connection error:`, error);
    process.exit(1);
  }
};

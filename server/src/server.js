import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/database.js';
import { connectRedis } from './config/redis.js';
import { getLogTimestamp } from './utils/time.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {

    await connectDB(process.env.MONGO_URI);
    await connectRedis();

    const server = app.listen(PORT, () => {
      console.log(`\n${getLogTimestamp()} Server Status:`);
      console.log(`  - Port: ${PORT}`);
      console.log(`  - Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  - API Base: http://localhost:${PORT}/api`);
      console.log(`  - Admin Panel: http://localhost:${PORT}/admin`);
      console.log(`  - Health Check: http://localhost:${PORT}/health`);
      console.log('Server is ready :)');
    });

    process.on('unhandledRejection', (err) => {
      console.error(
        `\n${getLogTimestamp()} UNHANDLED REJECTION - Shutting down...`
      );
      console.error(`Error: ${err.name} - ${err.message}`);
      server.close(() => {
        process.exit(1);
      });
    });

    process.on('SIGTERM', () => {
      console.log(
        `\n${getLogTimestamp()} SIGTERM received - Shutting down gracefully`
      );
      server.close(() => {
        console.log(`${getLogTimestamp()} Process terminated`);
      });
    });

    return server;
  } catch (error) {
    console.error(`\n${getLogTimestamp()} Failed to start server:`);
    console.error(error);
    process.exit(1);
  }
};

startServer();

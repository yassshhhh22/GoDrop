import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import { createServer } from 'http';
import { Server } from 'socket.io';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getLogTimestamp } from './utils/time.js';
import { createAdminJS, createAdminRouter } from './utils/adminjs.config.js';

import testRoutes from './routes/test.routes.js';
import authRoutes from './routes/auth.routes.js';
import customerRoutes from './routes/customer.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import printOrderRoutes from './routes/printOrder.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import orderRoutes from './routes/order.routes.js';
import productRoutes from './routes/product.routes.js';
import categoryRoutes from './routes/category.routes.js';
import cartRoutes from './routes/cart.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import adminRoutes from './routes/admin.routes.js';
import deliveryPartnerRoutes from './routes/deliveryPartner.routes.js';
import branchRoutes from './routes/branch.routes.js';
import businessUserRoutes from './routes/businessUser.routes.js';
import configRoutes from './routes/config.routes.js';
import logger from './utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.ADMIN_URL || 'http://localhost:3001',
      'http://10.112.40.215:*',
    ],
    credentials: true,
  },
});

app.set('io', io);

const adminJs = createAdminJS();
const adminRouter = createAdminRouter(adminJs);

app.use(
  session({
    secret: process.env.JWT_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: 'admin_sessions',
    }),
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(adminJs.options.rootPath, adminRouter);

app.use('/api/webhook', webhookRoutes);

app.use(helmet());

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.ADMIN_URL || 'http://localhost:3001',
         'http://192.168.56.1:5173',
            'http://192.168.0.100:5173'
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());
app.use(mongoSanitize());
app.use(xss());

// --- MODIFIED HTTP Request Logging ---
// This setup ensures HTTP request logs (like GET, POST) only appear
// in the console during development and are completely disabled in production.
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
// --- End of Logging Modification ---

app.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    message: 'GoDrop API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

if (process.env.NODE_ENV === 'development') {
  app.use('/api/test', testRoutes);
}

app.use('/api/auth', authRoutes);
app.use('/api/business-users', businessUserRoutes); // ✅ Changed from /api/business
app.use('/api/customers', customerRoutes);

app.use('/api/products', productRoutes);

app.use('/api/categories', categoryRoutes);

app.use('/api/cart', cartRoutes);

app.use('/api/coupons', couponRoutes);

app.use('/api/payment', paymentRoutes);

app.use('/api/orders', orderRoutes);

app.use('/api/print-orders', printOrderRoutes);

app.use('/api', adminRoutes);
app.use('/api/delivery', deliveryPartnerRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/test', testRoutes);
app.use('/api/config', configRoutes);

app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

io.on('connection', (socket) => {
  console.log(`Socket.IO client connected: ${socket.id}`);

  socket.on('joinOrder', (orderId) => {
    socket.join(`order_${orderId}`);
  });

  socket.on('joinDeliveryPartner', (deliveryPartnerId) => {
    socket.join(`delivery_${deliveryPartnerId}`);
  });

  socket.on('joinAdminDashboard', () => {
    socket.join('admin_dashboard');
  });

  socket.on('updateLocation', ({ orderId, latitude, longitude }) => {
    io.to(`order_${orderId}`).emit('deliveryPartnerLocation', {
      orderId,
      latitude,
      longitude,
      timestamp: new Date(),
    });
  });

  socket.on('disconnect', () => {
    console.log(`Socket.IO client disconnected: ${socket.id}`);
  });
});

export default httpServer;

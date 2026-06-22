// app.js - Main Express Application Setup

import 'dotenv/config';
import './common/utils/cloudinary.js'; // Initialize Cloudinary

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Configuration
import env from './config/env.js';

// Middleware
import {
  authMiddleware,
  adminOnlyMiddleware,
} from './common/middleware/authMiddleware.js';

// Module Routes
import authRoutes from './modules/auth/routes.js';
import userRoutes from './modules/users/routes.js';
import publicUserRoutes from './modules/users/publicRoutes.js';
import postRoutes from './modules/posts/routes.js';
import messageRoutes from './modules/messages/routes.js';
import conversationRoutes from './modules/messages/conversationRoutes.js';
import promotionRoutes from './modules/promotions/routes.js';
import promoCodeRoutes from './modules/promoCodes/routes.js';
import adminRoutes from './modules/admin/routes.js';
import publicSettingsRoutes from './modules/admin/publicRoutes.js';
import analyticsRoutes from './modules/analytics/routes.js';
import reviewRoutes from './modules/reviews/routes.js';
import platformUpdatesRoutes from './modules/platformUpdates/routes.js';
import forgotPasswordRoutes from './modules/auth/forgotPasswordRoutes.js';
import notificationRoutes from './modules/notifications/routes.js';
import bannerRoutes from './modules/banners/routes.js';
import discountRoutes from './modules/discounts/routes.js';
import savedPostRoutes from './modules/savedPosts/routes.js';

// Utilities
import { startPromoExpiryReminderJob } from './common/utils/promoExpiryReminderJob.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/**
 * ==========================================
 * MIDDLEWARE SETUP
 * ==========================================
 */

// CORS Configuration
const ALLOWED_ORIGINS = new Set([
  env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://localhost:5173',
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, health checks)
      if (!origin) return callback(null, true);
      // Allow the fixed production/local origins
      if (ALLOWED_ORIGINS.has(origin)) return callback(null, true);
      // Allow any GitHub Codespaces forwarded URL (*.app.github.dev)
      if (/^https:\/\/[^.]+\.app\.github\.dev$/.test(origin)) return callback(null, true);
      callback(new Error(`CORS: origin not allowed — ${origin}`));
    },
    credentials: true,
  })
);

// Body Parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Cookie Parser
app.use(cookieParser());

/**
 * ==========================================
 * DATABASE CONNECTION
 * ==========================================
 */

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');

    // Start background jobs
    startPromoExpiryReminderJob();
    console.log('✅ Background jobs started');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * ==========================================
 * API ROUTES
 * ==========================================
 */

// Auth Routes (public)
app.use('/api/auth', authRoutes);
app.use('/api/auth', forgotPasswordRoutes);

// Public Routes (no auth required)
app.use('/api/public/users', publicUserRoutes);
app.use('/api/public/settings', publicSettingsRoutes);

// User Routes
app.use('/api/users', userRoutes);

// Post Routes
app.use('/api/posts', postRoutes);

// Message Routes
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);

// Promotion Routes
app.use('/api/promotions', promotionRoutes);

// Promo Code Routes
app.use('/api/promo-codes', promoCodeRoutes);

// Admin Routes
app.use('/api/admin', authMiddleware, adminOnlyMiddleware, adminRoutes);

// Analytics Routes
app.use('/api/analytics', analyticsRoutes);

// Review Routes
app.use('/api/reviews', reviewRoutes);

// Platform Updates Routes
app.use('/api/platform-updates', platformUpdatesRoutes);

// Notification Routes
app.use('/api/notifications', notificationRoutes);

// Banner Routes
app.use('/api/banners', bannerRoutes);

// Discount Routes
app.use('/api/discounts', discountRoutes);

// Saved Posts Routes
app.use('/api/saved-posts', savedPostRoutes);

/**
 * ==========================================
 * STATIC FILES & PUBLIC ROUTES
 * ==========================================
 */

// Serve static uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * ==========================================
 * ERROR HANDLING
 * ==========================================
 */

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    status: statusCode,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

/**
 * ==========================================
 * EXPORTS
 * ==========================================
 */

export { app, connectDB };

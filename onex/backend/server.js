/**
 * server.js - Express Server Entry Point
 * 
 * This is the main entry point for the Node.js/Express server.
 * All app configuration is in src/app.js
 */

import 'dotenv/config';
import { app, connectDB } from './src/app.js';
import env from './src/config/env.js';

/**
 * ==========================================
 * SERVER STARTUP
 * ==========================================
 */

const PORT = env.PORT || 5000;
const HOST = env.HOST || '0.0.0.0';

const startServer = async () => {
  try {
    // Connect to database and start background jobs
    await connectDB();

    // Start listening for requests
    const server = app.listen(PORT, HOST, () => {
      const formattedURL = `http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`;
      console.log(`
╔════════════════════════════════════════╗
║   🚀 Server Running Successfully       ║
╠════════════════════════════════════════╣
║ URL:        ${formattedURL.padEnd(35)}║
║ Port:       ${String(PORT).padEnd(35)}║
║ Host:       ${HOST.padEnd(35)}║
║ Environment:${(env.NODE_ENV || 'development').padEnd(32)}║
╚════════════════════════════════════════╝
      `);
    });

    server.on('error', (err) => {
      console.error('❌ Server Error:', err.message);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * ==========================================
 * ERROR HANDLING
 * ==========================================
 */

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
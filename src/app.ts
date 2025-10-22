/**
 * Main application file that sets up the Express server and configures all routes and middleware.
 * This file serves as the entry point for the application's routing and middleware configuration.
 */

import express from 'express';
import connectDb from './config/db';
import authRouter from './routes/auth';
import pathRouter from './routes/path';
import canvasRouter from './routes/canvas';
import { authenticate, authenticateAdmin } from './middleware/authMiddleware';
import userRouter from './routes/user';
import { errorHandler } from './middleware/errorHandlingMiddleware';
import cors from 'cors';
import marketplaceRouter from './routes/marketplace';
import walletRouter from './routes/wallet';
import adminRouter from './routes/admin';
import chatRouter from './routes/chat';

// Initialize Express application
const app = express();

// Connect to the database
connectDb();

/**
 * Root endpoint handler
 * @route GET /
 * @returns {string} A simple greeting message
 */
app.get('/', (req, res) => {
  res.send('Hello World !!');
});

// Configure middleware
app.use(express.json({ limit: '500mb' })); // Parse JSON bodies with a size limit of 500MB
app.use(cors()); // Enable CORS for all routes
app.use(express.urlencoded({ limit: '500mb', extended: true })); // Parse URL-encoded bodies with a size limit of 500MB

// Configure routes with appropriate middleware
app.use('/api/v1/auth', authRouter); // Authentication routes (no authentication required)
app.use('/api/v1/path', authenticate, pathRouter); // Path routes (requires authentication)
app.use('/api/v1/user', authenticate, userRouter); // User routes (requires authentication)
app.use('/api/v1/canvas', authenticate, canvasRouter); // Canvas routes (requires authentication)
app.use('/api/v1/marketplace', authenticate, marketplaceRouter); // Marketplace routes (requires authentication)
app.use('/api/v1/wallet', authenticate, walletRouter); // Wallet routes (requires authentication)
app.use('/api/v1/admin', authenticateAdmin, adminRouter); // Admin routes (requires admin authentication)
app.use('/api/v1/chat', chatRouter); // Chat routes (authentication handled in chat routes)

// Global error handler middleware
app.use(errorHandler);

export default app;

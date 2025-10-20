/**
 * Marketplace Routes Module
 * Defines all endpoints related to marketplace operations.
 * Handles file listings, cart management, purchases, and user uploads.
 */

import express from 'express';
import MarketplaceController from '../controllers/v1/marketplace.controller';

// Initialize router and controller
const marketplaceRouter = express.Router();
const marketplaceController = new MarketplaceController();

/**
 * Marketplace Listing Endpoints
 */
marketplaceRouter.get('/listing', marketplaceController.getMarketplaceFiles.bind(marketplaceController)); // Get all marketplace files
marketplaceRouter.post('/listing', marketplaceController.uploadFileToMarketplace.bind(marketplaceController)); // Upload a file to marketplace
marketplaceRouter.get('/listing/:id', marketplaceController.getFileDetails.bind(marketplaceController)); // Get details of a specific file
marketplaceRouter.patch('/listing', marketplaceController.editMarketplaceFile.bind(marketplaceController)); // Edit a marketplace file

/**
 * Cart Management Endpoints
 */
marketplaceRouter.post('/cart', marketplaceController.addToCart.bind(marketplaceController)); // Add item to cart
marketplaceRouter.get('/cart', marketplaceController.getCart.bind(marketplaceController)); // Get cart contents
marketplaceRouter.delete('/cart', marketplaceController.removeFromCart.bind(marketplaceController)); // Remove item from cart

/**
 * Search and User Content Endpoints
 */
marketplaceRouter.get('/search', marketplaceController.searchMarketplaceFiles.bind(marketplaceController)); // Search marketplace files
marketplaceRouter.get('/my-uploads', marketplaceController.getUserUploads.bind(marketplaceController)); // Get user's uploaded files
marketplaceRouter.get('/draft', marketplaceController.getDraftFiles.bind(marketplaceController)); // Get user's draft files

/**
 * Purchase and Sales Endpoints
 */
marketplaceRouter.post('/buy-note', marketplaceController.buyNote.bind(marketplaceController)); // Purchase a note
marketplaceRouter.get('/sales-data', marketplaceController.getUserSalesData.bind(marketplaceController)); // Get user's sales data

export default marketplaceRouter;
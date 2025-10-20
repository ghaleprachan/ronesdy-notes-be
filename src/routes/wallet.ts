/**
 * Wallet Routes Module
 * Defines all endpoints related to wallet operations.
 * Handles balance management, payment methods, and withdrawals.
 */

import { Router } from 'express';
import WalletController from '../controllers/v1/wallet.controller';

// Initialize router and controller
const walletRouter: Router = Router();
const walletController = new WalletController();

/**
 * Wallet Management Endpoints
 */
walletRouter.get('/balance', walletController.getWalletBalance.bind(walletController)); // Get current wallet balance
walletRouter.post('/payment-method', walletController.addPaymentMethod.bind(walletController)); // Add a new payment method
walletRouter.post('/withdraw-balance', walletController.withdrawBalance.bind(walletController)); // Withdraw balance from wallet

export default walletRouter;
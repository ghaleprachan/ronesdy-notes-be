/**
 * Authentication routes module
 * This module defines all authentication-related endpoints including login, signup, password reset, and OTP verification.
 */

import express from 'express';
import UserController from '../controllers/v1/user.controller';

// Initialize router and controller
const authRouter = express.Router();
const userController = new UserController();

/**
 * User authentication endpoints
 */
authRouter.post('/login', userController.login.bind(userController)); // User login endpoint
authRouter.post('/admin-login', userController.adminLogin.bind(userController)); // Admin login endpoint
authRouter.post('/signup', userController.signup.bind(userController)); // User registration endpoint
authRouter.patch('/forgot-password', userController.forgotPassword.bind(userController)); // Password recovery request endpoint
authRouter.post('/reset-password', userController.resetPassword.bind(userController)); // Password reset endpoint
authRouter.post('/verify-otp', userController.verifyOTP.bind(userController)); // OTP verification endpoint

export default authRouter;

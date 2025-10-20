/**
 * Admin Routes Module
 * Defines all endpoints related to administrative operations.
 * Handles dashboard access, user management, and administrative tasks.
 */

import express from 'express';
import AdminController from '../controllers/v1/admin.controller';

// Initialize router and controller
const adminRouter = express.Router();
const adminController = new AdminController();

/**
 * Dashboard and Request Management Endpoints
 */
adminRouter.get('/dashboard', adminController.getDashboard.bind(adminController)); // Get admin dashboard data
adminRouter.get('/requests', adminController.getAllRequests.bind(adminController)); // Get all pending requests
adminRouter.patch('/requests/:id', adminController.updateRequest.bind(adminController)); // Update a specific request

/**
 * File Management Endpoints
 */
adminRouter.get('/file/:id', adminController.getFileByFileID.bind(adminController)); // Get file details by ID

/**
 * User Management Endpoints
 */
adminRouter.get('/users', adminController.getAllUsers.bind(adminController)); // Get all users
adminRouter.patch('/user/:id', adminController.updateUser.bind(adminController)); // Update user details

/**
 * Admin Management Endpoints
 */
adminRouter.get('/admins', adminController.getAllAdmins.bind(adminController)); // Get all admin users
adminRouter.delete('/admin/:id', adminController.deleteAdmin.bind(adminController)); // Delete an admin user
adminRouter.post('/admin', adminController.addAdmin.bind(adminController)); // Add a new admin user

export default adminRouter;
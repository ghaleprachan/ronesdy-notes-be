/**
 * Path Routes Module
 * Defines all endpoints related to file and folder operations.
 * Handles file uploads, folder management, and recycle bin operations.
 */

import express from 'express';
import PathController from '../controllers/v1/path.controller';
import multer from 'multer';

// Initialize router and controller
const pathRouter = express.Router();
const pathController = new PathController();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * File and Folder Management Endpoints
 */
pathRouter.post('/create-file', pathController.createFile.bind(pathController)); // Create a new file
pathRouter.get('/files-and-folders', pathController.getAllPathsByUserID.bind(pathController)); // Get all files and folders for a user
pathRouter.get('/file/:id', pathController.getFileByFileID.bind(pathController)); // Get file details by ID
pathRouter.delete('/file/:id', pathController.deleteFileByFileID.bind(pathController)); // Delete a file by ID
pathRouter.delete('/folder/:id', pathController.deleteFolderByFolderID.bind(pathController)); // Delete a folder by ID

/**
 * Folder Operations
 */
pathRouter.post('/create-folder', pathController.createFolder.bind(pathController)); // Create a new folder
pathRouter.patch('/rename-folder', pathController.renameFolder.bind(pathController)); // Rename an existing folder

/**
 * File Operations
 */
pathRouter.patch('/file', pathController.renameFile.bind(pathController)); // Rename a file

/**
 * Recycle Bin Operations
 */
pathRouter.get('/bin', pathController.recycleBin.bind(pathController)); // Get items in recycle bin
pathRouter.delete('/bin', pathController.emptyBin.bind(pathController)); // Empty the recycle bin
pathRouter.patch('/recover', pathController.recover.bind(pathController)); // Recover a single item
pathRouter.patch('/recover-all', pathController.recoverAll.bind(pathController)); // Recover all items
pathRouter.patch('/bin', pathController.moveToRecycleBin.bind(pathController)); // Move item to recycle bin

/**
 * File Upload Endpoint
 * Uses multer middleware for handling file uploads
 */
pathRouter.post('/upload-file', upload.single('file'), pathController.uploadFileToS3.bind(pathController));

export default pathRouter;

/**
 * Canvas Routes Module
 * Defines all endpoints related to canvas operations.
 * Handles canvas creation, synchronization, and deletion.
 */

import express from 'express';
import CanvasController from '../controllers/v1/canvas.controller';

// Initialize router and controller
const canvasRouter = express.Router();
const canvasController = new CanvasController();

/**
 * Canvas Management Endpoints
 */
canvasRouter.post('/', canvasController.createCanvas.bind(canvasController)); // Create a new canvas
canvasRouter.put('/', canvasController.syncCanvas.bind(canvasController)); // Synchronize canvas data
canvasRouter.delete('/:id', canvasController.deleteCanvas.bind(canvasController)); // Delete a canvas by ID

export default canvasRouter;
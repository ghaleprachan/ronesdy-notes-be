import { Router } from 'express';
import { ChatController } from '../controllers/v1/chat.controller';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all chat routes
router.use(authenticate);

// POST /api/chat - Send a message and get AI response
router.post('/', ChatController.sendMessage);

// GET /api/chat/:canvasId - Get chat history for a specific canvas
router.get('/:canvasId', ChatController.getChatHistory);

// DELETE /api/chat/:canvasId - Delete chat history for a specific canvas
router.delete('/:canvasId', ChatController.deleteChatHistory);

export default router;

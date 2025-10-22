import { Request, Response } from 'express';
import OpenAI from 'openai';
import config from '../../config';
import { ChatModel, IChat } from '../../models/v1/chat.model';
import {
  SendMessageRequestDto,
  SendMessageResponseDto,
  GetChatHistoryResponseDto,
} from '../../dto/v1/chat';

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

export class ChatController {
  // Send a message and get AI response
  static async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { message, canvasId }: SendMessageRequestDto = req.body;
      const userId = req.body.userID;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      // Find or create chat for this canvas and user
      let chat = await ChatModel.findOne({ canvasId, userId });

      if (!chat) {
        chat = new ChatModel({
          canvasId,
          userId,
          messages: [],
        });
      }

      // Add user message to chat
      const userMessage = {
        role: 'user' as const,
        content: message,
        timestamp: new Date(),
      };

      chat.messages.push(userMessage);

      // Prepare messages for OpenAI (include chat history)
      const openaiMessages = chat.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: openaiMessages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const aiResponse =
        completion.choices[0]?.message?.content ||
        'Sorry, I could not generate a response.';

      // Add AI response to chat
      const assistantMessage = {
        role: 'assistant' as const,
        content: aiResponse,
        timestamp: new Date(),
      };

      chat.messages.push(assistantMessage);
      await chat.save();

      const response: SendMessageResponseDto = {
        success: true,
        message: 'Message sent successfully',
        data: {
          chatId: chat._id.toString(),
          userMessage,
          aiResponse: assistantMessage,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in sendMessage:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Get chat history for a specific canvas
  static async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const { canvasId } = req.params;
      const userId = req.body.userID;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      // Find chat for this canvas and user
      const chat = await ChatModel.findOne({ canvasId, userId });

      if (!chat) {
        const response: GetChatHistoryResponseDto = {
          success: true,
          message: 'No chat history found',
          data: {
            chatId: '',
            canvasId,
            messages: [],
          },
        };
        res.status(200).json(response);
        return;
      }

      const response: GetChatHistoryResponseDto = {
        success: true,
        message: 'Chat history retrieved successfully',
        data: {
          chatId: chat._id.toString(),
          canvasId: chat.canvasId,
          messages: chat.messages,
        },
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error in getChatHistory:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Delete chat history for a specific canvas
  static async deleteChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const { canvasId } = req.params;
      const userId = req.body.userID;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      // Delete chat for this canvas and user
      await ChatModel.findOneAndDelete({ canvasId, userId });

      res.status(200).json({
        success: true,
        message: 'Chat history deleted successfully',
      });
    } catch (error) {
      console.error('Error in deleteChatHistory:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  canvasId: string;
  userId: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatSchema = new Schema<IChat>(
  {
    canvasId: {
      type: String,
      required: true,
      ref: 'Canvas',
    },
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    messages: [ChatMessageSchema],
  },
  {
    timestamps: true,
  },
);

// Index for efficient querying
ChatSchema.index({ canvasId: 1, userId: 1 });
ChatSchema.index({ createdAt: -1 });

export const ChatModel = mongoose.model<IChat>('Chat', ChatSchema);

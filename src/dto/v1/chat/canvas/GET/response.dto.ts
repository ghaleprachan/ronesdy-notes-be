export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class GetChatHistoryResponseDto {
  success!: boolean;
  message!: string;
  data!: {
    chatId: string;
    canvasId: string;
    messages: ChatMessage[];
  };
}

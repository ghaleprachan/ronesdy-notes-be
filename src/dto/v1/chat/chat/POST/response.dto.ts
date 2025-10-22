export class SendMessageResponseDto {
  success!: boolean;
  message!: string;
  data!: {
    chatId: string;
    userMessage: {
      role: 'user';
      content: string;
      timestamp: Date;
    };
    aiResponse: {
      role: 'assistant';
      content: string;
      timestamp: Date;
    };
  };
}

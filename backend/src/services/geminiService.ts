import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment variables');
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generateText(prompt: string): Promise<string> {
    try {
      if (!this.model) {
        throw new Error('Gemini API not initialized');
      }
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw new Error(`Gemini API error: ${error.message || 'Unknown error'}`);
    }
  }

  async *generateTextStream(prompt: string): AsyncGenerator<string, void, unknown> {
    try {
      if (!this.model) {
        throw new Error('Gemini API not initialized');
      }
      const result = await this.model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText) {
          yield chunkText;
        }
      }
    } catch (error: any) {
      console.error('Gemini API Stream Error:', error);
      throw new Error(`Gemini API stream error: ${error.message || 'Unknown error'}`);
    }
  }

  async chat(messages: Array<{ role: 'user' | 'model'; content: string }>): Promise<string> {
    try {
      if (!this.model) {
        throw new Error('Gemini API not initialized');
      }
      const chat = this.model.startChat({
        history: messages.slice(0, -1).map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })),
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Gemini Chat Error:', error);
      throw new Error(`Gemini chat error: ${error.message || 'Unknown error'}`);
    }
  }
}

export const geminiService = new GeminiService();
export default geminiService;

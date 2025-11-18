import { Request, Response } from 'express';
import geminiService from '../services/geminiService';

export const generateText = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const result = await geminiService.generateText(prompt);
    res.json({ result });
  } catch (error: any) {
    console.error('Gemini generateText error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const generateTextStream = async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    for await (const chunk of geminiService.generateTextStream(prompt)) {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    res.end();
  } catch (error: any) {
    console.error('Gemini generateTextStream error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: 'Messages array is required' });
      return;
    }

    const result = await geminiService.chat(messages);
    res.json({ result });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};


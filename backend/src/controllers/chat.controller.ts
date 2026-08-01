import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewears/auth.middleware.js';
import { AIService } from '../services/ai.service.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middlewears/error.middleware.js';

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { summaryId, message } = req.body;
    const userId = req.user!.userId;

    // 1. Verify summary ownership and get content
    const summary = await prisma.summary.findFirst({
      where: { id: summaryId, userId }
    });

    if (!summary) throw new AppError(404, 'Document context not found.');

    // 2. Save User Message
    await prisma.chatHistory.create({
      data: {
        userId,
        summaryId,
        role: 'USER',
        message
      }
    });

    // 3. Get AI Response
    const aiResponse = await AIService.askQuestion(summary.originalContent, message);

    // 4. Save AI Response
    const savedChat = await prisma.chatHistory.create({
      data: {
        userId,
        summaryId,
        role: 'ASSISTANT',
        message: aiResponse
      }
    });

    res.status(200).json({
      status: 'success',
      data: { chat: savedChat }
    });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const summaryId = req.params.summaryId as string;
    const chats = await prisma.chatHistory.findMany({
      where: { 
        summaryId, 
        userId: req.user!.userId 
      },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json({ status: 'success', data: { chats } });
  } catch (error) {
    next(error);
  }
};
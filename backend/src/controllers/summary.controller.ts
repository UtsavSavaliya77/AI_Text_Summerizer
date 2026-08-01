import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewears/auth.middleware.js';
import { AIService } from '../services/ai.service.js';
import { FileService } from '../services/file.service.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middlewears/error.middleware.js';

export const summarize = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, content: rawContent, fileType } = req.body;
    let textToSummarize = rawContent;

    // 1. If content is a base64 string (from file upload), extract text
    if (fileType !== 'text') {
      const buffer = Buffer.from(rawContent, 'base64');
      textToSummarize = await FileService.extractText(buffer, fileType);
    }

    if (!textToSummarize || textToSummarize.length < 50) {
      throw new AppError(400, 'Content is too short to summarize.');
    }

    // 2. Call OpenAI Service
    const aiData = await AIService.generateSummary(textToSummarize);

    // 3. Store in Database
    const summary = await prisma.summary.create({
      data: {
        userId: req.user!.userId,
        title: title || aiData.mainTopic,
        originalContent: textToSummarize,
        summaryOneLine: aiData.summaryOneLine,
        summaryShort: aiData.summaryShort,
        summaryDetailed: aiData.summaryDetailed,
        summaryExecutive: aiData.summaryExecutive,
        summaryBullet: aiData.summaryBullet,
        keywords: aiData.keywords,
        mainTopic: aiData.mainTopic,
        readingTime: aiData.readingTime,
        wordCount: aiData.wordCount,
        charCount: aiData.charCount,
        fileType: fileType || 'text',
      }
    });

    res.status(201).json({
      status: 'success',
      data: { summary }
    });
  } catch (error) {
    next(error);
  }
};

export const getSummaries = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const summaries = await prisma.summary.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        mainTopic: true,
        createdAt: true,
        wordCount: true,
        fileType: true,
      }
    });

    res.status(200).json({ status: 'success', data: { summaries } });
  } catch (error) {
    next(error);
  }
};

export const getSummaryById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const summary = await prisma.summary.findFirst({
      where: { id, userId: req.user!.userId }
    });

    if (!summary) {
      throw new AppError(404, 'Summary not found or unauthorized access');
    }

    res.status(200).json({ status: 'success', data: { summary } });
  } catch (error) {
    next(error);
  }
};

export const deleteSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const summary = await prisma.summary.findFirst({
      where: { id, userId: req.user!.userId }
    });

    if (!summary) {
      throw new AppError(404, 'Summary not found');
    }

    await prisma.summary.delete({
      where: { id }
    });

    res.status(200).json({ status: 'success', message: 'Summary deleted successfully' });
  } catch (error) {
    next(error);
  }
};
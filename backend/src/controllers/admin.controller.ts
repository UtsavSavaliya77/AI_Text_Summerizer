import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';

export const getSystemStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalSummaries, totalChats, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.summary.count(),
      prisma.chatHistory.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, fullName: true, email: true, createdAt: true }
      })
    ]);

    // Calculate system-wide totals
    const summaries = await prisma.summary.findMany({ select: { wordCount: true } });
    const totalWordsProcessed = summaries.reduce((acc: any, curr: { wordCount: any; }) => acc + curr.wordCount, 0);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalSummaries,
          totalChats,
          totalWordsProcessed
        },
        recentUsers
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { summaries: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ status: 'success', data: { users } });
  } catch (error) {
    next(error);
  }
};
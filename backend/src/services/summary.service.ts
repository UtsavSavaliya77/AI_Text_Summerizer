import { prisma } from '../lib/prisma.js';
import { AppError } from '../middlewears/error.middleware.js';

export class summaryService {
  static getById(id: string) {
      throw new Error('Method not implemented.');
  }
  static getAll() {
      throw new Error('Method not implemented.');
  }
  /**
   * Fetch all summaries for a specific user from the database
   */
  static async getAllUserSummaries(userId: string) {
    return await prisma.summary.findMany({
      where: { userId },
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
  }

  /**
   * Fetch a single summary by ID and verify owner
   */
  static async getSummaryById(id: string, userId: string) {
    const summary = await prisma.summary.findFirst({
      where: { id, userId }
    });

    if (!summary) {
      throw new AppError(404, 'Summary not found or unauthorized access');
    }

    return summary;
  }

  /**
   * Delete a summary from the database
   */
  static async deleteSummary(id: string, userId: string) {
    // We check userId to ensure users can only delete their own data
    const summary = await prisma.summary.findFirst({
      where: { id, userId }
    });

    if (!summary) {
      throw new AppError(404, 'Summary not found');
    }

    return await prisma.summary.delete({
      where: { id }
    });
  }
}
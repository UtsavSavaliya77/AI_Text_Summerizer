import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from './error.middleware.js';

/**
 * Middleware to restrict access to Admin users only
 */
export const authorizeAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: { role: true }
    });

    if (!user || user.role !== 'ADMIN') {
      throw new AppError(403, 'Forbidden: Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};
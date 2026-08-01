import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware.js';
import { verifyAccessToken } from '../utils/jwt.util.js';

export interface AuthRequest extends Request {
  user?: { userId: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError(401, 'Unauthorized: No token provided');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    next(new AppError(401, 'Unauthorized: Invalid or expired token'));
  }
};
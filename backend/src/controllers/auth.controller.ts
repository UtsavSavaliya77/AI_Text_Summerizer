import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middlewears/error.middleware.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util.js';
import { AuthRequest } from '../middlewears/auth.middleware.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email: validatedData.email } });
    if (existingUser) throw new AppError(400, 'User already exists');

    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash: hashedPassword,
        fullName: validatedData.fullName,
      },
      select: { id: true, email: true, fullName: true, createdAt: true },
    });

    res.status(201).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError(401, 'Invalid email or password');
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, fullName: user.fullName },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (!token) throw new AppError(400, 'Refresh token required');

    const decoded = verifyRefreshToken(token);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }

    const newAccessToken = generateAccessToken(decoded.userId);
    res.status(200).json({ status: 'success', data: { accessToken: newAccessToken } });
  } catch (error) {
    next(new AppError(401, 'Session expired, please login again'));
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.body;
    if (token) {
      await prisma.refreshToken.updateMany({
        where: { token },
        data: { isRevoked: true },
      });
    }
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: { id: true, email: true, fullName: true, avatarUrl: true, createdAt: true },
    });
    if (!user) throw new AppError(404, 'User not found');
    res.status(200).json({ status: 'success', data: { user } });
  } catch (error) {
    next(error);
  }
};
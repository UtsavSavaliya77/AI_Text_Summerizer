import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../../src/middlewears/error.middleware.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.util.js';

/**
 * AuthService
 * Handles the business logic for User Authentication, 
 * Password Security, and Session Management.
 */
export class AuthService {
  static login(arg0: { email: string; password: string; }) {
      throw new Error('Method not implemented.');
  }
  /**
   * Hashes a plain text password using Bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compares a plain text password with a hashed password
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Creates a new user in the database
   */
  static async createUser(data: { email: string; passwordHash: string; fullName: string }) {
    return await prisma.user.create({
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true
      }
    });
  }

  /**
   * Finds a user by their unique email
   */
  static async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  /**
   * Generates tokens and saves the refresh token to the database
   */
  static async createSession(userId: string) {
    const accessToken = generateAccessToken(userId);
    const refreshToken = generateRefreshToken(userId);

    // Save refresh token to DB for revocation support
    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    return { accessToken, refreshToken };
  }

  /**
   * Invalidates a refresh token (Logout)
   */
  static async revokeToken(token: string) {
    return await prisma.refreshToken.update({
      where: { token },
      data: { isRevoked: true }
    });
  }
}
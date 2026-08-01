import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import { prisma } from '../../src/lib/prisma.js';

// Mocking Prisma to avoid needing a live DB during unit/integration tests
vi.mock('../../src/lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
    }
  }
}));

describe('Auth API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/auth/register - should create a new user', async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      fullName: 'Test User',
      createdAt: new Date(),
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.user.email).toBe('test@example.com');
  });

  it('POST /api/auth/login - should return 401 for invalid credentials', async () => {
    (prisma.user.findUnique as any).mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });
});
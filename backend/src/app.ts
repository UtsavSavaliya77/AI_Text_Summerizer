import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { errorHandler } from './middlewears/error.middleware.js';
import { sanitizeRequest, preventPollution } from './middlewears/security.middleware.js';

// Route Imports
import authRoutes from './routes/auth.routes.js';
import summaryRoutes from './routes/summary.routes.js';
import chatRoutes from './routes/chat.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app: Application = express();

// 1. SET SECURITY HEADERS
// Configures Content-Security-Policy, XSS Filter, HSTS, etc.
app.use(helmet());

// 2. CORS CONFIGURATION
const allowedOrigins = [
  "http://localhost:3000",
  "https://ai-text-summerizer-two.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("Blocked Origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 3. BODY PARSING & LIMITS
// Prevent payload-based DoS attacks by limiting size
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. DATA SANITIZATION
app.use(sanitizeRequest); // Against XSS
app.use(preventPollution); // Against Parameter Pollution

// 5. RATE LIMITING
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests, please try again in 15 minutes.' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit login/register to 10 attempts per hour per IP
  message: { message: 'Too many auth attempts. Try again in an hour.' }
});

app.use('/api', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// 6. ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/summaries', summaryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health Check
app.get('/health', (req, res) => res.status(200).send('OK'));

// 7. GLOBAL ERROR HANDLER
app.use(errorHandler);

export default app;
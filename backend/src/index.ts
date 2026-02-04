import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { sequelize } from './database/connection';
import routes from './routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Trust proxy - required for rate limiting behind Railway/reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // 24 hours
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Database schema is managed by init.sql in docker-compose
    // Sequelize sync disabled to avoid conflicts with existing schema
    logger.info('Using existing database schema from init.sql');

    // Start server - bind to 0.0.0.0 for Fly.io
    app.listen(Number(PORT), '0.0.0.0', () => {
      logger.info(`🚀 Backend server running on 0.0.0.0:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Global error handlers for unhandled rejections and exceptions
process.on('unhandledRejection', (reason: Error, promise: Promise<any>) => {
  logger.error('🔴 Unhandled Rejection:', {
    reason: reason.message,
    stack: reason.stack,
    promise
  });
  
  // In production, you might want to exit and let process manager restart
  if (process.env.NODE_ENV === 'production') {
    logger.error('Exiting due to unhandled rejection');
    process.exit(1);
  }
});

process.on('uncaughtException', (error: Error) => {
  logger.error('🔴 Uncaught Exception:', {
    message: error.message,
    stack: error.stack
  });
  
  // Always exit on uncaught exception
  logger.error('Exiting due to uncaught exception');
  process.exit(1);
});

export default app;

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
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
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

export default app;

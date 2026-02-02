import dotenv from 'dotenv';
import Bull from 'bull';
import cron from 'node-cron';
import express, { Application } from 'express';
import { logger } from './utils/logger';
import { ScheduleManager } from './services/scheduleManager';
import { QueryExecutor } from './services/queryExecutor';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const HEALTH_PORT = process.env.HEALTH_PORT || 3002;

// Create Bull queue for query execution
export const queryQueue = new Bull('query-execution', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000
    },
    removeOnComplete: 100,
    removeOnFail: 100
  }
});

// Query executor service
const queryExecutor = new QueryExecutor();

// Process jobs from the queue
queryQueue.process(async (job) => {
  const attemptsMade = job.attemptsMade || 0;
  logger.info(`Processing job ${job.id} for schedule ${job.data.scheduleId} (attempt ${attemptsMade + 1}/${job.opts.attempts || 1})`);
  
  try {
    const result = await queryExecutor.execute(job.data, attemptsMade);
    logger.info(`Job ${job.id} completed successfully`);
    return result;
  } catch (error) {
    logger.error(`Job ${job.id} failed on attempt ${attemptsMade + 1}:`, error);
    throw error;
  }
});

// Queue event listeners
queryQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed with result:`, result);
});

queryQueue.on('failed', (job, error) => {
  logger.error(`Job ${job?.id} failed with error:`, error);
});

// Schedule manager to add jobs to queue
const scheduleManager = new ScheduleManager(queryQueue);

// Create Express app for health check
const healthApp: Application = express();

healthApp.get('/health', (_req: express.Request, res: express.Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    queue: {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0
    }
  };

  // Get queue stats asynchronously but don't wait for it
  queryQueue.getJobCounts().then(counts => {
    health.queue = counts;
  }).catch(() => {
    // If queue stats fail, still return ok status
  });

  res.json(health);
});

// Start health check server
healthApp.listen(HEALTH_PORT, () => {
  logger.info(`Health check endpoint available at http://localhost:${HEALTH_PORT}/health`);
});

// Start the scheduler
const startScheduler = async () => {
  try {
    logger.info('🚀 Starting SQL Query Scheduler Worker...');

    // Initialize schedule manager with retry logic
    let retries = 5;
    let initialized = false;
    
    while (retries > 0 && !initialized) {
      try {
        await scheduleManager.initialize();
        initialized = true;
      } catch (error) {
        retries--;
        if (retries > 0) {
          logger.warn(`Database initialization failed, ${retries} retries remaining. Waiting 10 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        } else {
          logger.error('Failed to initialize database after all retries');
          throw error;
        }
      }
    }

    // Scan for due schedules every minute
    cron.schedule('* * * * *', async () => {
      logger.debug('Scanning for due schedules...');
      await scheduleManager.checkSchedules();
    });

    logger.info('✅ Scheduler worker started successfully');
    logger.info('Checking for scheduled queries every minute...');

  } catch (error) {
    logger.error('Failed to start scheduler:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await queryQueue.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await queryQueue.close();
  process.exit(0);
});

// Start the scheduler
startScheduler();

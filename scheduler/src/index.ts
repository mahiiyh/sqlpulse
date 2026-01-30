import dotenv from 'dotenv';
import Bull from 'bull';
import cron from 'node-cron';
import { logger } from './utils/logger';
import { ScheduleManager } from './services/scheduleManager';
import { QueryExecutor } from './services/queryExecutor';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

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
  logger.info(`Processing job ${job.id} for schedule ${job.data.scheduleId}`);
  
  try {
    const result = await queryExecutor.execute(job.data);
    logger.info(`Job ${job.id} completed successfully`);
    return result;
  } catch (error) {
    logger.error(`Job ${job.id} failed:`, error);
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

// Start the scheduler
const startScheduler = async () => {
  try {
    logger.info('🚀 Starting SQL Query Scheduler Worker...');

    // Initialize schedule manager
    await scheduleManager.initialize();

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

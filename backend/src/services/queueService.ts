import Bull, { Queue, Job } from 'bull';
import { logger } from '../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

// Create Bull queue for query execution
const queryQueue: Queue = new Bull('query-execution', REDIS_URL, {
  defaultJobOptions: {
    attempts: 1, // Default, will be overridden per job
    removeOnComplete: 100,
    removeOnFail: 100
  }
});

// Queue event listeners
queryQueue.on('completed', (job: Job, result: any) => {
  logger.info(`Queue job ${job.id} completed`, { 
    scheduleId: job.data.scheduleId,
    result 
  });
});

queryQueue.on('failed', (job: Job, error: Error) => {
  logger.error(`Queue job ${job.id} failed`, { 
    scheduleId: job.data.scheduleId,
    error: error.message 
  });
});

queryQueue.on('error', (error: Error) => {
  logger.error('Queue error:', error);
});

interface ScheduleJobData {
  scheduleId: number;
  queryId: number;
  connectionId: number;
  scheduleName: string;
  triggeredBy: 'schedule' | 'manual';
  userId?: number;
  maxRetries?: number;
  retryDelaySeconds?: number;
  exponentialBackoff?: boolean;
}

export class QueueService {
  private queue: Queue;

  constructor() {
    this.queue = queryQueue;
  }

  /**
   * Add a schedule execution job to the queue
   */
  async addScheduleJob(data: ScheduleJobData): Promise<Job> {
    try {
      const attempts = (data.maxRetries || 0) + 1; // +1 for initial attempt
      const backoffDelay = (data.retryDelaySeconds || 60) * 1000; // Convert to ms

      const job = await this.queue.add(data, {
        jobId: `schedule-${data.scheduleId}-${Date.now()}`,
        attempts: attempts,
        backoff: data.exponentialBackoff ? {
          type: 'exponential',
          delay: backoffDelay
        } : {
          type: 'fixed',
          delay: backoffDelay
        },
        timeout: 300000, // 5 minutes timeout
      });

      logger.info(`Job added to queue`, { 
        jobId: job.id, 
        scheduleId: data.scheduleId,
        triggeredBy: data.triggeredBy 
      });

      return job;
    } catch (error) {
      logger.error('Failed to add job to queue:', error);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed
    };
  }

  /**
   * Get active jobs
   */
  async getActiveJobs() {
    return this.queue.getActive();
  }

  /**
   * Get failed jobs
   */
  async getFailedJobs(start = 0, end = 10) {
    return this.queue.getFailed(start, end);
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string) {
    return this.queue.getJob(jobId);
  }

  /**
   * Clean old jobs
   */
  async cleanOldJobs(grace: number = 86400000) {
    // grace period in ms (default 24 hours)
    await this.queue.clean(grace, 'completed');
    await this.queue.clean(grace, 'failed');
    logger.info('Cleaned old jobs from queue');
  }

  /**
   * Check if Redis connection is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.queue.isReady();
      return true;
    } catch (error) {
      logger.error('Queue health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const queueService = new QueueService();

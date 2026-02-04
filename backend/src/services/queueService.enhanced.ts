/**
 * Enhanced Queue Service with Priority, Monitoring, and Dead Letter Queue
 */

import Bull, { Queue, Job } from 'bull';
import { logger } from '../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

// Priority levels for job execution
export enum JobPriority {
  CRITICAL = 1,  // Immediate execution
  HIGH = 2,      // Important jobs
  NORMAL = 3,    // Standard jobs
  LOW = 4        // Background jobs
}

// Create main Bull queue for query execution
const queryQueue: Queue = new Bull('query-execution', REDIS_URL, {
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: 100,
    removeOnFail: false, // Keep failed jobs for analysis
    priority: JobPriority.NORMAL
  },
  settings: {
    maxStalledCount: 3,
    stalledInterval: 30000,
    guardInterval: 5000
  }
});

// Dead Letter Queue for failed jobs
const deadLetterQueue: Queue = new Bull('dead-letter', REDIS_URL, {
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: false
  }
});

// Metrics tracking
interface QueueMetrics {
  totalProcessed: number;
  totalFailed: number;
  averageProcessingTime: number;
  lastProcessed?: Date;
}

const metrics: QueueMetrics = {
  totalProcessed: 0,
  totalFailed: 0,
  averageProcessingTime: 0
};

// Enhanced event listeners with metrics
queryQueue.on('completed', (job: Job, result: any) => {
  metrics.totalProcessed++;
  metrics.lastProcessed = new Date();
  
  const processingTime = job.finishedOn ? job.finishedOn - job.processedOn! : 0;
  metrics.averageProcessingTime = 
    (metrics.averageProcessingTime * (metrics.totalProcessed - 1) + processingTime) / metrics.totalProcessed;
  
  logger.info(`✓ Queue job ${job.id} completed`, {
    scheduleId: job.data.scheduleId,
    duration: processingTime,
    priority: job.opts.priority,
    result
  });
});

queryQueue.on('failed', async (job: Job, error: Error) => {
  metrics.totalFailed++;
  
  logger.error(`✗ Queue job ${job.id} failed`, {
    scheduleId: job.data.scheduleId,
    attempt: job.attemptsMade,
    maxAttempts: job.opts.attempts,
    error: error.message,
    priority: job.opts.priority
  });

  // Move to dead letter queue if all retries exhausted
  if (job.attemptsMade >= (job.opts.attempts || 1)) {
    try {
      await deadLetterQueue.add('failed-job', {
        originalJobId: job.id,
        originalData: job.data,
        failureReason: error.message,
        failedAt: new Date(),
        attempts: job.attemptsMade
      });
      
      logger.info(`Job ${job.id} moved to dead letter queue`);
    } catch (dlqError) {
      logger.error('Failed to add job to dead letter queue:', dlqError);
    }
  }
});

queryQueue.on('stalled', (job: Job) => {
  logger.warn(`⚠ Job ${job.id} stalled`, {
    scheduleId: job.data?.scheduleId,
    stalledCount: job.data?.stalledCount || 0
  });
});

queryQueue.on('error', (error: Error) => {
  logger.error('🔴 Queue error:', error);
});

queryQueue.on('waiting', (jobId: number) => {
  logger.debug(`Job ${jobId} is waiting`);
});

queryQueue.on('active', (job: Job) => {
  logger.debug(`Job ${job.id} started processing`, {
    priority: job.opts.priority,
    scheduleId: job.data?.scheduleId
  });
});

interface ScheduleJobData {
  scheduleId: number;
  queryId: number;
  connectionId: number;
  scheduleName: string;
  triggeredBy: 'schedule' | 'manual' | 'dependency';
  userId?: number;
  maxRetries?: number;
  retryDelaySeconds?: number;
  exponentialBackoff?: boolean;
  priority?: JobPriority;
  timeout?: number;
}

export class QueueService {
  private queue: Queue;
  private dlq: Queue;

  constructor() {
    this.queue = queryQueue;
    this.dlq = deadLetterQueue;
  }

  /**
   * Add a schedule execution job to the queue with priority
   */
  async addScheduleJob(data: ScheduleJobData): Promise<Job> {
    try {
      const attempts = (data.maxRetries || 0) + 1;
      const backoffDelay = (data.retryDelaySeconds || 60) * 1000;
      const priority = data.priority || JobPriority.NORMAL;
      const timeout = data.timeout || 300000; // 5 minutes default

      const job = await this.queue.add(data, {
        jobId: `schedule-${data.scheduleId}-${Date.now()}`,
        attempts,
        backoff: data.exponentialBackoff ? {
          type: 'exponential',
          delay: backoffDelay
        } : {
          type: 'fixed',
          delay: backoffDelay
        },
        timeout,
        priority,
        removeOnComplete: true,
        removeOnFail: false
      });

      logger.info(`✓ Job added to queue`, {
        jobId: job.id,
        scheduleId: data.scheduleId,
        triggeredBy: data.triggeredBy,
        priority
      });

      return job;
    } catch (error) {
      logger.error('Failed to add job to queue:', error);
      throw error;
    }
  }

  /**
   * Add high-priority job (execute immediately)
   */
  async addPriorityJob(data: ScheduleJobData): Promise<Job> {
    return this.addScheduleJob({
      ...data,
      priority: JobPriority.HIGH
    });
  }

  /**
   * Get comprehensive queue statistics
   */
  async getQueueStats() {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
      this.queue.getPausedCount()
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      paused,
      total: waiting + active + completed + failed + delayed,
      metrics: {
        ...metrics,
        successRate: metrics.totalProcessed > 0 
          ? ((metrics.totalProcessed / (metrics.totalProcessed + metrics.totalFailed)) * 100).toFixed(2) 
          : '0.00'
      }
    };
  }

  /**
   * Get active jobs with details
   */
  async getActiveJobs() {
    const jobs = await this.queue.getActive();
    return jobs.map(job => ({
      id: job.id,
      data: job.data,
      progress: job.progress(),
      startedAt: job.processedOn ? new Date(job.processedOn) : null,
      priority: job.opts.priority
    }));
  }

  /**
   * Get failed jobs
   */
  async getFailedJobs(start = 0, end = 10) {
    const jobs = await this.queue.getFailed(start, end);
    return jobs.map(job => ({
      id: job.id,
      data: job.data,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      finishedOn: job.finishedOn ? new Date(job.finishedOn) : null
    }));
  }

  /**
   * Get dead letter queue jobs
   */
  async getDeadLetterJobs(start = 0, end = 10) {
    return this.dlq.getJobs(['completed', 'failed'], start, end);
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<Job | null> {
    const job = await this.queue.getJob(jobId);
    if (job) {
      await job.retry();
      logger.info(`Job ${jobId} queued for retry`);
      return job;
    }
    return null;
  }

  /**
   * Retry all failed jobs
   */
  async retryAllFailed(): Promise<number> {
    const failed = await this.queue.getFailed();
    let retried = 0;
    
    for (const job of failed) {
      try {
        await job.retry();
        retried++;
      } catch (error) {
        logger.error(`Failed to retry job ${job.id}:`, error);
      }
    }
    
    logger.info(`Retried ${retried} of ${failed.length} failed jobs`);
    return retried;
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string) {
    return this.queue.getJob(jobId);
  }

  /**
   * Pause queue processing
   */
  async pause(): Promise<void> {
    await this.queue.pause();
    logger.info('Queue paused');
  }

  /**
   * Resume queue processing
   */
  async resume(): Promise<void> {
    await this.queue.resume();
    logger.info('Queue resumed');
  }

  /**
   * Clean old jobs
   */
  async cleanOldJobs(grace: number = 86400000) {
    const cleaned = await Promise.all([
      this.queue.clean(grace, 'completed'),
      this.queue.clean(grace, 'failed')
    ]);
    
    logger.info('Cleaned old jobs from queue', {
      completed: cleaned[0].length,
      failed: cleaned[1].length
    });
    
    return {
      completed: cleaned[0].length,
      failed: cleaned[1].length
    };
  }

  /**
   * Check if Redis connection is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.queue.isReady();
      await this.dlq.isReady();
      return true;
    } catch (error) {
      logger.error('Queue health check failed:', error);
      return false;
    }
  }

  /**
   * Get queue performance metrics
   */
  getMetrics(): QueueMetrics {
    return { ...metrics };
  }

  /**
   * Obliterate queue (remove all jobs) - USE WITH CAUTION
   */
  async obliterate(): Promise<void> {
    await this.queue.obliterate({ force: true });
    logger.warn('⚠ Queue obliterated - all jobs removed');
  }
}

// Export singleton instance
export const queueService = new QueueService();

import { Queue } from 'bull';
import { Sequelize, QueryTypes } from 'sequelize';
import { logger } from '../utils/logger';
import { DependencyChecker } from './dependencyChecker';
import { calculateNextRun } from '../utils/cronUtils';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

interface Schedule {
  id: number;
  query_id: number;
  connection_id: number;
  schedule_name: string;
  cron_expression?: string;
  next_run_time?: Date;
  is_enabled: boolean;
  max_retries: number;
  retry_delay_seconds: number;
  exponential_backoff: boolean;
}

export class ScheduleManager {
  private queue: Queue;
  private sequelize: Sequelize;

  constructor(queue: Queue) {
    this.queue = queue;
    this.sequelize = sequelize;
  }

  async initialize() {
    try {
      await this.sequelize.authenticate();
      logger.info('Database connection established for scheduler');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      logger.info('Retrying database connection in 10 seconds...');
      // Don't throw error immediately, allow retry logic
      setTimeout(async () => {
        try {
          await this.sequelize.authenticate();
          logger.info('Database connection established for scheduler (retry successful)');
        } catch (retryError) {
          logger.error('Database connection retry failed:', retryError);
          throw retryError;
        }
      }, 10000);
    }
  }

  async checkSchedules() {
    try {
      const now = new Date();

      // Query for due schedules
      const schedules = await this.sequelize.query<Schedule>(`
        SELECT id, query_id, connection_id, schedule_name, cron_expression, next_run_time,
               max_retries, retry_delay_seconds, exponential_backoff
        FROM schedules
        WHERE is_enabled = true
        AND next_run_time <= :now
        ORDER BY next_run_time ASC
        LIMIT 100
      `, {
        replacements: { now },
        type: QueryTypes.SELECT
      }) as Schedule[];

      if (schedules && schedules.length > 0) {
        logger.info(`Found ${schedules.length} schedules to execute`);
      }

      for (const schedule of schedules || []) {
        // Check dependencies before adding to queue
        const dependencyCheck = await DependencyChecker.canExecute(schedule.id);
        
        if (!dependencyCheck.canExecute) {
          logger.info(`Skipping schedule ${schedule.id} (${schedule.schedule_name}): ${dependencyCheck.reason}`);
          continue;
        }
        
        await this.addJobToQueue(schedule);
      }
    } catch (error) {
      logger.error('Error checking schedules:', error);
    }
  }

  private async addJobToQueue(schedule: Schedule) {
    try {
      // Calculate retry configuration
      const attempts = schedule.max_retries + 1; // +1 for initial attempt
      const backoffDelay = schedule.retry_delay_seconds * 1000; // Convert to ms
      
      // Add job to Bull queue with custom retry settings
      await this.queue.add({
        scheduleId: schedule.id,
        queryId: schedule.query_id,
        connectionId: schedule.connection_id,
        scheduleName: schedule.schedule_name,
        maxRetries: schedule.max_retries,
        retryDelaySeconds: schedule.retry_delay_seconds,
        exponentialBackoff: schedule.exponential_backoff
      }, {
        jobId: `schedule-${schedule.id}-${Date.now()}`,
        attempts: attempts,
        backoff: schedule.exponential_backoff ? {
          type: 'exponential',
          delay: backoffDelay
        } : backoffDelay
      });

      logger.info(`Added schedule ${schedule.id} (${schedule.schedule_name}) to queue`);

      // Update next run time using cron expression
      await this.updateNextRunTime(schedule.id, schedule.cron_expression);
    } catch (error) {
      logger.error(`Failed to add schedule ${schedule.id} to queue:`, error);
    }
  }

  private async updateNextRunTime(scheduleId: number, cronExpression?: string) {
    let nextRunTime: Date;
    
    if (cronExpression) {
      // Calculate next run time using cron expression
      const calculatedNextRun = calculateNextRun(cronExpression);
      nextRunTime = calculatedNextRun || new Date(Date.now() + 24 * 60 * 60 * 1000); // Fallback to 24 hours
    } else {
      // No cron expression, default to 24 hours
      nextRunTime = new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
    
    await this.sequelize.query(`
      UPDATE schedules
      SET next_run_time = :nextRunTime, last_run_time = NOW()
      WHERE id = :scheduleId
    `, {
      replacements: { nextRunTime, scheduleId }
    });
    
    logger.info(`Updated schedule ${scheduleId} - next run: ${nextRunTime.toLocaleString()}`);
  }
}

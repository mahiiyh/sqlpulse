import Bull, { Job } from 'bull';
import { logger } from '../utils/logger';
import { ExecutionHistory } from '../models/ExecutionHistory';
import { Query } from '../models/Query';
import { Connection } from '../models/Connection';
import { Schedule } from '../models/Schedule';
import { QueryExecutor } from '../services/queryExecutor';
import { NotificationService, NotificationPayload } from '../services/notificationService';

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';

interface JobData {
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

// Create queue
const queryQueue = new Bull('query-execution', REDIS_URL);

// Process jobs
queryQueue.process(async (job: Job<JobData>) => {
  const { scheduleId, queryId, connectionId, userId } = job.data;
  const attemptsMade = job.attemptsMade || 0;
  
  logger.info(`Processing job ${job.id} for schedule ${scheduleId}`, {
    attempt: attemptsMade + 1,
    maxAttempts: job.opts.attempts
  });

  let executionHistory: ExecutionHistory | null = null;
  const startTime = Date.now();

  try {
    // Fetch query, connection, and schedule
    const [query, connection, schedule] = await Promise.all([
      Query.findByPk(queryId),
      Connection.findByPk(connectionId),
      Schedule.findByPk(scheduleId)
    ]);

    if (!query) {
      throw new Error(`Query ${queryId} not found`);
    }

    if (!connection) {
      throw new Error(`Connection ${connectionId} not found`);
    }

    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }

    // Create execution history record
    executionHistory = await ExecutionHistory.create({
      query_id: queryId,
      connection_id: connectionId,
      executed_by: userId,
      execution_type: 'manual' as any,
      executed_at: new Date(),
      status: 'running' as any,
      execution_time_ms: 0,
      rows_affected: 0
    });

    // Execute query based on database type
    let result: { rows: any[]; rowsAffected: number };
    
    switch (connection.type) {
      case 'postgresql':
        result = await QueryExecutor.executePostgreSQL(connection, query.sql_content);
        break;
      case 'mysql':
        result = await QueryExecutor.executeMySQL(connection, query.sql_content);
        break;
      case 'sqlserver':
        result = await QueryExecutor.executeSQLServer(connection, query.sql_content);
        break;
      default:
        throw new Error(`Unsupported database type: ${connection.type}`);
    }

    const executionTime = Date.now() - startTime;

    // Update execution history with success
    await executionHistory.update({
      status: 'success' as any,
      completed_at: new Date(),
      execution_time_ms: executionTime,
      rows_affected: result.rowsAffected || 0
    });

    // Update schedule's last run time
    await schedule.update({
      last_run_time: new Date()
    });

    // Send success notification if configured
    if (schedule.notification_enabled && schedule.notification_config) {
      try {
        const notificationPayload: NotificationPayload = {
          scheduleId: schedule.id,
          scheduleName: schedule.schedule_name,
          queryName: query.name,
          executionStatus: 'success',
          executionTime: executionTime,
          rowsAffected: result.rowsAffected || 0,
          executedAt: new Date()
        };
        await NotificationService.sendNotification(
          schedule.notification_config as any,
          notificationPayload
        );
      } catch (notifError) {
        logger.error('Failed to send success notification:', notifError);
      }
    }

    logger.info(`Job ${job.id} completed successfully`, {
      scheduleId,
      executionTime,
      rowsAffected: result.rowsAffected
    });

    return {
      success: true,
      executionId: executionHistory.id,
      executionTime,
      rowsAffected: result.rowsAffected
    };

  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    logger.error(`Job ${job.id} failed`, {
      scheduleId,
      attempt: attemptsMade + 1,
      error: error.message
    });

    // Update execution history with failure
    if (executionHistory) {
      await executionHistory.update({
        status: 'failed' as any,
        completed_at: new Date(),
        execution_time_ms: executionTime,
        error_message: error.message
      });
    }

    // Get schedule for notification
    const schedule = await Schedule.findByPk(scheduleId);
    const query = await Query.findByPk(queryId);

    // Send failure notification if configured
    if (schedule?.notification_enabled && schedule.notification_config && query) {
      try {
        const notificationPayload: NotificationPayload = {
          scheduleId: schedule.id,
          scheduleName: schedule.schedule_name,
          queryName: query.name,
          executionStatus: 'failed',
          executionTime: executionTime,
          errorMessage: error.message,
          executedAt: new Date()
        };
        await NotificationService.sendNotification(
          schedule.notification_config as any,
          notificationPayload
        );
      } catch (notifError) {
        logger.error('Failed to send failure notification:', notifError);
      }
    }

    throw error; // Re-throw for Bull retry logic
  }
});

// Queue event handlers
queryQueue.on('completed', (job: Job, result: any) => {
  logger.info(`✅ Queue job ${job.id} completed`, result);
});

queryQueue.on('failed', (job: Job, error: Error) => {
  logger.error(`❌ Queue job ${job.id} failed permanently`, {
    scheduleId: job.data.scheduleId,
    attempts: job.attemptsMade,
    error: error.message
  });
});

queryQueue.on('stalled', (job: Job) => {
  logger.warn(`⚠️ Queue job ${job.id} stalled`, {
    scheduleId: job.data.scheduleId
  });
});

logger.info('🔧 Query execution worker initialized');

export default queryQueue;

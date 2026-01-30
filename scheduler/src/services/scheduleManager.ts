import { Queue } from 'bull';
import { Sequelize, QueryTypes } from 'sequelize';
import { logger } from '../utils/logger';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://sqlquery_user:sqlquery_pass@localhost:5432/sqlquery_db';

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
      throw error;
    }
  }

  async checkSchedules() {
    try {
      const now = new Date();

      // Query for due schedules
      const schedules = await this.sequelize.query<Schedule>(`
        SELECT id, query_id, connection_id, schedule_name, next_run_time
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
        await this.addJobToQueue(schedule);
      }
    } catch (error) {
      logger.error('Error checking schedules:', error);
    }
  }

  private async addJobToQueue(schedule: Schedule) {
    try {
      // Add job to Bull queue
      await this.queue.add({
        scheduleId: schedule.id,
        queryId: schedule.query_id,
        connectionId: schedule.connection_id,
        scheduleName: schedule.schedule_name
      }, {
        jobId: `schedule-${schedule.id}-${Date.now()}`
      });

      logger.info(`Added schedule ${schedule.id} (${schedule.schedule_name}) to queue`);

      // Update next run time (simplified - would need proper cron calculation)
      await this.updateNextRunTime(schedule.id);
    } catch (error) {
      logger.error(`Failed to add schedule ${schedule.id} to queue:`, error);
    }
  }

  private async updateNextRunTime(scheduleId: number) {
    // This is a simplified version - would need proper cron expression parsing
    const nextRunTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 hours
    
    await this.sequelize.query(`
      UPDATE schedules
      SET next_run_time = :nextRunTime, last_run_time = NOW()
      WHERE id = :scheduleId
    `, {
      replacements: { nextRunTime, scheduleId }
    });
  }
}

import { Sequelize, QueryTypes } from 'sequelize';
import * as sql from 'mssql';
import mysql from 'mysql2/promise';
import { logger } from '../utils/logger';
import CryptoJS from 'crypto-js';
import { NotificationService, NotificationChannel } from './notificationService';
import { QueryParameterProcessor } from '../utils/queryParameters';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

const encryptionKeyEnv = process.env.ENCRYPTION_KEY;
if (!encryptionKeyEnv) {
  throw new Error('ENCRYPTION_KEY environment variable is required');
}
if (encryptionKeyEnv.length !== 32) {
  throw new Error('ENCRYPTION_KEY must be exactly 32 characters for AES-256 encryption');
}
const ENCRYPTION_KEY: string = encryptionKeyEnv;

const appSequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

interface JobData {
  scheduleId: number;
  queryId: number;
  connectionId: number;
  scheduleName: string;
  maxRetries?: number;
  retryDelaySeconds?: number;
  exponentialBackoff?: boolean;
}

interface QueryData {
  sql_content: string;
  name: string;
}

interface ConnectionData {
  type: string;
  host: string;
  port: number;
  database_name: string;
  username: string;
  encrypted_password: string;
  timeout_seconds?: number;
  max_connections?: number;
}

interface ScheduleData {
  schedule_name: string;
  notification_enabled: boolean;
  notification_channel?: string;
  notification_config?: any;
  max_retries: number;
  retry_delay_seconds: number;
  exponential_backoff: boolean;
}

export class QueryExecutor {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService(logger);
  }

  private decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async execute(jobData: JobData, attemptsMade: number = 0) {
    const startTime = Date.now();
    const executionId = await this.createExecutionRecord(jobData, attemptsMade);

    try {
      // Fetch query, connection and schedule details
      const query = await this.getQuery(jobData.queryId);
      const connection = await this.getConnection(jobData.connectionId);
      const schedule = await this.getSchedule(jobData.scheduleId);

      logger.info(`Executing query "${query.name}" on ${connection.type} database`);

      // Process query parameters (@TODAY, @YESTERDAY, etc.)
      const processedQuery = QueryParameterProcessor.processParameters(query.sql_content, {
        username: 'scheduler'
      });

      // Execute query based on database type
      let result;
      switch (connection.type) {
        case 'sqlserver':
          result = await this.executeSqlServer(processedQuery, connection);
          break;
        case 'mysql':
          result = await this.executeMySql(processedQuery, connection);
          break;
        case 'postgresql':
          result = await this.executePostgreSQL(processedQuery, connection);
          break;
        default:
          throw new Error(`Unsupported database type: ${connection.type}`);
      }

      const executionTime = Date.now() - startTime;

      // Update execution record with success
      await this.updateExecutionRecord(executionId, {
        status: 'success',
        executionTime,
        rowsAffected: result.rowsAffected
      });

      // Send success notification if enabled
      await this.sendNotification(schedule, query, {
        status: 'success',
        executionTime,
        rowsAffected: result.rowsAffected,
        resultPreview: result.recordset
      });

      return {
        success: true,
        executionId,
        rowsAffected: result.rowsAffected,
        executionTime
      };
    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      logger.error(`Query execution failed:`, error);

      // Update execution record with failure
      await this.updateExecutionRecord(executionId, {
        status: 'failed',
        executionTime,
        errorMessage: error.message
      });

      // Fetch schedule for notification
      const schedule = await this.getSchedule(jobData.scheduleId);
      const query = await this.getQuery(jobData.queryId);

      // Only send failure notification on final attempt
      const maxRetries = jobData.maxRetries || 0;
      const isFinalAttempt = attemptsMade >= maxRetries;
      
      if (isFinalAttempt) {
        await this.sendNotification(schedule, query, {
          status: 'failed',
          executionTime,
          errorMessage: error.message
        });
        logger.info(`Final retry attempt failed for schedule ${jobData.scheduleId}, notification sent`);
      } else {
        logger.info(`Retry attempt ${attemptsMade + 1}/${maxRetries + 1} failed for schedule ${jobData.scheduleId}`);
      }

      throw error;
    }
  }

  private async getQuery(queryId: number): Promise<QueryData> {
    const [results] = await appSequelize.query<QueryData>(
      'SELECT sql_content, name FROM queries WHERE id = :queryId',
      { replacements: { queryId }, type: QueryTypes.SELECT }
    );
    
    if (!results) {
      throw new Error(`Query ${queryId} not found`);
    }
    
    return results;
  }

  private async getConnection(connectionId: number): Promise<ConnectionData> {
    const [results] = await appSequelize.query<ConnectionData>(
      'SELECT type, host, port, database_name, username, encrypted_password FROM connections WHERE id = :connectionId',
      { replacements: { connectionId }, type: QueryTypes.SELECT }
    );
    
    if (!results) {
      throw new Error(`Connection ${connectionId} not found`);
    }
    
    return results;
  }

  private async getSchedule(scheduleId: number): Promise<ScheduleData> {
    const [results] = await appSequelize.query<ScheduleData>(
      'SELECT schedule_name, notification_enabled, notification_channel, notification_config, max_retries, retry_delay_seconds, exponential_backoff FROM schedules WHERE id = :scheduleId',
      { replacements: { scheduleId }, type: QueryTypes.SELECT }
    );
    
    if (!results) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }
    
    return results;
  }

  private async sendNotification(
    schedule: ScheduleData,
    query: QueryData,
    execution: { status: 'success' | 'failed'; executionTime: number; rowsAffected?: number; errorMessage?: string; resultPreview?: any }
  ) {
    if (!schedule.notification_enabled || !schedule.notification_channel || !schedule.notification_config) {
      return;
    }

    try {
      const config = {
        ...schedule.notification_config,
        channel: schedule.notification_channel as NotificationChannel,
        enabled: schedule.notification_enabled
      };

      // Safely extract result preview
      let resultPreview: any[] | undefined = undefined;
      if (execution.resultPreview) {
        if (Array.isArray(execution.resultPreview)) {
          resultPreview = execution.resultPreview;
        } else if (typeof execution.resultPreview === 'object') {
          resultPreview = [execution.resultPreview];
        }
      }

      const payload = {
        scheduleId: 0, // Will be set by job data
        scheduleName: schedule.schedule_name,
        queryName: query.name,
        executionStatus: execution.status,
        executionTime: execution.executionTime,
        rowsAffected: execution.rowsAffected,
        errorMessage: execution.errorMessage,
        executedAt: new Date(),
        resultPreview: resultPreview
      };

      await this.notificationService.sendNotification(config, payload);
    } catch (error: any) {
      logger.error('Failed to send notification:', error);
      // Don't throw - notification failure shouldn't fail the job
    }
  }

  private async createExecutionRecord(jobData: JobData, attemptsMade: number = 0): Promise<number> {
    const [result] = await appSequelize.query(`
      INSERT INTO execution_history (query_id, schedule_id, connection_id, execution_type, executed_at, status, retry_attempt)
      VALUES (:queryId, :scheduleId, :connectionId, 'scheduled', NOW(), 'running', :retryAttempt)
      RETURNING id
    `, {
      replacements: {
        queryId: jobData.queryId,
        scheduleId: jobData.scheduleId,
        connectionId: jobData.connectionId,
        retryAttempt: attemptsMade
      }
    });

    return (result as any)[0].id;
  }

  private async updateExecutionRecord(
    executionId: number,
    data: { status: string; executionTime: number; rowsAffected?: number; errorMessage?: string }
  ) {
    await appSequelize.query(`
      UPDATE execution_history
      SET status = :status,
          completed_at = NOW(),
          execution_time_ms = :executionTime,
          rows_affected = :rowsAffected,
          error_message = :errorMessage
      WHERE id = :executionId
    `, {
      replacements: {
        executionId,
        status: data.status,
        executionTime: data.executionTime,
        rowsAffected: data.rowsAffected || null,
        errorMessage: data.errorMessage || null
      }
    });
  }

  private async executeSqlServer(query: string, connection: ConnectionData) {
    const config = {
      server: connection.host,
      port: connection.port,
      database: connection.database_name,
      user: connection.username,
      password: this.decrypt(connection.encrypted_password),
      options: {
        encrypt: true,
        trustServerCertificate: true,
        requestTimeout: (connection.timeout_seconds || 30) * 1000,
      },
      pool: {
        max: connection.max_connections || 10,
        min: 0,
        idleTimeoutMillis: 30000
      }
    };

    const pool = await sql.connect(config);
    const result = await pool.request().query(query);
    await pool.close();

    return {
      rowsAffected: result.rowsAffected[0] || 0,
      recordset: result.recordset
    };
  }

  private async executeMySql(query: string, connection: ConnectionData) {
    const conn = await mysql.createConnection({
      host: connection.host,
      port: connection.port,
      database: connection.database_name,
      user: connection.username,
      password: this.decrypt(connection.encrypted_password)
    });

    const [results, fields] = await conn.execute(query);
    await conn.end();

    return {
      rowsAffected: (results as any).affectedRows || 0,
      recordset: results
    };
  }

  private async executePostgreSQL(query: string, connection: ConnectionData) {
    const sequelize = new Sequelize(
      connection.database_name,
      connection.username,
      this.decrypt(connection.encrypted_password),
      {
        host: connection.host,
        port: connection.port,
        dialect: 'postgres',
        logging: false
      }
    );

    const [results, metadata] = await sequelize.query(query);
    await sequelize.close();

    return {
      rowsAffected: (metadata as any).rowCount || 0,
      recordset: results
    };
  }
}

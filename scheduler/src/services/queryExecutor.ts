import { Sequelize, QueryTypes } from 'sequelize';
import * as sql from 'mssql';
import mysql from 'mysql2/promise';
import { logger } from '../utils/logger';
import CryptoJS from 'crypto-js';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://sqlquery_user:sqlquery_pass@localhost:5432/sqlquery_db';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-me';

const appSequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false
});

interface JobData {
  scheduleId: number;
  queryId: number;
  connectionId: number;
  scheduleName: string;
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
}

export class QueryExecutor {
  private decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  async execute(jobData: JobData) {
    const startTime = Date.now();
    const executionId = await this.createExecutionRecord(jobData);

    try {
      // Fetch query and connection details
      const query = await this.getQuery(jobData.queryId);
      const connection = await this.getConnection(jobData.connectionId);

      logger.info(`Executing query "${query.name}" on ${connection.type} database`);

      // Execute query based on database type
      let result;
      switch (connection.type) {
        case 'sqlserver':
          result = await this.executeSqlServer(query.sql_content, connection);
          break;
        case 'mysql':
          result = await this.executeMySql(query.sql_content, connection);
          break;
        case 'postgresql':
          result = await this.executePostgreSQL(query.sql_content, connection);
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

  private async createExecutionRecord(jobData: JobData): Promise<number> {
    const [result] = await appSequelize.query(`
      INSERT INTO execution_history (query_id, schedule_id, connection_id, execution_type, executed_at, status)
      VALUES (:queryId, :scheduleId, :connectionId, 'scheduled', NOW(), 'running')
      RETURNING id
    `, {
      replacements: {
        queryId: jobData.queryId,
        scheduleId: jobData.scheduleId,
        connectionId: jobData.connectionId
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
        encrypt: false,
        trustServerCertificate: true
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

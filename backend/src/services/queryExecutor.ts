import { Pool as PgPool } from 'pg';
import mysql from 'mysql2/promise';
import sql from 'mssql';
import { Connection } from '../models/Connection';
import { decrypt } from '../utils/encryption';

interface QueryResult {
  rows: any[];
  rowsAffected: number;
  fields?: any[];
}

export class QueryExecutor {
  private static decryptPassword(encryptedPassword: string): string {
    try {
      const decrypted = decrypt(encryptedPassword);
      if (!decrypted || decrypted.length === 0) {
        throw new Error('Decrypted password is empty');
      }
      return decrypted;
    } catch (error: any) {
      throw new Error(`Failed to decrypt password: ${error.message}`);
    }
  }

  static async executePostgreSQL(connection: Connection, sqlQuery: string): Promise<QueryResult> {
    const password = this.decryptPassword(connection.encrypted_password);
    
    const pool = new PgPool({
      host: connection.host,
      port: connection.port,
      database: connection.database_name,
      user: connection.username,
      password: password,
      max: connection.max_connections || 10,
      connectionTimeoutMillis: (connection.timeout_seconds || 30) * 1000,
    });

    try {
      const result = await pool.query(sqlQuery);
      await pool.end();

      return {
        rows: result.rows,
        rowsAffected: result.rowCount || 0,
        fields: result.fields
      };
    } catch (error: any) {
      await pool.end();
      throw new Error(`PostgreSQL execution error: ${error.message}`);
    }
  }

  static async executeMySQL(connection: Connection, sqlQuery: string): Promise<QueryResult> {
    const password = this.decryptPassword(connection.encrypted_password);
    
    const mysqlConnection = await mysql.createConnection({
      host: connection.host,
      port: connection.port,
      database: connection.database_name,
      user: connection.username,
      password: password,
      connectTimeout: (connection.timeout_seconds || 30) * 1000,
    });

    try {
      const [rows, fields] = await mysqlConnection.execute(sqlQuery);
      await mysqlConnection.end();

      // Handle different result types
      if (Array.isArray(rows)) {
        return {
          rows: rows as any[],
          rowsAffected: rows.length,
          fields: fields as any[]
        };
      } else {
        // For INSERT, UPDATE, DELETE
        const resultSet = rows as any;
        return {
          rows: [],
          rowsAffected: resultSet.affectedRows || 0,
        };
      }
    } catch (error: any) {
      await mysqlConnection.end();
      throw new Error(`MySQL execution error: ${error.message}`);
    }
  }

  static async executeSQLServer(connection: Connection, sqlQuery: string): Promise<QueryResult> {
    const password = this.decryptPassword(connection.encrypted_password);
    
    const config: sql.config = {
      server: connection.host,
      port: connection.port,
      database: connection.database_name,
      user: connection.username,
      password: password,
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

    try {
      const pool = await sql.connect(config);
      const result = await pool.request().query(sqlQuery);
      await pool.close();

      return {
        rows: result.recordset || [],
        rowsAffected: result.rowsAffected[0] || 0,
      };
    } catch (error: any) {
      throw new Error(`SQL Server execution error: ${error.message}`);
    }
  }

  static async execute(connection: Connection, sqlQuery: string): Promise<QueryResult> {
    switch (connection.type.toLowerCase()) {
      case 'postgresql':
        return await this.executePostgreSQL(connection, sqlQuery);
      case 'mysql':
        return await this.executeMySQL(connection, sqlQuery);
      case 'sqlserver':
        return await this.executeSQLServer(connection, sqlQuery);
      default:
        throw new Error(`Unsupported database type: ${connection.type}`);
    }
  }
}

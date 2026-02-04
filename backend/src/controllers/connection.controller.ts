import { Response, NextFunction } from 'express';
import { Connection } from '../models/Connection';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { encrypt } from '../utils/encryption';
import { QueryExecutor } from '../services/queryExecutor';

export const getConnections = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Admin can see all connections with ?showAll=true
    const showAll = req.query.showAll === 'true' && req.user.role === 'admin';
    
    const whereClause: any = { is_active: true };
    if (!showAll) {
      whereClause.created_by = req.user.id;
    }

    const connections = await Connection.findAll({
      where: whereClause,
      attributes: { exclude: ['encrypted_password'] }
    });

    res.json({
      success: true,
      data: connections
    });
  } catch (error) {
    next(error);
  }
};

export const getConnection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const connection = await Connection.findByPk(req.params.id, {
      attributes: { exclude: ['encrypted_password'] }
    });

    if (!connection) {
      throw new AppError('Connection not found', 404);
    }

    // Check if user owns this connection or is admin
    if (connection.created_by !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Access denied: You do not own this connection', 403);
    }

    res.json({
      success: true,
      data: connection
    });
  } catch (error) {
    next(error);
  }
};

export const createConnection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, type, host, port, database_name, username, password, environment } = req.body;

    // Encrypt password
    const encrypted_password = encrypt(password);

    const connection = await Connection.create({
      name,
      type,
      host,
      port,
      database_name,
      username,
      encrypted_password,
      environment,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      data: {
        ...connection.toJSON(),
        encrypted_password: undefined
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateConnection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const connection = await Connection.findByPk(req.params.id);

    if (!connection) {
      throw new AppError('Connection not found', 404);
    }

    // Check if user owns this connection or is admin
    if (connection.created_by !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Access denied: You do not own this connection', 403);
    }

    const { name, type, host, port, database_name, username, password, environment } = req.body;
    const updateData: any = { name, type, host, port, database_name, username, environment };

    if (password) {
      updateData.encrypted_password = encrypt(password);
    }

    await connection.update(updateData);

    res.json({
      success: true,
      data: {
        ...connection.toJSON(),
        encrypted_password: undefined
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteConnection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const connection = await Connection.findByPk(req.params.id);

    if (!connection) {
      throw new AppError('Connection not found', 404);
    }

    // Check if user owns this connection or is admin
    if (connection.created_by !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Access denied: You do not own this connection', 403);
    }

    await connection.update({ is_active: false });

    res.json({
      success: true,
      message: 'Connection deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const testConnection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const connection = await Connection.findByPk(req.params.id);

    if (!connection) {
      throw new AppError('Connection not found', 404);
    }

    // Check if user owns this connection or is admin
    if (connection.created_by !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Access denied: You do not own this connection', 403);
    }

    // Test connection by executing a simple query
    const startTime = Date.now();
    let testQuery = 'SELECT 1';
    
    // Use database-specific test queries
    if (connection.type.toLowerCase() === 'postgresql') {
      testQuery = 'SELECT 1 as test';
    } else if (connection.type.toLowerCase() === 'mysql') {
      testQuery = 'SELECT 1 as test';
    } else if (connection.type.toLowerCase() === 'sqlserver') {
      testQuery = 'SELECT 1 as test';
    }

    try {
      await QueryExecutor.execute(connection, testQuery);
      const responseTime = Date.now() - startTime;

      res.json({
        success: true,
        message: 'Connection test successful',
        data: {
          responseTime: responseTime,
          connectionType: connection.type,
          host: connection.host,
          port: connection.port,
          database: connection.database_name
        }
      });
    } catch (execError: any) {
      throw new AppError(`Connection test failed: ${execError.message}`, 400);
    }
  } catch (error) {
    next(error);
  }
};

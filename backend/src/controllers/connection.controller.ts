import { Response, NextFunction } from 'express';
import { Connection } from '../models/Connection';
import { TeamConnection, TeamMember } from '../models';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { encrypt } from '../utils/encryption';
import { QueryExecutor } from '../services/queryExecutor';
import { Op } from 'sequelize';

export const getConnections = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Admin can see all connections with ?showAll=true
    const showAll = req.query.showAll === 'true' && req.user.role === 'admin';
    
    if (showAll) {
      const connections = await Connection.findAll({
        where: { is_active: true },
        attributes: { exclude: ['encrypted_password'] }
      });
      res.json({ success: true, data: connections });
      return;
    }

    // Get user's teams
    const userTeamMemberships = await TeamMember.findAll({
      where: { user_id: req.user.id },
      attributes: ['team_id']
    });
    const userTeamIds = userTeamMemberships.map(tm => tm.team_id);

    // Get connections shared with user's teams
    const sharedConnectionIds = userTeamIds.length > 0 
      ? await TeamConnection.findAll({
          where: { team_id: { [Op.in]: userTeamIds } },
          attributes: ['connection_id']
        }).then(tcs => tcs.map(tc => tc.connection_id))
      : [];

    // Get connections: owned by user OR shared with their teams
    const connections = await Connection.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          { created_by: req.user.id },
          { id: { [Op.in]: sharedConnectionIds } }
        ]
      },
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

export const getConnection = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const connection = await Connection.findByPk(req.params.id, {
      attributes: { exclude: ['encrypted_password'] }
    });

    if (!connection) {
      throw new AppError('Connection not found', 404);
    }

    // Check if user owns this connection or is admin
    if (connection.created_by === req.user.id || req.user.role === 'admin') {
      res.json({ success: true, data: connection });
      return;
    }

    // Check if connection is shared with any of user's teams
    const userTeamMemberships = await TeamMember.findAll({
      where: { user_id: req.user.id },
      attributes: ['team_id']
    });
    const userTeamIds = userTeamMemberships.map(tm => tm.team_id);

    if (userTeamIds.length > 0) {
      const teamShare = await TeamConnection.findOne({
        where: {
          connection_id: connection.id,
          team_id: { [Op.in]: userTeamIds }
        }
      });

      if (teamShare) {
        res.json({ success: true, data: connection });
        return;
      }
    }

    throw new AppError('Access denied: You do not have access to this connection', 403);
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

import { Response, NextFunction } from 'express';
import { Connection } from '../models/Connection';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { encrypt } from '../utils/encryption'; // decrypt imported when needed

export const getConnections = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const connections = await Connection.findAll({
      where: { is_active: true },
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

    await connection.update({ is_active: false });

    res.json({
      success: true,
      message: 'Connection deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const testConnection = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // TODO: Implement actual connection testing
    res.json({
      success: true,
      message: 'Connection test successful'
    });
  } catch (error) {
    next(error);
  }
};

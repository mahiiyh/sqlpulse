import { Response, NextFunction } from 'express';
import { ExecutionHistory } from '../models/ExecutionHistory';
import { Query } from '../models/Query';
import { Connection } from '../models/Connection';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

export const getExecutionHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { 
      query_id, 
      connection_id, 
      status, 
      execution_type,
      start_date,
      end_date,
      limit = 50,
      offset = 0
    } = req.query;

    const where: any = {};

    if (query_id) where.query_id = query_id;
    if (connection_id) where.connection_id = connection_id;
    if (status) where.status = status;
    if (execution_type) where.execution_type = execution_type;
    
    if (start_date || end_date) {
      where.executed_at = {};
      if (start_date) where.executed_at[Op.gte] = new Date(start_date as string);
      if (end_date) where.executed_at[Op.lte] = new Date(end_date as string);
    }

    // Non-admin users can only see their own executions or public queries
    if (req.user.role !== 'admin') {
      where.executed_by = req.user.id;
    }

    const { count, rows } = await ExecutionHistory.findAndCountAll({
      where,
      include: [
        {
          model: Query,
          as: 'query',
          attributes: ['id', 'name', 'description', 'category']
        },
        {
          model: Connection,
          as: 'connection',
          attributes: ['id', 'name', 'type', 'environment']
        },
        {
          model: User,
          as: 'executor',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['executed_at', 'DESC']],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    res.json({
      success: true,
      data: {
        executions: rows,
        total: count,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getExecutionDetail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const execution = await ExecutionHistory.findByPk(id, {
      include: [
        {
          model: Query,
          as: 'query',
          attributes: ['id', 'name', 'description', 'sql_content', 'category']
        },
        {
          model: Connection,
          as: 'connection',
          attributes: ['id', 'name', 'type', 'host', 'database_name', 'environment']
        },
        {
          model: User,
          as: 'executor',
          attributes: ['id', 'username', 'email']
        }
      ]
    });

    if (!execution) {
      throw new AppError('Execution history not found', 404);
    }

    // Non-admin users can only see their own executions
    if (req.user.role !== 'admin' && execution.executed_by !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    res.json({
      success: true,
      data: execution
    });
  } catch (error) {
    next(error);
  }
};

export const getQueryHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Check if query exists and user has access
    const query = await Query.findByPk(id);
    if (!query) {
      throw new AppError('Query not found', 404);
    }

    if (!query.is_public && query.created_by !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Access denied', 403);
    }

    const { count, rows } = await ExecutionHistory.findAndCountAll({
      where: { query_id: id },
      include: [
        {
          model: Connection,
          as: 'connection',
          attributes: ['id', 'name', 'type', 'environment']
        },
        {
          model: User,
          as: 'executor',
          attributes: ['id', 'username', 'email']
        }
      ],
      order: [['executed_at', 'DESC']],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    res.json({
      success: true,
      data: {
        executions: rows,
        total: count,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getExecutionStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days as string));

    const where: any = {
      executed_at: {
        [Op.gte]: startDate
      }
    };

    // Non-admin users see only their stats
    if (req.user.role !== 'admin') {
      where.executed_by = req.user.id;
    }

    const totalExecutions = await ExecutionHistory.count({ where });
    
    const successfulExecutions = await ExecutionHistory.count({
      where: { ...where, status: 'success' }
    });

    const failedExecutions = await ExecutionHistory.count({
      where: { ...where, status: 'failed' }
    });

    const avgExecutionTime = await ExecutionHistory.findOne({
      where: { ...where, status: 'success' },
      attributes: [
        [ExecutionHistory.sequelize!.fn('AVG', ExecutionHistory.sequelize!.col('execution_time_ms')), 'avg_time']
      ],
      raw: true
    }) as any;

    res.json({
      success: true,
      data: {
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        successRate: totalExecutions > 0 ? (successfulExecutions / totalExecutions * 100).toFixed(2) : 0,
        avgExecutionTimeMs: avgExecutionTime?.avg_time ? Math.round(avgExecutionTime.avg_time) : 0,
        period: `Last ${days} days`
      }
    });
  } catch (error) {
    next(error);
  }
};

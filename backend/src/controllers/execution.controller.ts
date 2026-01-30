import { Response, NextFunction } from 'express';
import { ExecutionHistory } from '../models/ExecutionHistory';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getExecutionHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = 100, offset = 0, status, query_id } = req.query;
    const where: any = {};

    if (status) where.status = status;
    if (query_id) where.query_id = query_id;

    const executions = await ExecutionHistory.findAll({
      where,
      order: [['executed_at', 'DESC']],
      limit: Number(limit),
      offset: Number(offset)
    });

    res.json({
      success: true,
      data: executions
    });
  } catch (error) {
    next(error);
  }
};

export const getExecutionById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const execution = await ExecutionHistory.findByPk(req.params.id);

    if (!execution) {
      throw new AppError('Execution not found', 404);
    }

    res.json({
      success: true,
      data: execution
    });
  } catch (error) {
    next(error);
  }
};

export const getExecutionResults = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // TODO: Fetch stored results from database or file system
    res.json({
      success: true,
      data: {
        rows: [],
        columns: []
      }
    });
  } catch (error) {
    next(error);
  }
};

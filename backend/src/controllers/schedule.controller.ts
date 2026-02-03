import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { Schedule } from '../models/Schedule';
import { Query } from '../models/Query';
import { Connection } from '../models/Connection';
import { ExecutionHistory } from '../models/ExecutionHistory';
import ScheduleDependency from '../models/ScheduleDependency';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { calculateNextRun } from '../utils/cronUtils';
import { queueService } from '../services/queueService';

export const getSchedules = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schedules = await Schedule.findAll({
      order: [['next_run_time', 'ASC']],
      include: [
        {
          model: Query,
          as: 'query',
          attributes: ['id', 'name']
        },
        {
          model: Connection,
          as: 'connection',
          attributes: ['id', 'name', 'environment']
        }
      ]
    });

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    next(error);
  }
};

export const getSchedule = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id, {
      include: [
        {
          model: Query,
          as: 'query',
          attributes: ['id', 'name']
        },
        {
          model: Connection,
          as: 'connection',
          attributes: ['id', 'name', 'environment']
        }
      ]
    });

    if (!schedule) {
      throw new AppError('Schedule not found', 404);
    }

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

export const createSchedule = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Calculate next run time if cron expression is provided
    let next_run_time = null;
    if (req.body.cron_expression) {
      next_run_time = calculateNextRun(req.body.cron_expression);
    }

    const schedule = await Schedule.create({
      ...req.body,
      next_run_time,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

export const updateSchedule = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      throw new AppError('Schedule not found', 404);
    }

    // Recalculate next run time if cron expression is updated
    const updateData: any = { ...req.body };
    if (req.body.cron_expression && req.body.cron_expression !== schedule.cron_expression) {
      updateData.next_run_time = calculateNextRun(req.body.cron_expression);
    }

    await schedule.update(updateData);

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSchedule = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      throw new AppError('Schedule not found', 404);
    }

    // Delete associated execution history first to avoid foreign key constraint
    await ExecutionHistory.destroy({
      where: {
        schedule_id: schedule.id
      }
    });

    // Delete associated schedule dependencies (if table exists)
    try {
      await ScheduleDependency.destroy({
        where: {
          [Op.or]: [
            { schedule_id: schedule.id },
            { depends_on_schedule_id: schedule.id }
          ]
        }
      });
    } catch (depError) {
      // Table might not exist yet, continue with deletion
      console.log('Schedule dependencies cleanup skipped:', depError);
    }

    // Now safe to delete the schedule
    await schedule.destroy();

    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const enableSchedule = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      throw new AppError('Schedule not found', 404);
    }

    await schedule.update({ is_enabled: true });

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

export const disableSchedule = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      throw new AppError('Schedule not found', 404);
    }

    await schedule.update({ is_enabled: false });

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    next(error);
  }
};

export const runScheduleNow = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);

    if (!schedule) {
      throw new AppError('Schedule not found', 404);
    }

    if (!schedule.is_enabled) {
      throw new AppError('Cannot run disabled schedule', 400);
    }

    // Add job to queue for immediate execution
    await queueService.addScheduleJob({
      scheduleId: schedule.id,
      queryId: schedule.query_id,
      connectionId: schedule.connection_id,
      scheduleName: schedule.schedule_name,
      triggeredBy: 'manual',
      userId: req.user.id,
      maxRetries: schedule.max_retries,
      retryDelaySeconds: schedule.retry_delay_seconds,
      exponentialBackoff: schedule.exponential_backoff
    });

    res.json({
      success: true,
      message: 'Schedule execution triggered'
    });
  } catch (error) {
    next(error);
  }
};

export const getScheduleHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const scheduleId = parseInt(req.params.id, 10);
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const offset = parseInt(req.query.offset as string, 10) || 0;

    // Get schedule to verify it exists
    const schedule = await Schedule.findByPk(scheduleId);
    if (!schedule) {
      throw new AppError('Schedule not found', 404);
    }

    // Fetch execution history for this schedule's query
    const { rows: executions, count } = await ExecutionHistory.findAndCountAll({
      where: { query_id: schedule.query_id },
      include: [
        {
          model: Query,
          as: 'query',
          attributes: ['id', 'name']
        },
        {
          model: Connection,
          as: 'connection',
          attributes: ['id', 'name']
        }
      ],
      order: [['executed_at', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      data: {
        executions,
        total: count,
        limit,
        offset
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingSchedules = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schedules = await Schedule.findAll({
      where: { is_enabled: true },
      order: [['next_run_time', 'ASC']],
      limit: 20
    });

    res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    next(error);
  }
};

import { Response, NextFunction } from 'express';
import { Schedule } from '../models/Schedule';
import { Query } from '../models/Query';
import { Connection } from '../models/Connection';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { calculateNextRun } from '../utils/cronUtils';

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

export const runScheduleNow = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // TODO: Trigger immediate execution via queue
    res.json({
      success: true,
      message: 'Schedule execution triggered'
    });
  } catch (error) {
    next(error);
  }
};

export const getScheduleHistory = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // TODO: Fetch execution history for schedule
    res.json({
      success: true,
      data: []
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

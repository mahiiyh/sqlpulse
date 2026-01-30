import { Response, NextFunction } from 'express';
import { Query } from '../models/Query';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

export const getQueries = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { category, database_type, search, is_public } = req.query;
    const where: any = {};

    if (category) where.category = category;
    if (database_type) where.database_type = database_type;
    if (is_public !== undefined) where.is_public = is_public === 'true';
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Show user's queries or public queries
    if (!where.is_public) {
      where[Op.or] = [
        { created_by: req.user.id },
        { is_public: true }
      ];
    }

    const queries = await Query.findAll({ where, order: [['updated_at', 'DESC']] });

    res.json({
      success: true,
      data: queries
    });
  } catch (error) {
    next(error);
  }
};

export const getQuery = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = await Query.findByPk(req.params.id);

    if (!query) {
      throw new AppError('Query not found', 404);
    }

    // Check access permission
    if (!query.is_public && query.created_by !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    res.json({
      success: true,
      data: query
    });
  } catch (error) {
    next(error);
  }
};

export const createQuery = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = await Query.create({
      ...req.body,
      created_by: req.user.id
    });

    res.status(201).json({
      success: true,
      data: query
    });
  } catch (error) {
    next(error);
  }
};

export const updateQuery = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = await Query.findByPk(req.params.id);

    if (!query) {
      throw new AppError('Query not found', 404);
    }

    if (query.created_by !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    await query.update(req.body);

    res.json({
      success: true,
      data: query
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuery = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const query = await Query.findByPk(req.params.id);

    if (!query) {
      throw new AppError('Query not found', 404);
    }

    if (query.created_by !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Access denied', 403);
    }

    await query.destroy();

    res.json({
      success: true,
      message: 'Query deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const executeQuery = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // TODO: Implement query execution logic
    res.json({
      success: true,
      message: 'Query execution not yet implemented',
      data: {
        rows: [],
        rowsAffected: 0,
        executionTime: 0
      }
    });
  } catch (error) {
    next(error);
  }
};

export const searchQueries = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;

    const queries = await Query.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { name: { [Op.iLike]: `%${q}%` } },
              { description: { [Op.iLike]: `%${q}%` } },
              { sql_content: { [Op.iLike]: `%${q}%` } }
            ]
          },
          {
            [Op.or]: [
              { created_by: req.user.id },
              { is_public: true }
            ]
          }
        ]
      },
      limit: 50
    });

    res.json({
      success: true,
      data: queries
    });
  } catch (error) {
    next(error);
  }
};

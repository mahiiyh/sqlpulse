import { Response, NextFunction } from 'express';
import { Query } from '../models/Query';
import { Connection } from '../models/Connection';
import { ExecutionHistory, ExecutionType, ExecutionStatus } from '../models/ExecutionHistory';
import { QueryVersion } from '../models/QueryVersion';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';
import { QueryExecutor } from '../services/queryExecutor';
import { ExportUtils } from '../utils/exportUtils';
import { QueryParameterProcessor } from '../utils/queryParameters';

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

    const queries = await Query.findAll({ 
      where, 
      order: [['updated_at', 'DESC']],
      include: [
        {
          model: ExecutionHistory,
          as: 'executions',
          attributes: []
        }
      ],
      attributes: {
        include: [
          [
            Query.sequelize!.fn('COUNT', Query.sequelize!.col('executions.id')),
            'execution_count'
          ]
        ]
      },
      group: ['Query.id']
    });

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

    // Create initial version
    await QueryVersion.create({
      query_id: query.id,
      version_number: 1,
      sql_content: query.sql_content,
      change_description: 'Initial version',
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

    // If SQL content changed, create a new version
    if (req.body.sql_content && req.body.sql_content !== query.sql_content) {
      const maxVersion = await QueryVersion.max('version_number', {
        where: { query_id: query.id }
      }) as number || 0;

      await QueryVersion.create({
        query_id: query.id,
        version_number: maxVersion + 1,
        sql_content: req.body.sql_content,
        change_description: req.body.change_description || 'Query updated',
        created_by: req.user.id
      });
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

export const executeQuery = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const executionStartTime = Date.now();
  let executionHistory: ExecutionHistory | null = null;

  try {
    const { id } = req.params;
    const { connection_id, parameters } = req.body;

    if (!connection_id) {
      throw new AppError('Connection ID is required', 400);
    }

    // Fetch query
    const query = await Query.findByPk(id);
    if (!query) {
      throw new AppError('Query not found', 404);
    }

    // Check access permission
    if (!query.is_public && query.created_by !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    // Fetch connection
    const connection = await Connection.findByPk(connection_id);
    if (!connection) {
      throw new AppError('Connection not found', 404);
    }

    // Create execution history record
    executionHistory = await ExecutionHistory.create({
      query_id: parseInt(id),
      connection_id: connection_id,
      executed_by: req.user.id,
      execution_type: ExecutionType.MANUAL,
      executed_at: new Date(),
      status: ExecutionStatus.RUNNING,
      parameters_used: parameters || {}
    });

    // Replace parameters in SQL if provided
    let sqlToExecute = query.sql_content;
    
    // First process dynamic parameters (@TODAY, @YESTERDAY, etc.)
    sqlToExecute = QueryParameterProcessor.processParameters(sqlToExecute, {
      userId: req.user.id,
      username: req.user.username,
      userEmail: req.user.email
    });
    
    // Then replace custom parameters if provided
    if (parameters) {
      Object.keys(parameters).forEach(key => {
        const regex = new RegExp(`@${key}`, 'g');
        sqlToExecute = sqlToExecute.replace(regex, parameters[key]);
      });
    }

    // Execute query
    const result = await QueryExecutor.execute(connection, sqlToExecute);
    
    const executionTime = Date.now() - executionStartTime;

    // Update execution history with success
    await executionHistory.update({
      status: ExecutionStatus.SUCCESS,
      completed_at: new Date(),
      execution_time_ms: executionTime,
      rows_affected: result.rowsAffected
    });

    res.json({
      success: true,
      data: {
        rows: result.rows,
        rowsAffected: result.rowsAffected,
        executionTime: executionTime,
        fields: result.fields,
        executionHistoryId: executionHistory.id
      }
    });
  } catch (error: any) {
    const executionTime = Date.now() - executionStartTime;

    // Update execution history with failure
    if (executionHistory) {
      await executionHistory.update({
        status: ExecutionStatus.FAILED,
        completed_at: new Date(),
        execution_time_ms: executionTime,
        error_message: error.message
      });
    }

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

export const exportQueryResults = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { format = 'csv', execution_history_id } = req.body;

    if (!['csv', 'excel', 'json'].includes(format)) {
      throw new AppError('Invalid export format. Use csv, excel, or json', 400);
    }

    // Fetch query
    const query = await Query.findByPk(id);
    if (!query) {
      throw new AppError('Query not found', 404);
    }

    // Check access permission
    if (!query.is_public && query.created_by !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    let rows: any[];

    // If execution_history_id is provided, fetch results from execution history
    if (execution_history_id) {
      const execution = await ExecutionHistory.findByPk(execution_history_id);
      if (!execution) {
        throw new AppError('Execution history not found', 404);
      }

      // Verify the execution belongs to this query
      if (execution.query_id !== parseInt(id)) {
        throw new AppError('Execution does not belong to this query', 400);
      }

      // For now, re-execute the query since we don't store full results
      // In production, you'd want to store results or fetch from cache
      const connection = await Connection.findByPk(execution.connection_id);
      if (!connection) {
        throw new AppError('Connection not found', 404);
      }

      const result = await QueryExecutor.execute(connection, query.sql_content);
      rows = result.rows;
    } else {
      // Execute query without execution history (legacy support)
      const { connection_id, parameters } = req.body;
      
      if (!connection_id) {
        throw new AppError('Connection ID or execution_history_id is required', 400);
      }

      const connection = await Connection.findByPk(connection_id);
      if (!connection) {
        throw new AppError('Connection not found', 404);
      }

      let sqlToExecute = query.sql_content;
      
      // Process dynamic parameters
      sqlToExecute = QueryParameterProcessor.processParameters(sqlToExecute, {
        userId: req.user.id,
        username: req.user.username,
        userEmail: req.user.email
      });
      
      // Replace custom parameters if provided
      if (parameters) {
        Object.keys(parameters).forEach(key => {
          const regex = new RegExp(`@${key}`, 'g');
          sqlToExecute = sqlToExecute.replace(regex, parameters[key]);
        });
      }

      const result = await QueryExecutor.execute(connection, sqlToExecute);
      rows = result.rows;
    }

    // Generate export file
    let fileContent: Buffer | string;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${query.name.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.${ExportUtils.getFileExtension(format as any)}`;

    switch (format) {
      case 'csv':
        fileContent = ExportUtils.toCSV(rows);
        break;
      case 'excel':
        fileContent = await ExportUtils.toExcel(rows, query.name);
        break;
      case 'json':
        fileContent = ExportUtils.toJSON(rows);
        break;
      default:
        throw new AppError('Invalid format', 400);
    }

    // Set response headers
    res.setHeader('Content-Type', ExportUtils.getContentType(format as any));
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    res.send(fileContent);
  } catch (error) {
    next(error);
  }
};

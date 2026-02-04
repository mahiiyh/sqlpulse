import { Response, NextFunction } from 'express';
import { Query } from '../models/Query';
import { QueryVersion } from '../models/QueryVersion';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all versions for a specific query
 */
export const getQueryVersions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { queryId } = req.params;
    
    const query = await Query.findByPk(queryId);
    if (!query) {
      throw new AppError('Query not found', 404);
    }

    // Check access permission
    if (!query.is_public && query.created_by !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    const versions = await QueryVersion.findAll({
      where: { query_id: queryId },
      order: [['version_number', 'DESC']],
    });

    res.json({
      success: true,
      data: versions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific version
 */
export const getQueryVersion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { queryId, versionId } = req.params;
    
    const query = await Query.findByPk(queryId);
    if (!query) {
      throw new AppError('Query not found', 404);
    }

    // Check access permission
    if (!query.is_public && query.created_by !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    const version = await QueryVersion.findByPk(versionId);
    if (!version || version.query_id !== parseInt(queryId)) {
      throw new AppError('Version not found', 404);
    }

    res.json({
      success: true,
      data: version
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Restore a query to a specific version
 */
export const restoreQueryVersion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { queryId, versionId } = req.params;
    const { change_description } = req.body;
    
    const query = await Query.findByPk(queryId);
    if (!query) {
      throw new AppError('Query not found', 404);
    }

    // Check permission - only owner or admin can restore
    if (query.created_by !== req.user.id && req.user.role !== 'admin') {
      throw new AppError('Access denied', 403);
    }

    const version = await QueryVersion.findByPk(versionId);
    if (!version || version.query_id !== parseInt(queryId, 10)) {
      throw new AppError('Version not found', 404);
    }

    // Get current max version number
    const maxVersion = await QueryVersion.max('version_number', {
      where: { query_id: queryId }
    }) as number || 0;

    // Create new version with current content before restoring
    await QueryVersion.create({
      query_id: parseInt(queryId, 10),
      version_number: maxVersion + 1,
      sql_content: query.sql_content,
      change_description: change_description || `Restored to version ${version.version_number}`,
      created_by: req.user.id
    });

    // Update query with old version content
    await query.update({
      sql_content: version.sql_content
    });

    res.json({
      success: true,
      message: `Query restored to version ${version.version_number}`,
      data: query
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Compare two versions
 */
export const compareQueryVersions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { queryId } = req.params;
    const { version1, version2 } = req.query;
    
    if (!version1 || !version2) {
      throw new AppError('Both version1 and version2 query parameters are required', 400);
    }

    const query = await Query.findByPk(queryId);
    if (!query) {
      throw new AppError('Query not found', 404);
    }

    // Check access permission
    if (!query.is_public && query.created_by !== req.user.id) {
      throw new AppError('Access denied', 403);
    }

    const [v1, v2] = await Promise.all([
      QueryVersion.findOne({ where: { query_id: queryId, version_number: parseInt(version1 as string, 10) } }),
      QueryVersion.findOne({ where: { query_id: queryId, version_number: parseInt(version2 as string, 10) } })
    ]);

    if (!v1 || !v2) {
      throw new AppError('One or both versions not found', 404);
    }

    res.json({
      success: true,
      data: {
        version1: v1,
        version2: v2
      }
    });
  } catch (error) {
    next(error);
  }
};

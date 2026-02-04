import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import QueryTemplate from '../models/QueryTemplate';
import { AppError } from '../middleware/errorHandler';
import User from '../models/User';
import { systemTemplates } from '../data/systemTemplates';

export const getAllTemplates = async (req: AuthRequest, res: Response) => {
  const { category, search, database_type, include_system } = req.query;
  const showAll = req.query.showAll === 'true' && req.user.role === 'admin';

  const where: any = {};
  if (category) {
    where.category = category;
  }
  
  // Show only user's own templates unless admin with showAll=true
  if (!showAll) {
    where.created_by = req.user.id;
  }

  const userTemplates = await QueryTemplate.findAll({
    where,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'email'],
      },
    ],
    order: [['created_at', 'DESC']],
  });

  // Convert to plain objects and add is_system flag
  let allTemplates: any[] = userTemplates.map(t => ({
    ...t.toJSON(),
    is_system: false
  }));

  // Include system templates if requested (default: true)
  if (include_system !== 'false') {
    const systemTemplatesToAdd = systemTemplates
      .filter(st => {
        if (category && st.category !== category) return false;
        if (database_type && st.database_type !== database_type) return false;
        return true;
      })
      .map(st => ({
        ...st,
        id: `system-${st.name.toLowerCase().replace(/\s+/g, '-')}`,
        is_system: true,
        created_by: null,
        created_at: new Date(),
        updated_at: new Date()
      }));
    
    allTemplates = [...systemTemplatesToAdd, ...allTemplates];
  }

  // Apply search filter
  if (search && typeof search === 'string') {
    const searchLower = search.toLowerCase();
    allTemplates = allTemplates.filter(
      (t: any) =>
        t.name.toLowerCase().includes(searchLower) ||
        (t.description && t.description.toLowerCase().includes(searchLower)) ||
        (t.tags && t.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)))
    );
  }

  res.json({
    success: true,
    data: allTemplates,
  });
};

export const getTemplate = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const template = await QueryTemplate.findByPk(id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'email'],
      },
    ],
  });

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  // Check if user owns this template or is admin
  if (template.created_by !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('Access denied: You do not own this template', 403);
  }

  res.json({
    success: true,
    data: template,
  });
};

export const createTemplate = async (req: AuthRequest, res: Response) => {
  const { name, description, sql_template, category, tags, variables } = req.body;

  if (!name || !sql_template) {
    throw new AppError('Name and SQL template are required', 400);
  }

  const template = await QueryTemplate.create({
    name,
    description,
    sql_template,
    category: category || 'General',
    tags: tags || [],
    variables: variables || null,
    created_by: req.user!.id,
  });

  res.status(201).json({
    success: true,
    data: template,
    message: 'Template created successfully',
  });
};

export const updateTemplate = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description, sql_template, category, tags, variables } = req.body;

  const template = await QueryTemplate.findByPk(id);
  if (!template) {
    throw new AppError('Template not found', 404);
  }

  // Only creator or admin can update
  if (template.created_by !== req.user!.id && req.user!.role !== 'admin') {
    throw new AppError('Not authorized to update this template', 403);
  }

  await template.update({
    name: name !== undefined ? name : template.name,
    description: description !== undefined ? description : template.description,
    sql_template: sql_template !== undefined ? sql_template : template.sql_template,
    category: category !== undefined ? category : template.category,
    tags: tags !== undefined ? tags : template.tags,
    variables: variables !== undefined ? variables : template.variables,
  });

  res.json({
    success: true,
    data: template,
    message: 'Template updated successfully',
  });
};

export const deleteTemplate = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const template = await QueryTemplate.findByPk(id);
  if (!template) {
    throw new AppError('Template not found', 404);
  }

  // Only creator or admin can delete
  if (template.created_by !== req.user!.id && req.user!.role !== 'admin') {
    throw new AppError('Not authorized to delete this template', 403);
  }

  await template.destroy();

  res.json({
    success: true,
    message: 'Template deleted successfully',
  });
};

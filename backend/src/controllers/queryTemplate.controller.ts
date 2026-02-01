import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import QueryTemplate from '../models/QueryTemplate';
import { AppError } from '../middleware/errorHandler';
import User from '../models/User';

export const getAllTemplates = async (req: AuthRequest, res: Response) => {
  const { category, search } = req.query;

  const where: any = {};
  if (category) {
    where.category = category;
  }

  const templates = await QueryTemplate.findAll({
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

  let filteredTemplates = templates;
  if (search && typeof search === 'string') {
    const searchLower = search.toLowerCase();
    filteredTemplates = templates.filter(
      t =>
        t.name.toLowerCase().includes(searchLower) ||
        (t.description && t.description.toLowerCase().includes(searchLower)) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }

  res.json({
    success: true,
    data: filteredTemplates,
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

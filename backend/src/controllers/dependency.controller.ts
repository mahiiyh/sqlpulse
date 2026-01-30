import { Request, Response } from 'express';
import { ScheduleDependency, Schedule } from '../models';
import { logger } from '../utils/logger';

/**
 * Create a new schedule dependency
 */
export const createDependency = async (req: Request, res: Response): Promise<any> => {
  try {
    const { scheduleId } = req.params;
    const { depends_on_schedule_id, dependency_type, condition_config, is_active } = req.body;

    // Validate schedule exists
    const schedule = await Schedule.findByPk(scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Validate dependent schedule exists
    const dependentSchedule = await Schedule.findByPk(depends_on_schedule_id);
    if (!dependentSchedule) {
      return res.status(404).json({ error: 'Dependent schedule not found' });
    }

    // Prevent self-dependency (additional check beyond database constraint)
    if (scheduleId === depends_on_schedule_id.toString()) {
      return res.status(400).json({ error: 'A schedule cannot depend on itself' });
    }

    // Check for circular dependency
    const wouldCreateCircular = await checkCircularDependency(
      parseInt(scheduleId),
      depends_on_schedule_id
    );

    if (wouldCreateCircular) {
      return res.status(400).json({ 
        error: 'Creating this dependency would result in a circular dependency chain' 
      });
    }

    // Create dependency
    const dependency = await ScheduleDependency.create({
      schedule_id: parseInt(scheduleId),
      depends_on_schedule_id,
      dependency_type,
      condition_config: condition_config || null,
      is_active: is_active !== undefined ? is_active : true
    });

    logger.info(`Created dependency: Schedule ${scheduleId} depends on ${depends_on_schedule_id}`);

    res.status(201).json(dependency);
  } catch (error: any) {
    logger.error('Error creating dependency:', error);
    res.status(500).json({ error: error.message || 'Failed to create dependency' });
  }
};

/**
 * Get all dependencies for a schedule
 */
export const getDependencies = async (req: Request, res: Response): Promise<any> => {
  try {
    const { scheduleId } = req.params;

    const dependencies = await ScheduleDependency.findAll({
      where: { schedule_id: scheduleId },
      include: [
        {
          model: Schedule,
          as: 'dependsOnSchedule',
          attributes: ['id', 'schedule_name', 'cron_expression', 'is_enabled']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(dependencies);
  } catch (error: any) {
    logger.error('Error fetching dependencies:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch dependencies' });
  }
};

/**
 * Get all schedules that depend on this schedule
 */
export const getDependents = async (req: Request, res: Response): Promise<any> => {
  try {
    const { scheduleId } = req.params;

    const dependents = await ScheduleDependency.findAll({
      where: { depends_on_schedule_id: scheduleId },
      include: [
        {
          model: Schedule,
          as: 'schedule',
          attributes: ['id', 'schedule_name', 'cron_expression', 'is_enabled']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(dependents);
  } catch (error: any) {
    logger.error('Error fetching dependents:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch dependents' });
  }
};

/**
 * Update a dependency
 */
export const updateDependency = async (req: Request, res: Response): Promise<any> => {
  try {
    const { dependencyId } = req.params;
    const { dependency_type, condition_config, is_active } = req.body;

    const dependency = await ScheduleDependency.findByPk(dependencyId);
    if (!dependency) {
      return res.status(404).json({ error: 'Dependency not found' });
    }

    // Update fields
    if (dependency_type !== undefined) {
      dependency.dependency_type = dependency_type;
    }
    if (condition_config !== undefined) {
      dependency.condition_config = condition_config;
    }
    if (is_active !== undefined) {
      dependency.is_active = is_active;
    }

    await dependency.save();

    logger.info(`Updated dependency ${dependencyId}`);

    res.json(dependency);
  } catch (error: any) {
    logger.error('Error updating dependency:', error);
    res.status(500).json({ error: error.message || 'Failed to update dependency' });
  }
};

/**
 * Delete a dependency
 */
export const deleteDependency = async (req: Request, res: Response): Promise<any> => {
  try {
    const { dependencyId } = req.params;

    const dependency = await ScheduleDependency.findByPk(dependencyId);
    if (!dependency) {
      return res.status(404).json({ error: 'Dependency not found' });
    }

    await dependency.destroy();

    logger.info(`Deleted dependency ${dependencyId}`);

    res.json({ message: 'Dependency deleted successfully' });
  } catch (error: any) {
    logger.error('Error deleting dependency:', error);
    res.status(500).json({ error: error.message || 'Failed to delete dependency' });
  }
};

/**
 * Get dependency graph for a schedule
 */
export const getDependencyGraph = async (req: Request, res: Response): Promise<any> => {
  try {
    const { scheduleId } = req.params;

    const schedule = await Schedule.findByPk(scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const graph = await buildDependencyGraph(parseInt(scheduleId));

    res.json(graph);
  } catch (error: any) {
    logger.error('Error building dependency graph:', error);
    res.status(500).json({ error: error.message || 'Failed to build dependency graph' });
  }
};

/**
 * Helper: Check for circular dependencies
 */
async function checkCircularDependency(
  scheduleId: number,
  dependsOnScheduleId: number
): Promise<boolean> {
  const visited = new Set<number>();

  async function checkCircular(currentId: number, targetId: number): Promise<boolean> {
    if (currentId === targetId) {
      return true;
    }

    if (visited.has(currentId)) {
      return false;
    }

    visited.add(currentId);

    const dependencies = await ScheduleDependency.findAll({
      where: {
        schedule_id: currentId,
        is_active: true
      }
    });

    for (const dep of dependencies) {
      if (await checkCircular(dep.depends_on_schedule_id, targetId)) {
        return true;
      }
    }

    return false;
  }

  return await checkCircular(dependsOnScheduleId, scheduleId);
}

/**
 * Helper: Build dependency graph
 */
async function buildDependencyGraph(scheduleId: number): Promise<any> {
  const visited = new Set<number>();
  const nodes: any[] = [];
  const edges: any[] = [];

  async function traverse(currentId: number) {
    if (visited.has(currentId)) {
      return;
    }

    visited.add(currentId);

    // Get schedule details
    const schedule = await Schedule.findByPk(currentId, {
      attributes: ['id', 'schedule_name', 'cron_expression', 'is_enabled']
    });

    if (schedule) {
      nodes.push(schedule);
    }

    // Get dependencies
    const dependencies = await ScheduleDependency.findAll({
      where: { schedule_id: currentId, is_active: true }
    });

    for (const dep of dependencies) {
      edges.push({
        from: dep.depends_on_schedule_id,
        to: dep.schedule_id,
        type: dep.dependency_type,
        condition: dep.condition_config
      });

      await traverse(dep.depends_on_schedule_id);
    }

    // Get dependents
    const dependents = await ScheduleDependency.findAll({
      where: { depends_on_schedule_id: currentId, is_active: true }
    });

    for (const dep of dependents) {
      edges.push({
        from: dep.depends_on_schedule_id,
        to: dep.schedule_id,
        type: dep.dependency_type,
        condition: dep.condition_config
      });

      await traverse(dep.schedule_id);
    }
  }

  await traverse(scheduleId);

  return {
    nodes,
    edges,
    rootScheduleId: scheduleId
  };
}

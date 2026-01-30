import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createDependency,
  getDependencies,
  getDependents,
  updateDependency,
  deleteDependency,
  getDependencyGraph
} from '../controllers/dependency.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create a new dependency for a schedule
router.post('/schedules/:scheduleId/dependencies', createDependency);

// Get all dependencies for a schedule (what this schedule depends on)
router.get('/schedules/:scheduleId/dependencies', getDependencies);

// Get all dependents for a schedule (what schedules depend on this one)
router.get('/schedules/:scheduleId/dependents', getDependents);

// Get full dependency graph for a schedule
router.get('/schedules/:scheduleId/dependency-graph', getDependencyGraph);

// Update a dependency
router.put('/dependencies/:dependencyId', updateDependency);

// Delete a dependency
router.delete('/dependencies/:dependencyId', deleteDependency);

export default router;

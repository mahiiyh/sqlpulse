import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getQueryVersions,
  getQueryVersion,
  restoreQueryVersion,
  compareQueryVersions
} from '../controllers/queryVersion.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all versions for a query
router.get('/:queryId/versions', getQueryVersions);

// Get specific version
router.get('/:queryId/versions/:versionId', getQueryVersion);

// Restore to specific version (developers and admins only)
router.post('/:queryId/versions/:versionId/restore', authorize('admin', 'developer'), restoreQueryVersion);

// Compare two versions
router.get('/:queryId/versions/compare', compareQueryVersions);

export default router;

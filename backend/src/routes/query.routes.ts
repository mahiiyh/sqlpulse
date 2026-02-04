import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getQueries,
  getQuery,
  createQuery,
  updateQuery,
  deleteQuery,
  executeQuery,
  searchQueries,
  exportQueryResults
} from '../controllers/query.controller';

const router = Router();

router.use(authenticate);

router.get('/', getQueries);
router.get('/search', searchQueries);
router.get('/:id', getQuery);
router.post('/', authorize('admin', 'developer', 'analyst'), createQuery);
router.put('/:id', authorize('admin', 'developer', 'analyst'), updateQuery);
router.delete('/:id', authorize('admin', 'developer'), deleteQuery);
router.post('/:id/execute', authorize('admin', 'developer', 'analyst'), executeQuery);
router.post('/:id/export', authorize('admin', 'developer', 'analyst'), exportQueryResults);

export default router;

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getConnections,
  getConnection,
  createConnection,
  updateConnection,
  deleteConnection,
  testConnection
} from '../controllers/connection.controller';

const router = Router();

router.use(authenticate);

router.get('/', getConnections);
router.get('/:id', getConnection);
router.post('/', authorize('admin', 'developer'), createConnection);
router.put('/:id', authorize('admin', 'developer'), updateConnection);
router.delete('/:id', authorize('admin'), deleteConnection);
router.post('/:id/test', testConnection);

export default router;

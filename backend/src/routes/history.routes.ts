import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getExecutionHistory,
  getExecutionDetail,
  getQueryHistory,
  getExecutionStats
} from '../controllers/history.controller';

const router = Router();

router.use(authenticate);

router.get('/', getExecutionHistory);
router.get('/stats', getExecutionStats);
router.get('/:id', getExecutionDetail);
router.get('/query/:id', getQueryHistory);

export default router;

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getExecutionHistory,
  getExecutionById,
  getExecutionResults
} from '../controllers/execution.controller';

const router = Router();

router.use(authenticate);

router.get('/', getExecutionHistory);
router.get('/:id', getExecutionById);
router.get('/:id/results', getExecutionResults);

export default router;

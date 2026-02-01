import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAllTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../controllers/queryTemplate.controller';

const router = Router();

router.use(authenticate);

router.get('/', getAllTemplates);
router.get('/:id', getTemplate);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

export default router;

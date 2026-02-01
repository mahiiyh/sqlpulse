import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/admin.controller';

const router = Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;

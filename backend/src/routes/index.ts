import { Router } from 'express';
import authRoutes from './auth.routes';
import connectionRoutes from './connection.routes';
import queryRoutes from './query.routes';
import scheduleRoutes from './schedule.routes';
import executionRoutes from './execution.routes';
import historyRoutes from './history.routes';
import dependencyRoutes from './dependency.routes';
import queueRoutes from './queue.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/connections', connectionRoutes);
router.use('/queries', queryRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/executions', executionRoutes);
router.use('/history', historyRoutes);
router.use('/queue', queueRoutes);
router.use(dependencyRoutes);

export default router;

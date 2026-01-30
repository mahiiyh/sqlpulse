import { Router } from 'express';
import authRoutes from './auth.routes';
import connectionRoutes from './connection.routes';
import queryRoutes from './query.routes';
import scheduleRoutes from './schedule.routes';
import executionRoutes from './execution.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/connections', connectionRoutes);
router.use('/queries', queryRoutes);
router.use('/schedules', scheduleRoutes);
router.use('/executions', executionRoutes);

export default router;

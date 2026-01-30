import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  enableSchedule,
  disableSchedule,
  runScheduleNow,
  getScheduleHistory,
  getUpcomingSchedules
} from '../controllers/schedule.controller';

const router = Router();

router.use(authenticate);

router.get('/', getSchedules);
router.get('/upcoming', getUpcomingSchedules);
router.get('/:id', getSchedule);
router.post('/', authorize('admin', 'developer', 'scheduler'), createSchedule);
router.put('/:id', authorize('admin', 'developer', 'scheduler'), updateSchedule);
router.delete('/:id', authorize('admin', 'scheduler'), deleteSchedule);
router.post('/:id/enable', authorize('admin', 'scheduler'), enableSchedule);
router.post('/:id/disable', authorize('admin', 'scheduler'), disableSchedule);
router.post('/:id/run-now', authorize('admin', 'developer', 'scheduler'), runScheduleNow);
router.get('/:id/history', getScheduleHistory);

export default router;

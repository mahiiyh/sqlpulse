import { Router } from 'express';
import { Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { AuthRequest } from '../middleware/auth';
import { queueService } from '../services/queueService';

const router = Router();

// Get queue statistics
router.get('/stats', authenticate, authorize('admin', 'developer'), async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await queueService.getQueueStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// Get active jobs
router.get('/active', authenticate, authorize('admin', 'developer'), async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const jobs = await queueService.getActiveJobs();
    const jobsData = jobs.map(job => ({
      id: job.id,
      data: job.data,
      progress: job.progress(),
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp
    }));
    
    res.json({
      success: true,
      data: jobsData
    });
  } catch (error) {
    next(error);
  }
});

// Get failed jobs
router.get('/failed', authenticate, authorize('admin', 'developer'), async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const start = parseInt(req.query.start as string, 10) || 0;
    const end = parseInt(req.query.end as string, 10) || 10;
    
    const jobs = await queueService.getFailedJobs(start, end);
    const jobsData = jobs.map(job => ({
      id: job.id,
      data: job.data,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      timestamp: job.timestamp
    }));
    
    res.json({
      success: true,
      data: jobsData
    });
  } catch (error) {
    next(error);
  }
});

// Get specific job details
router.get('/job/:jobId', authenticate, authorize('admin', 'developer', 'viewer'), async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await queueService.getJob(req.params.jobId);
    
    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
      return;
    }
    
    res.json({
      success: true,
      data: {
        id: job.id,
        data: job.data,
        progress: job.progress(),
        attemptsMade: job.attemptsMade,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        timestamp: job.timestamp,
        returnvalue: job.returnvalue,
        failedReason: job.failedReason
      }
    });
  } catch (error) {
    next(error);
  }
});

// Health check
router.get('/health', async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const isHealthy = await queueService.healthCheck();
    res.json({
      success: true,
      data: {
        healthy: isHealthy,
        timestamp: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;

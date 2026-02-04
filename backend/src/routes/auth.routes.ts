import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, me } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: 'Too many accounts created from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', authLimiter, login);
router.post('/register', registerLimiter, register);
router.get('/me', authenticate, me);

export default router;

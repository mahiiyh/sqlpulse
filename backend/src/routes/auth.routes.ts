import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, me } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Rate limiting for authentication endpoints
// More lenient limits with skipSuccessfulRequests to avoid blocking legitimate users
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes default
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS || '15', 10), // 15 failed attempts per window
  message: 'Too many failed authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed login attempts
});

const registerLimiter = rateLimit({
  windowMs: parseInt(process.env.REGISTER_RATE_LIMIT_WINDOW_MS || '3600000', 10), // 1 hour default
  max: parseInt(process.env.REGISTER_RATE_LIMIT_MAX_ACCOUNTS || '5', 10), // 5 registrations per hour per IP
  message: 'Too many accounts created from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', authLimiter, login);
router.post('/register', registerLimiter, register);
router.get('/me', authenticate, me);

export default router;

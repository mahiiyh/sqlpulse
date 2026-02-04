import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { User, UserRole } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).alphanum().required()
    .messages({
      'string.alphanum': 'Username must contain only letters and numbers',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must not exceed 30 characters'
    }),
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  password: Joi.string().min(8).max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'string.min': 'Password must be at least 8 characters'
    }),
  timezone: Joi.string().default('UTC'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { username, email, password, timezone } = value;

    // Check if user exists
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Hash password with higher cost factor
    const password_hash = await bcrypt.hash(password, 12);

    // Create user - always default to READ_ONLY for security
    const user = await User.create({
      username,
      email,
      password_hash,
      role: UserRole.READ_ONLY, // Never allow user to set their own role
      timezone: timezone || 'UTC',
      failed_login_attempts: 0,
      locked_until: null
    });

    // Generate token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT_SECRET not configured', 500);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          timezone: user.timezone
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { email, password } = value;

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user || !user.is_active) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if account is locked
    if (user.locked_until && user.locked_until > new Date()) {
      const minutesLeft = Math.ceil((user.locked_until.getTime() - Date.now()) / 60000);
      throw new AppError(`Account temporarily locked. Please try again in ${minutesLeft} minutes`, 423);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      // Increment failed attempts
      user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
      
      if (user.failed_login_attempts >= 5) {
        user.locked_until = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        await user.save();
        throw new AppError('Account locked due to multiple failed login attempts. Please try again in 30 minutes', 423);
      }
      
      await user.save();
      throw new AppError('Invalid credentials', 401);
    }

    // Reset failed attempts on successful login
    user.failed_login_attempts = 0;
    user.locked_until = null;

    // Update last login
    user.last_login_at = new Date();
    await user.save();

    // Generate token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT_SECRET not configured', 500);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          timezone: user.timezone
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        timezone: user.timezone,
        is_active: user.is_active,
        last_login_at: user.last_login_at
      }
    });
  } catch (error) {
    next(error);
  }
};

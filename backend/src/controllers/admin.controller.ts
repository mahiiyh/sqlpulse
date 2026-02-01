import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new user (admin only)
 */
export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'analyst',
      is_active: true
    } as any);

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user (admin only)
 */
export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role, is_active, password } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Prepare update data
    const updateData: any = {};
    if (role) updateData.role = role;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (admin only)
 */
export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (parseInt(id) === req.user.id) {
      throw new AppError('You cannot delete your own account', 400);
    }

    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

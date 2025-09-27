import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import { authenticate, optionalAuth } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, AuthenticatedRequest } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, monthlyBudgetGoal } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      throw new AppError('Please provide all required fields', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        monthlyBudgetGoal: monthlyBudgetGoal || 3500
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        monthlyBudgetGoal: true,
        preferences: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = (jwt.sign as any)(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const response: ApiResponse = {
      success: true,
      data: {
        user,
        token
      },
      message: 'User registered successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = (jwt.sign as any)(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    const response: ApiResponse = {
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login successful'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/profile', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const response: ApiResponse = {
      success: true,
      data: req.user,
      message: 'Profile retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/profile', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { firstName, lastName, email, monthlyBudgetGoal, preferences } = req.body;
    const userId = req.user!.id;

    // Check if email is being changed and if it already exists
    if (email && email !== req.user!.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        throw new AppError('Email already exists', 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(monthlyBudgetGoal !== undefined && { monthlyBudgetGoal }),
        ...(preferences && { preferences })
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        monthlyBudgetGoal: true,
        preferences: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Change password
router.put('/change-password', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!currentPassword || !newPassword) {
      throw new AppError('Please provide current and new password', 400);
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Setup 2FA
router.post('/2fa/setup', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `MoneyLens (${req.user!.email})`,
      issuer: 'MoneyLens',
      length: 32
    });

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

    // Store secret temporarily (user needs to verify before enabling)
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 }
    });

    const response: ApiResponse = {
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntryKey: secret.base32
      },
      message: '2FA setup initiated. Please verify with authenticator app.'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Verify 2FA setup
router.post('/2fa/verify-setup', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { token } = req.body;
    const userId = req.user!.id;

    if (!token) {
      throw new AppError('Please provide verification token', 400);
    }

    // Get user with secret
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true }
    });

    if (!user?.twoFactorSecret) {
      throw new AppError('2FA setup not initiated', 400);
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      throw new AppError('Invalid verification token', 400);
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true }
    });

    const response: ApiResponse = {
      success: true,
      message: '2FA enabled successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Disable 2FA
router.post('/2fa/disable', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { token } = req.body;
    const userId = req.user!.id;

    if (!token) {
      throw new AppError('Please provide verification token', 400);
    }

    // Get user with secret
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true }
    });

    if (!user?.twoFactorEnabled) {
      throw new AppError('2FA is not enabled', 400);
    }

    if (!user.twoFactorSecret) {
      throw new AppError('2FA secret not found', 400);
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      throw new AppError('Invalid verification token', 400);
    }

    // Disable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: { 
        twoFactorEnabled: false,
        twoFactorSecret: null
      }
    });

    const response: ApiResponse = {
      success: true,
      message: '2FA disabled successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Get 2FA status
router.get('/2fa/status', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorEnabled: true }
    });

    const response: ApiResponse = {
      success: true,
      data: {
        enabled: user?.twoFactorEnabled || false
      }
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Logout (client-side token removal)
router.post('/logout', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const response: ApiResponse = {
      success: true,
      message: 'Logout successful'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;

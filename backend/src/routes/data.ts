import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, AuthenticatedRequest } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Export all user data
router.get('/export', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Get all user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        monthlyBudgetGoal: true,
        preferences: true,
        twoFactorEnabled: true,
        createdAt: true,
        updatedAt: true,
        transactions: {
          select: {
            id: true,
            merchant: true,
            amount: true,
            category: true,
            description: true,
            location: true,
            latitude: true,
            longitude: true,
            date: true,
            status: true,
            isSimulated: true,
            createdAt: true,
            updatedAt: true
          }
        },
        spendingCaps: {
          select: {
            id: true,
            type: true,
            name: true,
            limit: true,
            period: true,
            enabled: true,
            category: true,
            merchant: true,
            createdAt: true,
            updatedAt: true
          }
        },
        notifications: {
          select: {
            id: true,
            type: true,
            title: true,
            message: true,
            read: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Create export data structure
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: {
        profile: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          monthlyBudgetGoal: user.monthlyBudgetGoal,
          preferences: user.preferences,
          twoFactorEnabled: user.twoFactorEnabled,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        transactions: user.transactions,
        spendingCaps: user.spendingCaps,
        notifications: user.notifications
      }
    };

    const response: ApiResponse = {
      success: true,
      data: exportData,
      message: 'Data exported successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Import user data
router.post('/import', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { importData } = req.body;

    if (!importData) {
      throw new AppError('Import data is required', 400);
    }

    // Validate import data structure
    if (!importData.version || !importData.user) {
      throw new AppError('Invalid import data format', 400);
    }

    const { user: importUser } = importData;

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update user profile (excluding sensitive fields)
      if (importUser.profile) {
        await tx.user.update({
          where: { id: userId },
          data: {
            firstName: importUser.profile.firstName || req.user!.firstName,
            lastName: importUser.profile.lastName || req.user!.lastName,
            monthlyBudgetGoal: importUser.profile.monthlyBudgetGoal || req.user!.monthlyBudgetGoal,
            preferences: importUser.profile.preferences || req.user!.preferences
          }
        });
      }

      // Import transactions
      if (importUser.transactions && Array.isArray(importUser.transactions)) {
        // Delete existing transactions
        await tx.transaction.deleteMany({
          where: { userId }
        });

        // Create new transactions
        for (const transaction of importUser.transactions) {
          await tx.transaction.create({
            data: {
              userId,
              merchant: transaction.merchant,
              amount: transaction.amount,
              category: transaction.category,
              description: transaction.description,
              location: transaction.location,
              latitude: transaction.latitude,
              longitude: transaction.longitude,
              date: transaction.date ? new Date(transaction.date) : new Date(),
              status: transaction.status || 'COMPLETED',
              isSimulated: transaction.isSimulated || false
            }
          });
        }
      }

      // Import spending caps
      if (importUser.spendingCaps && Array.isArray(importUser.spendingCaps)) {
        // Delete existing spending caps
        await tx.spendingCap.deleteMany({
          where: { userId }
        });

        // Create new spending caps
        for (const cap of importUser.spendingCaps) {
          await tx.spendingCap.create({
            data: {
              userId,
              type: cap.type,
              name: cap.name,
              limit: cap.limit,
              period: cap.period,
              enabled: cap.enabled !== undefined ? cap.enabled : true,
              category: cap.category,
              merchant: cap.merchant
            }
          });
        }
      }

      // Import notifications
      if (importUser.notifications && Array.isArray(importUser.notifications)) {
        // Delete existing notifications
        await tx.notification.deleteMany({
          where: { userId }
        });

        // Create new notifications
        for (const notification of importUser.notifications) {
          await tx.notification.create({
            data: {
              userId,
              type: notification.type,
              title: notification.title,
              message: notification.message,
              read: notification.read || false
            }
          });
        }
      }

      return { success: true };
    });

    const response: ApiResponse = {
      success: true,
      message: 'Data imported successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Delete all user data
router.delete('/delete-all', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // Start transaction to delete all user data
    await prisma.$transaction(async (tx) => {
      // Delete in correct order (respecting foreign key constraints)
      await tx.notification.deleteMany({
        where: { userId }
      });

      await tx.transaction.deleteMany({
        where: { userId }
      });

      await tx.spendingCap.deleteMany({
        where: { userId }
      });

      await tx.session.deleteMany({
        where: { userId }
      });

      // Reset user data (keep account but clear data)
      await tx.user.update({
        where: { id: userId },
        data: {
          monthlyBudgetGoal: 3500,
          preferences: '{}',
          twoFactorEnabled: false,
          twoFactorSecret: null
        }
      });
    });

    const response: ApiResponse = {
      success: true,
      message: 'All data deleted successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Get data statistics
router.get('/stats', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const [transactionCount, capCount, notificationCount] = await Promise.all([
      prisma.transaction.count({ where: { userId } }),
      prisma.spendingCap.count({ where: { userId } }),
      prisma.notification.count({ where: { userId } })
    ]);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        monthlyBudgetGoal: true
      }
    });

    const accountAge = user ? Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    const stats = {
      totalTransactions: transactionCount,
      activeCaps: capCount,
      totalNotifications: notificationCount,
      accountAgeDays: accountAge,
      monthlyBudgetGoal: user?.monthlyBudgetGoal || 3500
    };

    const response: ApiResponse = {
      success: true,
      data: stats
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;

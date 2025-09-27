import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, AuthenticatedRequest } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Get leaderboard data (simplified version without friends for now)
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { period = '30', type = 'savings' } = req.query;

    const days = Number(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // For now, just show the current user's data
    // In a real implementation, you'd fetch friends and compare
    const [user, totalSpent] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          monthlyBudgetGoal: true
        }
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          date: { gte: startDate },
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      })
    ]);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const spent = Number(totalSpent._sum.amount || 0);
    const budget = Number(user.monthlyBudgetGoal || 3500);
    const savings = Math.max(budget - spent, 0);
    const savingsPercentage = budget > 0 ? (savings / budget) * 100 : 0;

    const leaderboardData = [{
      userId: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      budget,
      spent,
      savings,
      savingsPercentage,
      remaining: Math.max(budget - spent, 0)
    }];

    const response: ApiResponse = {
      success: true,
      data: {
        leaderboard: leaderboardData,
        period: days,
        type,
        totalFriends: 0,
        message: 'Add friends to see the full leaderboard!'
      },
      message: 'Leaderboard data retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Placeholder endpoints for future friend functionality
router.post('/friends/request', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const response: ApiResponse = {
      success: false,
      data: null,
      message: 'Friend system coming soon! Database migration needed.'
    };
    res.status(501).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/friends/requests', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const response: ApiResponse = {
      success: true,
      data: [],
      message: 'No friend requests yet'
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.put('/friends/requests/:requestId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const response: ApiResponse = {
      success: false,
      data: null,
      message: 'Friend system coming soon!'
    };
    res.status(501).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/friends', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const response: ApiResponse = {
      success: true,
      data: [],
      message: 'No friends yet'
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.delete('/friends/:friendId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const response: ApiResponse = {
      success: false,
      data: null,
      message: 'Friend system coming soon!'
    };
    res.status(501).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
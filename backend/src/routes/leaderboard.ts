import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, AuthenticatedRequest } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Get leaderboard data with fake users for demo
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { period = '30', type = 'savings' } = req.query;

    const days = Number(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all users for leaderboard (including fake users)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        monthlyBudgetGoal: true
      }
    });

    // Calculate spending for each user
    const leaderboardData = await Promise.all(
      users.map(async (user) => {
        const totalSpent = await prisma.transaction.aggregate({
          where: {
            userId: user.id,
            date: { gte: startDate },
            status: 'COMPLETED'
          },
          _sum: { amount: true }
        });

        const spent = Number(totalSpent._sum.amount || 0);
        const budget = Number(user.monthlyBudgetGoal || 3500);
        const savings = Math.max(budget - spent, 0);
        const savingsPercentage = budget > 0 ? (savings / budget) * 100 : 0;

        return {
          userId: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          budget,
          spent,
          savings,
          savingsPercentage,
          remaining: Math.max(budget - spent, 0),
          isCurrentUser: user.id === userId
        };
      })
    );

    // Sort by savings percentage (descending) for privacy
    leaderboardData.sort((a, b) => b.savingsPercentage - a.savingsPercentage);

    // Add rank to each entry
    const rankedLeaderboard = leaderboardData.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    const response: ApiResponse = {
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        period: days,
        type,
        totalFriends: users.length - 1, // All users except current user
        message: 'Leaderboard with demo users!'
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
    const userId = req.user!.id;
    
    // Get all other users as "friends" for demo
    const friends = await prisma.user.findMany({
      where: {
        id: { not: userId }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        monthlyBudgetGoal: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: friends.map(friend => ({
        id: friend.id,
        name: `${friend.firstName} ${friend.lastName}`,
        email: friend.email,
        budget: friend.monthlyBudgetGoal
      })),
      message: 'Friends retrieved successfully'
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
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, AuthenticatedRequest, CreateSpendingCapRequest, UpdateSpendingCapRequest } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Get merchants for spending caps
router.get('/merchants', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { period = '90' } = req.query; // Default to 90 days

    const days = Number(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get merchants from user's transaction history
    const merchantData = await prisma.transaction.groupBy({
      by: ['merchant'],
      where: {
        userId,
        date: { gte: startDate },
        status: 'COMPLETED'
      },
      _sum: { amount: true },
      _count: { merchant: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 50 // Limit to top 50 merchants
    });

    const merchants = merchantData.map((item: any) => ({
      name: item.merchant,
      totalSpent: Number(item._sum.amount || 0),
      transactionCount: item._count.merchant,
      averageSpent: Number(item._sum.amount || 0) / item._count.merchant
    }));

    const response: ApiResponse = {
      success: true,
      data: merchants,
      message: 'Merchants retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Get all spending caps for user
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const caps = await prisma.spendingCap.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate current spending for each cap
    const capsWithSpending = await Promise.all(
      caps.map(async (cap: any) => {
        const now = new Date();
        let periodStart = new Date();

        // Calculate period start based on cap period
        switch (cap.period) {
          case 'DAILY':
            periodStart.setHours(0, 0, 0, 0);
            break;
          case 'WEEKLY':
            periodStart.setDate(now.getDate() - now.getDay());
            periodStart.setHours(0, 0, 0, 0);
            break;
          case 'MONTHLY':
            periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'YEARLY':
            periodStart = new Date(now.getFullYear(), 0, 1);
            break;
        }

        // Build where clause for spending calculation
        const where: any = {
          userId,
          date: { gte: periodStart }
        };

        if (cap.type === 'CATEGORY' && cap.category) {
          where.category = cap.category;
        } else if (cap.type === 'MERCHANT' && cap.merchant) {
          where.merchant = cap.merchant;
        }

        const spending = await prisma.transaction.aggregate({
          where,
          _sum: { amount: true }
        });

        const spent = Number(spending._sum.amount || 0);
        const percentage = (spent / Number(cap.limit)) * 100;

        return {
          ...cap,
          spent,
          percentage: Math.min(percentage, 100),
          remaining: Math.max(Number(cap.limit) - spent, 0),
          status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'safe'
        };
      })
    );

    const response: ApiResponse = {
      success: true,
      data: capsWithSpending,
      message: 'Spending caps retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Get single spending cap
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const cap = await prisma.spendingCap.findFirst({
      where: { id, userId }
    });

    if (!cap) {
      throw new AppError('Spending cap not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: cap,
      message: 'Spending cap retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Create new spending cap
router.post('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const capData: CreateSpendingCapRequest = req.body;

    // Validate required fields
    if (!capData.type || !capData.name || !capData.limit || !capData.period) {
      throw new AppError('Please provide type, name, limit, and period', 400);
    }

    // Validate type-specific fields
    if (capData.type === 'CATEGORY' && !capData.category) {
      throw new AppError('Category is required for category-type caps', 400);
    }
    if (capData.type === 'MERCHANT' && !capData.merchant) {
      throw new AppError('Merchant is required for merchant-type caps', 400);
    }

    // Check for duplicate caps
    const existingCap = await prisma.spendingCap.findFirst({
      where: {
        userId,
        type: capData.type,
        ...(capData.type === 'CATEGORY' && { category: capData.category }),
        ...(capData.type === 'MERCHANT' && { merchant: capData.merchant })
      }
    });

    if (existingCap) {
      throw new AppError('A spending cap already exists for this type and target', 400);
    }

    // Create spending cap
    const cap = await prisma.spendingCap.create({
      data: {
        userId,
        type: capData.type,
        name: capData.name,
        limit: capData.limit,
        period: capData.period,
        category: capData.category,
        merchant: capData.merchant
      }
    });

    const response: ApiResponse = {
      success: true,
      data: cap,
      message: 'Spending cap created successfully'
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
});

// Update spending cap
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const updateData: UpdateSpendingCapRequest = req.body;

    // Check if cap exists and belongs to user
    const existingCap = await prisma.spendingCap.findFirst({
      where: { id, userId }
    });

    if (!existingCap) {
      throw new AppError('Spending cap not found', 404);
    }

    // Update spending cap
    const cap = await prisma.spendingCap.update({
      where: { id },
      data: updateData
    });

    const response: ApiResponse = {
      success: true,
      data: cap,
      message: 'Spending cap updated successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Toggle spending cap enabled/disabled
router.patch('/:id/toggle', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if cap exists and belongs to user
    const existingCap = await prisma.spendingCap.findFirst({
      where: { id, userId }
    });

    if (!existingCap) {
      throw new AppError('Spending cap not found', 404);
    }

    // Toggle enabled status
    const cap = await prisma.spendingCap.update({
      where: { id },
      data: { enabled: !existingCap.enabled }
    });

    const response: ApiResponse = {
      success: true,
      data: cap,
      message: `Spending cap ${cap.enabled ? 'enabled' : 'disabled'} successfully`
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Delete spending cap
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if cap exists and belongs to user
    const existingCap = await prisma.spendingCap.findFirst({
      where: { id, userId }
    });

    if (!existingCap) {
      throw new AppError('Spending cap not found', 404);
    }

    // Delete spending cap
    await prisma.spendingCap.delete({
      where: { id }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Spending cap deleted successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;

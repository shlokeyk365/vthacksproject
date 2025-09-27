import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, AuthenticatedRequest, DashboardStats, SpendingTrendData, CategoryBreakdown, MerchantAnalysis } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard stats
router.get('/dashboard', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { period = '30' } = req.query;

    const days = Number(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get current month data
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Parallel queries for dashboard data
    const [
      totalSpent,
      monthlyBudget,
      activeCaps,
      recentTransactions,
      spendingTrend,
      topCategory
    ] = await Promise.all([
      // Total spent in period
      prisma.transaction.aggregate({
        where: {
          userId,
          date: { gte: startDate },
          status: 'COMPLETED'
        },
        _sum: { amount: true }
      }),

      // Monthly budget
      prisma.user.findUnique({
        where: { id: userId },
        select: { monthlyBudgetGoal: true }
      }),

      // Active caps count
      prisma.spendingCap.count({
        where: { userId, enabled: true }
      }),

      // Recent transactions
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 5,
        select: {
          id: true,
          merchant: true,
          amount: true,
          category: true,
          date: true,
          status: true
        }
      }),

      // Spending trend (last 30 days)
      prisma.transaction.groupBy({
        by: ['date'],
        where: {
          userId,
          date: { gte: startDate },
          status: 'COMPLETED'
        },
        _sum: { amount: true },
        orderBy: { date: 'asc' }
      }),

      // Top category
      prisma.transaction.groupBy({
        by: ['category'],
        where: {
          userId,
          date: { gte: startDate },
          status: 'COMPLETED'
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: 'desc' } },
        take: 1
      })
    ]);

    const spent = Number(totalSpent._sum.amount || 0);
    const budget = Number(monthlyBudget?.monthlyBudgetGoal || 3500);
    const remaining = Math.max(budget - spent, 0);

    // Format spending trend data
    const trendData: SpendingTrendData[] = spendingTrend.map(item => ({
      date: item.date.toISOString().split('T')[0],
      amount: Number(item._sum.amount || 0)
    }));

    const dashboardStats: DashboardStats = {
      totalSpent: spent,
      monthlyBudget: budget,
      budgetRemaining: remaining,
      activeCaps,
      lockedCards: 0, // This would be calculated based on locked cards feature
      topCategory: topCategory[0]?.category || 'None',
      recentTransactions: recentTransactions as any,
      spendingTrend: trendData
    };

    const response: ApiResponse = {
      success: true,
      data: dashboardStats,
      message: 'Dashboard stats retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Get spending trends
router.get('/spending-trends', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { period = '6', groupBy = 'month' } = req.query;

    const months = Number(period);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    let groupByClause: any = {};
    if (groupBy === 'month') {
      groupByClause = {
        year: { year: new Date().getFullYear() },
        month: { month: new Date().getMonth() + 1 }
      };
    } else if (groupBy === 'week') {
      // Calculate week number manually
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const weekNumber = Math.ceil((now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));
      groupByClause = { week: { week: weekNumber } };
    }

    const trends = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId,
        date: { gte: startDate },
        status: 'COMPLETED'
      },
      _sum: { amount: true },
      orderBy: { category: 'asc' }
    });

    const response: ApiResponse = {
      success: true,
      data: trends.map((trend: any) => ({
        category: trend.category,
        amount: Number(trend._sum.amount || 0)
      })),
      message: 'Spending trends retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Get category breakdown
router.get('/category-breakdown', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { period = '30' } = req.query;

    const days = Number(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const categoryData = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        userId,
        date: { gte: startDate },
        status: 'COMPLETED'
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } }
    });

    const total = categoryData.reduce((sum: number, item: any) => sum + Number(item._sum.amount || 0), 0);

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

    const breakdown: CategoryBreakdown[] = categoryData.map((item: any, index: number) => ({
      category: item.category,
      amount: Number(item._sum.amount || 0),
      percentage: total > 0 ? (Number(item._sum.amount || 0) / total) * 100 : 0,
      color: colors[index % colors.length]
    }));

    const response: ApiResponse = {
      success: true,
      data: breakdown,
      message: 'Category breakdown retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Get merchant analysis
router.get('/merchant-analysis', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { period = '30', limit = '10' } = req.query;

    const days = Number(period);
    const limitNum = Number(limit);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

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
      take: limitNum
    });

    const analysis: MerchantAnalysis[] = merchantData.map((item: any) => ({
      name: item.merchant,
      amount: Number(item._sum.amount || 0),
      visits: item._count.merchant,
      averageSpent: Number(item._sum.amount || 0) / item._count.merchant
    }));

    const response: ApiResponse = {
      success: true,
      data: analysis,
      message: 'Merchant analysis retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Get AI insights (placeholder for future AI integration)
router.get('/insights', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;

    // This is a placeholder - in production, you'd integrate with an AI service
    const insights = [
      {
        type: 'spending_pattern',
        title: 'High Dining Spending',
        message: 'Your dining expenses have increased 15% compared to last month. Consider setting a stricter cap to maintain your budget goals.',
        severity: 'warning',
        actionable: true
      },
      {
        type: 'savings_opportunity',
        title: 'Transportation Under Budget',
        message: 'You\'re consistently under budget on transportation. You could reallocate $50/month to your savings goal.',
        severity: 'info',
        actionable: true
      },
      {
        type: 'seasonal_trend',
        title: 'Shopping Increase Expected',
        message: 'Shopping expenses typically increase 20% in December. Consider adjusting your caps accordingly.',
        severity: 'info',
        actionable: true
      }
    ];

    const response: ApiResponse = {
      success: true,
      data: insights,
      message: 'Insights retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;

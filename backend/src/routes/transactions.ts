import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, AuthenticatedRequest, CreateTransactionRequest, UpdateTransactionRequest, TransactionFilters, PaginationParams } from '../types';

const router = express.Router();
const prisma = new PrismaClient();

// Get all transactions for user
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const {
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc',
      category,
      merchant,
      minAmount,
      maxAmount,
      startDate,
      endDate,
      status
    } = req.query as TransactionFilters & PaginationParams;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const where: any = {
      userId
    };

    if (category) where.category = category;
    if (merchant) where.merchant = { contains: merchant, mode: 'insensitive' };
    if (minAmount) where.amount = { ...where.amount, gte: Number(minAmount) };
    if (maxAmount) where.amount = { ...where.amount, lte: Number(maxAmount) };
    if (status) where.status = status;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    // Get transactions
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
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
          createdAt: true
        }
      }),
      prisma.transaction.count({ where })
    ]);

    const totalPages = Math.ceil(total / Number(limit));

    const response: ApiResponse = {
      success: true,
      data: {
        transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      },
      message: 'Transactions retrieved successfully'
    };

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
});

// Get single transaction
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    const response: ApiResponse = {
      success: true,
      data: transaction,
      message: 'Transaction retrieved successfully'
    };

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
});

// Create new transaction
router.post('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const transactionData: CreateTransactionRequest = req.body;

    // Validate required fields
    if (!transactionData.merchant || !transactionData.amount || !transactionData.category) {
      throw new AppError('Please provide merchant, amount, and category', 400);
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        merchant: transactionData.merchant,
        amount: transactionData.amount,
        category: transactionData.category,
        description: transactionData.description,
        location: transactionData.location,
        latitude: transactionData.latitude,
        longitude: transactionData.longitude,
        isSimulated: transactionData.isSimulated || false
      }
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user-${userId}`).emit('transaction-update', transaction);

    const response: ApiResponse = {
      success: true,
      data: transaction,
      message: 'Transaction created successfully'
    };

    return res.status(201).json(response);
  } catch (error) {
    return next(error);
  }
});

// Simulate transaction
router.post('/simulate', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const transactionData: CreateTransactionRequest = req.body;

    // Validate required fields
    if (!transactionData.merchant || !transactionData.amount || !transactionData.category) {
      throw new AppError('Please provide merchant, amount, and category', 400);
    }

    // Get user's budget and preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { monthlyBudgetGoal: true, preferences: true }
    });

    // Get all enabled spending caps
    const caps = await prisma.spendingCap.findMany({
      where: {
        userId,
        enabled: true
      }
    });

    const now = new Date();
    const violations = [];
    const warnings = [];
    let totalCurrentSpending = 0;

    // Check monthly budget first
    if (user?.monthlyBudgetGoal) {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlySpending = await prisma.transaction.aggregate({
        where: {
          userId,
          date: { gte: startOfMonth },
          isSimulated: false // Don't include simulated transactions
        },
        _sum: { amount: true }
      });

      const currentMonthlySpent = Number(monthlySpending._sum.amount || 0);
      const wouldSpendMonthly = currentMonthlySpent + Number(transactionData.amount);
      const monthlyBudget = user.monthlyBudgetGoal;

      if (wouldSpendMonthly > monthlyBudget) {
        violations.push({
          type: 'MONTHLY_BUDGET',
          name: 'Monthly Budget',
          limit: monthlyBudget,
          current: currentMonthlySpent,
          wouldExceed: wouldSpendMonthly - monthlyBudget,
          percentage: (wouldSpendMonthly / monthlyBudget) * 100
        });
      } else if (wouldSpendMonthly > monthlyBudget * 0.9) {
        warnings.push({
          type: 'MONTHLY_BUDGET_WARNING',
          name: 'Monthly Budget Warning',
          limit: monthlyBudget,
          current: currentMonthlySpent,
          wouldSpend: wouldSpendMonthly,
          percentage: (wouldSpendMonthly / monthlyBudget) * 100
        });
      }
    }

    // Check each spending cap
    for (const cap of caps) {
      let periodStart: Date;
      
      switch (cap.period) {
        case 'DAILY':
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'WEEKLY':
          const dayOfWeek = now.getDay();
          periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
          break;
        case 'MONTHLY':
          periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'YEARLY':
          periodStart = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          continue;
      }

      // Build where clause for this cap
      const whereClause: any = {
        userId,
        date: { gte: periodStart },
        isSimulated: false
      };

      if (cap.type === 'CATEGORY' && cap.category) {
        whereClause.category = cap.category;
      } else if (cap.type === 'MERCHANT' && cap.merchant) {
        whereClause.merchant = cap.merchant;
      }

      // Check if this cap applies to the transaction
      let appliesToTransaction = false;
      if (cap.type === 'GLOBAL') {
        appliesToTransaction = true;
      } else if (cap.type === 'CATEGORY' && cap.category === transactionData.category) {
        appliesToTransaction = true;
      } else if (cap.type === 'MERCHANT' && cap.merchant === transactionData.merchant) {
        appliesToTransaction = true;
      }

      if (appliesToTransaction) {
        const currentSpending = await prisma.transaction.aggregate({
          where: whereClause,
          _sum: { amount: true }
        });

        const currentSpent = Number(currentSpending._sum.amount || 0);
        const wouldSpend = currentSpent + Number(transactionData.amount);

        if (wouldSpend > cap.limit) {
          violations.push({
            type: 'SPENDING_CAP',
            name: cap.name,
            capType: cap.type,
            period: cap.period,
            limit: cap.limit,
            current: currentSpent,
            wouldExceed: wouldSpend - cap.limit,
            percentage: (wouldSpend / cap.limit) * 100
          });
        } else if (wouldSpend > cap.limit * 0.8) {
          warnings.push({
            type: 'SPENDING_CAP_WARNING',
            name: cap.name,
            capType: cap.type,
            period: cap.period,
            limit: cap.limit,
            current: currentSpent,
            wouldSpend: wouldSpend,
            percentage: (wouldSpend / cap.limit) * 100
          });
        }
      }
    }

    // Calculate total current spending for context
    const totalSpending = await prisma.transaction.aggregate({
      where: {
        userId,
        isSimulated: false
      },
      _sum: { amount: true }
    });

    totalCurrentSpending = Number(totalSpending._sum.amount || 0);

    const response: ApiResponse = {
      success: true,
      data: {
        wouldBeApproved: violations.length === 0,
        transaction: {
          merchant: transactionData.merchant,
          amount: transactionData.amount,
          category: transactionData.category
        },
        violations,
        warnings,
        currentSpending: totalCurrentSpending,
        wouldSpend: totalCurrentSpending + Number(transactionData.amount),
        monthlyBudget: user?.monthlyBudgetGoal || null,
        spendingCaps: caps.length
      },
      message: violations.length === 0 
        ? (warnings.length > 0 
          ? 'Transaction would be approved with warnings' 
          : 'Transaction would be approved')
        : 'Transaction would be rejected due to budget/cap violations'
    };

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
});

// Update transaction
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const updateData: UpdateTransactionRequest = req.body;

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!existingTransaction) {
      throw new AppError('Transaction not found', 404);
    }

    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`user-${userId}`).emit('transaction-update', transaction);

    const response: ApiResponse = {
      success: true,
      data: transaction,
      message: 'Transaction updated successfully'
    };

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
});

// Delete transaction
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId }
    });

    if (!existingTransaction) {
      throw new AppError('Transaction not found', 404);
    }

    // Delete transaction
    await prisma.transaction.delete({
      where: { id }
    });

    const response: ApiResponse = {
      success: true,
      message: 'Transaction deleted successfully'
    };

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
});

// Search transactions with advanced filters
router.get('/search', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { q: query, limit = 50 } = req.query as { q?: string; limit?: string };

    if (!query || query.trim().length === 0) {
      const response: ApiResponse = {
        success: true,
        data: { transactions: [] },
        message: 'No search query provided'
      };
      return res.status(200).json(response);
    }

    const searchLimit = Math.min(Number(limit), 100); // Cap at 100 results
    const searchQuery = query.trim();

    // Parse advanced search query
    const parseSearchQuery = (query: string): { filters: any; generalTerms: string[] } => {
      const filters: any = {};
      const generalTerms: string[] = [];
      
      // Split by spaces but preserve quoted strings
      const tokens = query.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
      
      for (const token of tokens) {
        const trimmedToken = token.trim();
        
        // Check for field-specific filters
        if (trimmedToken.includes(':')) {
          const [field, value] = trimmedToken.split(':', 2);
          const cleanValue = value.replace(/^["']|["']$/g, ''); // Remove quotes
          
          switch (field.toLowerCase()) {
            case 'merchant':
              filters.merchant = { contains: cleanValue, mode: 'insensitive' };
              break;
            case 'category':
              filters.category = { contains: cleanValue, mode: 'insensitive' };
              break;
            case 'description':
              filters.description = { contains: cleanValue, mode: 'insensitive' };
              break;
            case 'location':
              filters.location = { contains: cleanValue, mode: 'insensitive' };
              break;
            case 'status':
              filters.status = cleanValue.toUpperCase();
              break;
          }
        } else if (trimmedToken.includes('amount')) {
          // Handle amount filters: amount>50, amount<100, amount>=25, amount<=75, amount=50
          const amountMatch = trimmedToken.match(/amount\s*([><=]+)\s*(\d+(?:\.\d+)?)/);
          if (amountMatch) {
            const operator = amountMatch[1];
            const value = parseFloat(amountMatch[2]);
            
            switch (operator) {
              case '>':
                filters.amount = { ...filters.amount, gt: value };
                break;
              case '>=':
                filters.amount = { ...filters.amount, gte: value };
                break;
              case '<':
                filters.amount = { ...filters.amount, lt: value };
                break;
              case '<=':
                filters.amount = { ...filters.amount, lte: value };
                break;
              case '=':
              case '==':
                filters.amount = { ...filters.amount, equals: value };
                break;
            }
          }
        } else {
          // General search term
          generalTerms.push(trimmedToken.replace(/^["']|["']$/g, ''));
        }
      }
      
      return { filters, generalTerms };
    };

    const { filters, generalTerms } = parseSearchQuery(searchQuery);

    // Build where clause
    const where: any = { userId };

    // Apply specific field filters
    Object.keys(filters).forEach(key => {
      where[key] = filters[key];
    });

    // If we have general search terms, add OR conditions
    if (generalTerms.length > 0) {
      const generalConditions = [];
      
      for (const term of generalTerms) {
        const termConditions: any[] = [
          // Search by merchant name (case-insensitive)
          {
            merchant: {
              contains: term,
              mode: 'insensitive'
            }
          },
          // Search by category (case-insensitive)
          {
            category: {
              contains: term,
              mode: 'insensitive'
            }
          },
          // Search by description (case-insensitive)
          {
            description: {
              contains: term,
              mode: 'insensitive'
            }
          },
          // Search by location (case-insensitive)
          {
            location: {
              contains: term,
              mode: 'insensitive'
            }
          }
        ];

        // If the term is a number, also search for amounts
        if (!isNaN(Number(term))) {
          termConditions.push({
            amount: {
              equals: Number(term)
            }
          });
        }

        generalConditions.push({
          OR: termConditions
        });
      }

      // If we have specific filters, combine them with AND
      if (Object.keys(filters).length > 0) {
        where.AND = [
          ...Object.keys(filters).map(key => ({ [key]: filters[key] })),
          { OR: generalConditions }
        ];
      } else {
        where.OR = generalConditions;
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      take: searchLimit,
      orderBy: { date: 'desc' },
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
        createdAt: true
      }
    });

    const response: ApiResponse = {
      success: true,
      data: { 
        transactions,
        searchQuery,
        filters: Object.keys(filters).length > 0 ? filters : null,
        generalTerms: generalTerms.length > 0 ? generalTerms : null
      },
      message: `Found ${transactions.length} transactions matching "${searchQuery}"`
    };

    return res.status(200).json(response);
  } catch (error) {
    return next(error);
  }
});

// Export transactions
router.get('/export/csv', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query;

    const where: any = { userId };
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' }
    });

    // Convert to CSV
    const csvHeader = 'Date,Merchant,Amount,Category,Description,Location,Status\n';
    const csvRows = transactions.map((t: any) => 
      `${t.date.toISOString().split('T')[0]},${t.merchant},${t.amount},${t.category},${t.description || ''},${t.location || ''},${t.status}`
    ).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    return res.status(200).send(csv);
  } catch (error) {
    return next(error);
  }
});

export default router;

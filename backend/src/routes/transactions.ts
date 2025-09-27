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

    res.status(200).json(response);
  } catch (error) {
    next(error);
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

    res.status(200).json(response);
  } catch (error) {
    next(error);
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

    res.status(201).json(response);
  } catch (error) {
    next(error);
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

    // Check spending caps
    const caps = await prisma.spendingCap.findMany({
      where: {
        userId,
        enabled: true
      }
    });

    // Calculate current spending for the period
    const now = new Date();
    const periodStart = new Date();
    
    // This is a simplified check - in production, you'd want more sophisticated period calculations
    const currentSpending = await prisma.transaction.aggregate({
      where: {
        userId,
        date: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1) // Current month
        }
      },
      _sum: {
        amount: true
      }
    });

    const totalSpent = Number(currentSpending._sum.amount || 0);
    const wouldExceed = totalSpent + Number(transactionData.amount);

    // Check against caps
    const capViolations = caps.filter((cap: any) => {
      if (cap.type === 'GLOBAL') {
        return wouldExceed > Number(cap.limit);
      }
      if (cap.type === 'CATEGORY' && cap.category === transactionData.category) {
        return wouldExceed > Number(cap.limit);
      }
      if (cap.type === 'MERCHANT' && cap.merchant === transactionData.merchant) {
        return wouldExceed > Number(cap.limit);
      }
      return false;
    });

    const response: ApiResponse = {
      success: true,
      data: {
        wouldBeApproved: capViolations.length === 0,
        capViolations: capViolations.map((cap: any) => ({
          id: cap.id,
          name: cap.name,
          type: cap.type,
          limit: cap.limit,
          wouldExceed: wouldExceed - Number(cap.limit)
        })),
        currentSpending: totalSpent,
        wouldSpend: wouldExceed
      },
      message: capViolations.length === 0 
        ? 'Transaction would be approved' 
        : 'Transaction would be rejected due to spending cap violations'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
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

    res.status(200).json(response);
  } catch (error) {
    next(error);
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

    res.status(200).json(response);
  } catch (error) {
    next(error);
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
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
});

export default router;

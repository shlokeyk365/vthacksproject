import express from 'express';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, AuthenticatedRequest } from '../types';
import { PlaidService } from '../services/plaidService';

const router = express.Router();

// Get available banks
router.get('/banks', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const banksData = await PlaidService.getAvailableBanks();

    const response: ApiResponse = {
      success: true,
      data: banksData,
      message: 'Available banks retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Connect to a bank
router.post('/connect', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { bankId } = req.body;
    const userId = req.user!.id;

    if (!bankId) {
      throw new AppError('Bank ID is required', 400);
    }

    const result = await PlaidService.connectBank(userId, bankId);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Bank account connected successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Get transactions from connected bank account
router.get('/transactions', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { start_date, end_date } = req.query;

    const startDate = start_date ? new Date(start_date as string) : undefined;
    const endDate = end_date ? new Date(end_date as string) : undefined;

    const transactionsData = await PlaidService.getTransactions(userId, startDate, endDate);

    const response: ApiResponse = {
      success: true,
      data: {
        transactions: transactionsData.transactions,
        accounts: transactionsData.accounts,
        total_transactions: transactionsData.total_transactions,
      },
      message: 'Transactions retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Get connected accounts
router.get('/accounts', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const accountsData = await PlaidService.getAccounts(userId);

    const response: ApiResponse = {
      success: true,
      data: {
        accounts: accountsData.accounts,
        totalBanks: accountsData.totalBanks,
      },
      message: 'Accounts retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Remove bank connection
router.delete('/connection', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const result = await PlaidService.removeConnection(userId);

    const response: ApiResponse = {
      success: true,
      data: result,
      message: 'Bank connection removed successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;

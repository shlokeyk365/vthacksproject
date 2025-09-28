import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock bank data for demo purposes
const MOCK_BANKS = [
  {
    id: 'chase',
    name: 'Chase Bank',
    logo: '🏦',
    accounts: [
      { id: 'chase_checking', name: 'Chase Total Checking', type: 'checking', balance: 2847.32, mask: '1234' },
      { id: 'chase_savings', name: 'Chase Savings', type: 'savings', balance: 15420.18, mask: '5678' }
    ]
  },
  {
    id: 'bank_of_america',
    name: 'Bank of America',
    logo: '🏛️',
    accounts: [
      { id: 'boa_checking', name: 'Bank of America Advantage', type: 'checking', balance: 1923.45, mask: '9012' },
      { id: 'boa_savings', name: 'Bank of America Savings', type: 'savings', balance: 8750.00, mask: '3456' }
    ]
  },
  {
    id: 'wells_fargo',
    name: 'Wells Fargo',
    logo: '🏪',
    accounts: [
      { id: 'wells_checking', name: 'Wells Fargo Everyday', type: 'checking', balance: 3156.78, mask: '7890' }
    ]
  }
];

const MOCK_TRANSACTIONS = [
  { id: '1', account_id: 'chase_checking', amount: -45.67, merchant: 'Starbucks', category: 'Food & Dining', date: '2025-09-27', description: 'Coffee purchase' },
  { id: '2', account_id: 'chase_checking', amount: -120.00, merchant: 'Shell Gas Station', category: 'Transportation', date: '2025-09-26', description: 'Gas fill-up' },
  { id: '3', account_id: 'chase_checking', amount: -89.99, merchant: 'Amazon', category: 'Shopping', date: '2025-09-25', description: 'Online purchase' },
  { id: '4', account_id: 'chase_checking', amount: -25.50, merchant: 'McDonald\'s', category: 'Food & Dining', date: '2025-09-24', description: 'Lunch' },
  { id: '5', account_id: 'chase_checking', amount: -15.99, merchant: 'Netflix', category: 'Entertainment', date: '2025-09-23', description: 'Monthly subscription' },
  { id: '6', account_id: 'chase_checking', amount: -200.00, merchant: 'Target', category: 'Shopping', date: '2025-09-22', description: 'Groceries and household items' },
  { id: '7', account_id: 'chase_checking', amount: -75.00, merchant: 'Uber', category: 'Transportation', date: '2025-09-21', description: 'Ride to airport' },
  { id: '8', account_id: 'chase_checking', amount: -12.50, merchant: 'CVS Pharmacy', category: 'Healthcare', date: '2025-09-20', description: 'Prescription' }
];

export class PlaidService {
  // Get available banks for connection
  static async getAvailableBanks() {
    return {
      banks: MOCK_BANKS.map(bank => ({
        id: bank.id,
        name: bank.name,
        logo: bank.logo,
        accountCount: bank.accounts.length
      }))
    };
  }

  // Simulate bank connection
  static async connectBank(userId: string, bankId: string) {
    try {
      const bank = MOCK_BANKS.find(b => b.id === bankId);
      if (!bank) {
        throw new Error('Bank not found');
      }

      // Store connection in user preferences
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const preferences = JSON.parse(user.preferences || '{}');
      preferences.connectedBanks = preferences.connectedBanks || [];
      
      if (!preferences.connectedBanks.find((b: any) => b.id === bankId)) {
        preferences.connectedBanks.push({
          id: bankId,
          name: bank.name,
          logo: bank.logo,
          connectedAt: new Date().toISOString(),
          accounts: bank.accounts
        });
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          preferences: JSON.stringify(preferences),
        },
      });

      return {
        success: true,
        bank: {
          id: bankId,
          name: bank.name,
          logo: bank.logo,
          accounts: bank.accounts
        }
      };
    } catch (error) {
      console.error('Error connecting bank:', error);
      throw error;
    }
  }

  // Get connected accounts
  static async getAccounts(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const preferences = JSON.parse(user.preferences || '{}');
      const connectedBanks = preferences.connectedBanks || [];

      // Return empty arrays if no banks connected instead of throwing error
      if (connectedBanks.length === 0) {
        return {
          accounts: [],
          totalBanks: 0
        };
      }

      // Flatten all accounts from connected banks
      const allAccounts = connectedBanks.flatMap((bank: any) => 
        bank.accounts.map((account: any) => ({
          ...account,
          bankName: bank.name,
          bankLogo: bank.logo,
          connectedAt: bank.connectedAt
        }))
      );

      return {
        accounts: allAccounts,
        totalBanks: connectedBanks.length
      };
    } catch (error) {
      console.error('Error getting accounts:', error);
      throw error;
    }
  }

  // Get transactions from connected accounts
  static async getTransactions(userId: string, startDate?: Date, endDate?: Date) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const preferences = JSON.parse(user.preferences || '{}');
      const connectedBanks = preferences.connectedBanks || [];

      if (connectedBanks.length === 0) {
        throw new Error('No bank accounts connected. Please connect a bank account first.');
      }

      // Filter transactions based on date range
      let filteredTransactions = MOCK_TRANSACTIONS;
      
      if (startDate || endDate) {
        filteredTransactions = MOCK_TRANSACTIONS.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          if (startDate && transactionDate < startDate) return false;
          if (endDate && transactionDate > endDate) return false;
          return true;
        });
      }

      return {
        transactions: filteredTransactions,
        total_transactions: filteredTransactions.length,
        accounts: connectedBanks.flatMap((bank: any) => bank.accounts)
      };
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }

  // Remove bank connection
  static async removeConnection(userId: string, bankId?: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const preferences = JSON.parse(user.preferences || '{}');
      
      if (bankId) {
        // Remove specific bank
        preferences.connectedBanks = (preferences.connectedBanks || []).filter((bank: any) => bank.id !== bankId);
      } else {
        // Remove all banks
        preferences.connectedBanks = [];
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          preferences: JSON.stringify(preferences),
        },
      });

      return { success: true };
    } catch (error) {
      console.error('Error removing connection:', error);
      throw error;
    }
  }
}

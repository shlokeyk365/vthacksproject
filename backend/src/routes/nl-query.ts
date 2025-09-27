import express from 'express';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ApiResponse, AuthenticatedRequest } from '../types';
import { NLQueryAgent } from '../agents/NLQueryAgent';

const router = express.Router();
const nlQueryAgent = new NLQueryAgent();

// Process natural language query and generate visualization
router.post('/query', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { query } = req.body;
    const userId = req.user!.id;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw new AppError('Query is required and must be a non-empty string', 400);
    }

    // Parse the natural language query
    const intent = await nlQueryAgent.parseQuery(query, userId);
    
    // Generate visualization based on intent
    const result = await nlQueryAgent.generateVisualization(intent, userId);

    const response: ApiResponse = {
      success: result.success,
      data: {
        query: query.trim(),
        intent: result.intent,
        visualization: {
          data: result.data,
          config: result.chartConfig,
          title: result.intent.title,
          description: result.intent.description,
          chartType: result.intent.chartType
        }
      },
      message: result.message
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Get suggested queries based on user's data patterns
router.get('/suggestions', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    
    // Get user's recent spending patterns to suggest relevant queries
    const recentTransactions = await nlQueryAgent['prisma'].transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
      select: { category: true, merchant: true, amount: true }
    });

    // Generate suggested queries based on patterns
    const suggestions = generateQuerySuggestions(recentTransactions);

    const response: ApiResponse = {
      success: true,
      data: suggestions,
      message: 'Query suggestions generated successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Get query history for the user
router.get('/history', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { limit = '10' } = req.query;
    
    // In a real implementation, you'd store query history in the database
    // For now, we'll return a mock response
    const queryHistory = [
      {
        id: 1,
        query: "Show my dining expenses",
        timestamp: new Date().toISOString(),
        chartType: "line",
        success: true
      },
      {
        id: 2,
        query: "Compare my spending by category",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        chartType: "pie",
        success: true
      }
    ];

    const response: ApiResponse = {
      success: true,
      data: queryHistory.slice(0, parseInt(limit as string)),
      message: 'Query history retrieved successfully'
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

// Helper function to generate query suggestions
function generateQuerySuggestions(transactions: any[]): string[] {
  const suggestions: string[] = [];
  
  // Analyze transaction patterns
  const categories = [...new Set(transactions.map(t => t.category))];
  const merchants = [...new Set(transactions.map(t => t.merchant))];
  
  // Category-based suggestions
  if (categories.includes('Dining')) {
    suggestions.push("Show my dining spending trends");
    suggestions.push("How much did I spend on dining this month?");
  }
  
  if (categories.includes('Shopping')) {
    suggestions.push("Compare my shopping expenses by merchant");
    suggestions.push("Show my shopping spending breakdown");
  }
  
  if (categories.includes('Transport')) {
    suggestions.push("Display my transportation costs over time");
    suggestions.push("How much do I spend on gas each week?");
  }
  
  // Merchant-based suggestions
  if (merchants.some(m => m.toLowerCase().includes('amazon'))) {
    suggestions.push("Show my Amazon spending trends");
  }
  
  if (merchants.some(m => m.toLowerCase().includes('starbucks'))) {
    suggestions.push("How much do I spend at Starbucks?");
  }
  
  // General suggestions
  suggestions.push("Show my spending trends for the last 3 months");
  suggestions.push("Compare my spending by category");
  suggestions.push("What are my top spending categories?");
  suggestions.push("Show my weekend vs weekday spending");
  
  return suggestions.slice(0, 8); // Return top 8 suggestions
}

export default router;

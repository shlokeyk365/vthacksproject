import { Transaction } from './api';

// Unified dataset for test@moneylens.com account
// This provides consistent data across all components

export interface UnifiedTransaction extends Transaction {
  // Extended with additional fields for analytics
  dayOfWeek: string;
  timeOfDay: string;
  season: string;
}

export interface MonthlySpending {
  month: string;
  dining: number;
  shopping: number;
  transport: number;
  utilities: number;
  healthcare: number;
  entertainment: number;
  groceries: number;
  total: number;
}

export interface MerchantData {
  name: string;
  amount: number;
  visits: number;
  category: string;
  color: string;
  averageSpent: number;
}

export interface SpendingCapData {
  category: string;
  spent: number;
  cap: number;
  target: number;
  percentage: number;
}

export interface SpendingProjection {
  month: string;
  actual: number | null;
  projected: number;
  trend: string;
}

// Generate realistic transaction data for test@moneylens.com
export const generateUnifiedTransactions = (): UnifiedTransaction[] => {
  const transactions: UnifiedTransaction[] = [];
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2024-06-30');
  
  // Merchant data with realistic patterns
  const merchants = [
    // Dining
    { name: "Starbucks", category: "Dining", frequency: 0.15, avgAmount: 8.50, locations: ["Downtown", "Mall", "Airport"] },
    { name: "McDonald's", category: "Dining", frequency: 0.12, avgAmount: 12.30, locations: ["Highway", "Mall"] },
    { name: "Chipotle", category: "Dining", frequency: 0.08, avgAmount: 14.75, locations: ["Downtown", "Mall"] },
    { name: "Subway", category: "Dining", frequency: 0.06, avgAmount: 9.25, locations: ["Downtown", "Mall"] },
    { name: "Pizza Hut", category: "Dining", frequency: 0.05, avgAmount: 18.90, locations: ["Downtown"] },
    { name: "Local Restaurant", category: "Dining", frequency: 0.04, avgAmount: 35.00, locations: ["Downtown"] },
    
    // Shopping
    { name: "Amazon", category: "Shopping", frequency: 0.20, avgAmount: 45.00, locations: ["Online"] },
    { name: "Target", category: "Shopping", frequency: 0.08, avgAmount: 65.00, locations: ["Mall", "Downtown"] },
    { name: "Walmart", category: "Shopping", frequency: 0.06, avgAmount: 55.00, locations: ["Highway"] },
    { name: "Best Buy", category: "Shopping", frequency: 0.03, avgAmount: 120.00, locations: ["Mall"] },
    { name: "Nike", category: "Shopping", frequency: 0.02, avgAmount: 85.00, locations: ["Mall"] },
    
    // Transport
    { name: "Shell", category: "Transport", frequency: 0.10, avgAmount: 35.00, locations: ["Highway", "Downtown"] },
    { name: "Exxon", category: "Transport", frequency: 0.08, avgAmount: 32.00, locations: ["Highway"] },
    { name: "Uber", category: "Transport", frequency: 0.05, avgAmount: 15.50, locations: ["Downtown", "Airport"] },
    { name: "Lyft", category: "Transport", frequency: 0.04, avgAmount: 16.00, locations: ["Downtown"] },
    { name: "Parking Garage", category: "Transport", frequency: 0.03, avgAmount: 8.00, locations: ["Downtown"] },
    
    // Utilities
    { name: "Electric Company", category: "Utilities", frequency: 0.02, avgAmount: 120.00, locations: ["Online"] },
    { name: "Water Company", category: "Utilities", frequency: 0.02, avgAmount: 45.00, locations: ["Online"] },
    { name: "Internet Provider", category: "Utilities", frequency: 0.02, avgAmount: 65.00, locations: ["Online"] },
    { name: "Phone Company", category: "Utilities", frequency: 0.02, avgAmount: 85.00, locations: ["Online"] },
    
    // Healthcare
    { name: "CVS Pharmacy", category: "Healthcare", frequency: 0.03, avgAmount: 25.00, locations: ["Downtown", "Mall"] },
    { name: "Walgreens", category: "Healthcare", frequency: 0.02, avgAmount: 22.00, locations: ["Downtown"] },
    { name: "Doctor's Office", category: "Healthcare", frequency: 0.01, avgAmount: 150.00, locations: ["Downtown"] },
    
    // Entertainment
    { name: "Netflix", category: "Entertainment", frequency: 0.02, avgAmount: 15.99, locations: ["Online"] },
    { name: "Spotify", category: "Entertainment", frequency: 0.02, avgAmount: 9.99, locations: ["Online"] },
    { name: "Movie Theater", category: "Entertainment", frequency: 0.01, avgAmount: 25.00, locations: ["Mall"] },
    
    // Groceries
    { name: "Whole Foods", category: "Groceries", frequency: 0.08, avgAmount: 85.00, locations: ["Downtown"] },
    { name: "Kroger", category: "Groceries", frequency: 0.06, avgAmount: 75.00, locations: ["Highway"] },
    { name: "Trader Joe's", category: "Groceries", frequency: 0.04, avgAmount: 65.00, locations: ["Downtown"] },
  ];

  // Generate transactions over 6 months
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
    const month = currentDate.toLocaleDateString('en-US', { month: 'short' });
    const season = getSeason(currentDate);
    
    // Generate 2-8 transactions per day (more on weekends)
    const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';
    const transactionCount = isWeekend ? 
      Math.floor(Math.random() * 4) + 4 : // 4-7 on weekends
      Math.floor(Math.random() * 3) + 2;  // 2-4 on weekdays

    for (let i = 0; i < transactionCount; i++) {
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const amount = generateRealisticAmount(merchant.avgAmount, merchant.category);
      const timeOfDay = generateTimeOfDay();
      
      transactions.push({
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        merchant: merchant.name,
        amount: amount,
        category: merchant.category,
        description: generateDescription(merchant.name, merchant.category),
        location: merchant.locations[Math.floor(Math.random() * merchant.locations.length)],
        latitude: generateLatitude(),
        longitude: generateLongitude(),
        date: new Date(currentDate).toISOString(),
        status: 'COMPLETED' as const,
        isSimulated: false,
        createdAt: new Date(currentDate).toISOString(),
        updatedAt: new Date(currentDate).toISOString(),
        userId: 'test-user-id',
        dayOfWeek,
        timeOfDay,
        season
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Helper functions
function getSeason(date: Date): string {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Fall';
  return 'Winter';
}

function generateRealisticAmount(baseAmount: number, category: string): number {
  // Add realistic variation based on category
  const variation = category === 'Dining' ? 0.3 : 
                   category === 'Shopping' ? 0.5 : 
                   category === 'Transport' ? 0.2 : 0.4;
  
  const randomFactor = 1 + (Math.random() - 0.5) * variation;
  return Math.round(baseAmount * randomFactor * 100) / 100;
}

function generateTimeOfDay(): string {
  const hour = Math.floor(Math.random() * 24);
  if (hour >= 6 && hour < 12) return 'Morning';
  if (hour >= 12 && hour < 18) return 'Afternoon';
  if (hour >= 18 && hour < 22) return 'Evening';
  return 'Night';
}

function generateDescription(merchant: string, category: string): string {
  const descriptions = {
    'Dining': ['Food purchase', 'Meal', 'Coffee', 'Lunch', 'Dinner'],
    'Shopping': ['Purchase', 'Online order', 'Retail purchase', 'Shopping'],
    'Transport': ['Gas', 'Fuel', 'Ride', 'Parking', 'Transportation'],
    'Utilities': ['Bill payment', 'Service charge', 'Monthly bill'],
    'Healthcare': ['Medical', 'Pharmacy', 'Health services'],
    'Entertainment': ['Subscription', 'Entertainment', 'Movie', 'Music'],
    'Groceries': ['Grocery shopping', 'Food purchase', 'Groceries']
  };
  
  const categoryDescriptions = descriptions[category as keyof typeof descriptions] || ['Purchase'];
  return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
}

function generateLatitude(): number {
  // Generate realistic latitude for a US city (e.g., around 40.7 for NYC area)
  return 40.7 + (Math.random() - 0.5) * 0.1;
}

function generateLongitude(): number {
  // Generate realistic longitude for a US city (e.g., around -74.0 for NYC area)
  return -74.0 + (Math.random() - 0.5) * 0.1;
}

// Process transactions into chart-ready data
export const processTransactionsForCharts = (transactions: UnifiedTransaction[]) => {
  // Monthly spending data
  const monthlySpending: MonthlySpending[] = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  months.forEach((month, index) => {
    const monthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === index;
    });
    
    const spending = {
      month,
      dining: 0,
      shopping: 0,
      transport: 0,
      utilities: 0,
      healthcare: 0,
      entertainment: 0,
      groceries: 0,
      total: 0
    };
    
    monthTransactions.forEach(t => {
      const amount = t.amount;
      spending[t.category.toLowerCase() as keyof typeof spending] += amount;
      spending.total += amount;
    });
    
    monthlySpending.push(spending);
  });

  // Top merchants
  const merchantMap = new Map<string, { amount: number; visits: number; category: string }>();
  
  transactions.forEach(t => {
    const existing = merchantMap.get(t.merchant);
    if (existing) {
      existing.amount += t.amount;
      existing.visits += 1;
    } else {
      merchantMap.set(t.merchant, {
        amount: t.amount,
        visits: 1,
        category: t.category
      });
    }
  });

  const topMerchants: MerchantData[] = Array.from(merchantMap.entries())
    .map(([name, data]) => ({
      name,
      amount: data.amount,
      visits: data.visits,
      category: data.category,
      color: getBrandColor(name, data.category),
      averageSpent: data.amount / data.visits
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Spending vs caps
  const categoryTotals = new Map<string, number>();
  transactions.forEach(t => {
    const existing = categoryTotals.get(t.category);
    categoryTotals.set(t.category, (existing || 0) + t.amount);
  });

  const spendingVsCaps: SpendingCapData[] = [
    { category: 'Dining', spent: categoryTotals.get('Dining') || 0, cap: 500, target: 450 },
    { category: 'Shopping', spent: categoryTotals.get('Shopping') || 0, cap: 400, target: 350 },
    { category: 'Transport', spent: categoryTotals.get('Transport') || 0, cap: 300, target: 250 },
    { category: 'Utilities', spent: categoryTotals.get('Utilities') || 0, cap: 200, target: 180 },
    { category: 'Healthcare', spent: categoryTotals.get('Healthcare') || 0, cap: 300, target: 250 },
    { category: 'Entertainment', spent: categoryTotals.get('Entertainment') || 0, cap: 150, target: 120 },
    { category: 'Groceries', spent: categoryTotals.get('Groceries') || 0, cap: 400, target: 350 }
  ].map(cap => ({
    ...cap,
    percentage: Math.round((cap.spent / cap.cap) * 100)
  }));

  // Spending projection
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const averageMonthly = totalSpent / 6;
  
  const spendingProjection: SpendingProjection[] = [
    { month: 'Jul', actual: null, projected: averageMonthly * 1.02, trend: 'increasing' },
    { month: 'Aug', actual: null, projected: averageMonthly * 1.05, trend: 'increasing' },
    { month: 'Sep', actual: null, projected: averageMonthly * 1.08, trend: 'increasing' },
    { month: 'Oct', actual: null, projected: averageMonthly * 1.12, trend: 'increasing' },
    { month: 'Nov', actual: null, projected: averageMonthly * 1.15, trend: 'increasing' },
    { month: 'Dec', actual: null, projected: averageMonthly * 1.25, trend: 'holiday_spike' }
  ];

  return {
    monthlySpending,
    topMerchants,
    spendingVsCaps,
    spendingProjection,
    totalTransactions: transactions.length,
    totalSpent,
    averageMonthly
  };
};

// Brand color utility (simplified version)
function getBrandColor(merchant: string, category: string): string {
  const colors = {
    'Amazon': '#FF9900',
    'Target': '#CC0000',
    'Starbucks': '#00704A',
    'McDonald\'s': '#FFC72C',
    'Shell': '#FFD700',
    'Exxon': '#FF0000',
    'Uber': '#000000',
    'Lyft': '#FF00BF',
    'Netflix': '#E50914',
    'Spotify': '#1DB954'
  };
  
  return colors[merchant as keyof typeof colors] || '#3B82F6';
}

// Export the unified dataset
export const unifiedTransactions = generateUnifiedTransactions();
export const chartData = processTransactionsForCharts(unifiedTransactions);

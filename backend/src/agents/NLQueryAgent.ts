import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../types';

export interface VisualizationIntent {
  type: 'chart' | 'metric' | 'comparison' | 'trend' | 'breakdown';
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'heatmap';
  dataSource: 'transactions' | 'merchants' | 'categories' | 'spending_caps';
  filters: {
    category?: string;
    merchant?: string;
    timeRange?: string;
    amountRange?: { min: number; max: number };
  };
  aggregation: 'sum' | 'count' | 'average' | 'max' | 'min';
  groupBy: 'date' | 'category' | 'merchant' | 'day_of_week' | 'hour';
  title: string;
  description: string;
}

export interface QueryResult {
  intent: VisualizationIntent;
  data: any[];
  chartConfig: any;
  success: boolean;
  message: string;
}

export class NLQueryAgent {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Parse natural language query and extract visualization intent
   */
  async parseQuery(query: string, userId: string): Promise<VisualizationIntent> {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Intent detection patterns
    const intentPatterns = {
      // Trend queries
      trend: /(show|display|graph|chart).*(trend|over time|throughout|across|during)/,
      // Comparison queries
      comparison: /(compare|vs|versus|against|difference between)/,
      // Breakdown queries
      breakdown: /(breakdown|split|distribution|by category|by merchant)/,
      // Specific metric queries
      metric: /(how much|total|spent|spending|amount|cost)/,
      // Time-based queries
      timeBased: /(last|past|this|current|month|week|day|year|quarter)/,
      // Category-specific queries
      categorySpecific: /(dining|food|restaurant|coffee|shopping|transport|gas|utilities|entertainment)/,
      // Merchant-specific queries
      merchantSpecific: /(amazon|starbucks|target|shell|mcdonald|walmart|costco)/,
    };

    // Determine query type
    let queryType: VisualizationIntent['type'] = 'chart';
    let chartType: VisualizationIntent['chartType'] = 'line';
    let dataSource: VisualizationIntent['dataSource'] = 'transactions';
    let aggregation: VisualizationIntent['aggregation'] = 'sum';
    let groupBy: VisualizationIntent['groupBy'] = 'date';

    // Detect intent type
    if (intentPatterns.trend.test(normalizedQuery)) {
      queryType = 'trend';
      chartType = 'line';
    } else if (intentPatterns.comparison.test(normalizedQuery)) {
      queryType = 'comparison';
      chartType = 'bar';
    } else if (intentPatterns.breakdown.test(normalizedQuery)) {
      queryType = 'breakdown';
      chartType = 'pie';
      groupBy = 'category';
    } else if (intentPatterns.metric.test(normalizedQuery)) {
      queryType = 'metric';
      chartType = 'bar';
    }

    // Extract filters
    const filters: VisualizationIntent['filters'] = {};
    
    // Time range extraction
    if (intentPatterns.timeBased.test(normalizedQuery)) {
      if (normalizedQuery.includes('last month') || normalizedQuery.includes('past month')) {
        filters.timeRange = '30';
      } else if (normalizedQuery.includes('last week') || normalizedQuery.includes('past week')) {
        filters.timeRange = '7';
      } else if (normalizedQuery.includes('last year') || normalizedQuery.includes('past year')) {
        filters.timeRange = '365';
      } else if (normalizedQuery.includes('last 3 months') || normalizedQuery.includes('past 3 months')) {
        filters.timeRange = '90';
      } else if (normalizedQuery.includes('last 6 months') || normalizedQuery.includes('past 6 months')) {
        filters.timeRange = '180';
      }
    }

    // Category extraction
    if (intentPatterns.categorySpecific.test(normalizedQuery)) {
      if (normalizedQuery.includes('dining') || normalizedQuery.includes('food') || normalizedQuery.includes('restaurant')) {
        filters.category = 'Dining';
      } else if (normalizedQuery.includes('shopping')) {
        filters.category = 'Shopping';
      } else if (normalizedQuery.includes('transport') || normalizedQuery.includes('gas')) {
        filters.category = 'Transport';
      } else if (normalizedQuery.includes('utilities')) {
        filters.category = 'Utilities';
      } else if (normalizedQuery.includes('entertainment')) {
        filters.category = 'Entertainment';
      }
    }

    // Merchant extraction
    if (intentPatterns.merchantSpecific.test(normalizedQuery)) {
      const merchantMatch = normalizedQuery.match(/(amazon|starbucks|target|shell|mcdonald|walmart|costco)/i);
      if (merchantMatch) {
        filters.merchant = merchantMatch[1];
      }
    }

    // Generate title and description
    const title = this.generateChartTitle(normalizedQuery, queryType, filters);
    const description = this.generateChartDescription(normalizedQuery, queryType, filters);

    return {
      type: queryType,
      chartType,
      dataSource,
      filters,
      aggregation,
      groupBy,
      title,
      description
    };
  }

  /**
   * Generate visualization based on parsed intent
   */
  async generateVisualization(intent: VisualizationIntent, userId: string): Promise<QueryResult> {
    try {
      let data: any[] = [];
      let chartConfig: any = {};

      // Calculate date range
      const days = intent.filters.timeRange ? parseInt(intent.filters.timeRange) : 30;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Build query conditions
      const whereConditions: any = {
        userId,
        date: { gte: startDate },
        status: 'COMPLETED'
      };

      if (intent.filters.category) {
        whereConditions.category = intent.filters.category;
      }

      if (intent.filters.merchant) {
        whereConditions.merchant = { contains: intent.filters.merchant, mode: 'insensitive' };
      }

      // Fetch data based on intent type
      switch (intent.type) {
        case 'trend':
          data = await this.generateTrendData(whereConditions, intent);
          chartConfig = this.getTrendChartConfig(intent);
          break;
        
        case 'comparison':
          data = await this.generateComparisonData(whereConditions, intent);
          chartConfig = this.getComparisonChartConfig(intent);
          break;
        
        case 'breakdown':
          data = await this.generateBreakdownData(whereConditions, intent);
          chartConfig = this.getBreakdownChartConfig(intent);
          break;
        
        case 'metric':
          data = await this.generateMetricData(whereConditions, intent);
          chartConfig = this.getMetricChartConfig(intent);
          break;
        
        default:
          data = await this.generateTrendData(whereConditions, intent);
          chartConfig = this.getTrendChartConfig(intent);
      }

      return {
        intent,
        data,
        chartConfig,
        success: true,
        message: `Generated ${intent.chartType} chart for: ${intent.title}`
      };

    } catch (error) {
      return {
        intent,
        data: [],
        chartConfig: {},
        success: false,
        message: `Error generating visualization: ${error.message}`
      };
    }
  }

  /**
   * Generate trend data
   */
  private async generateTrendData(whereConditions: any, intent: VisualizationIntent): Promise<any[]> {
    const groupByField = intent.groupBy === 'date' ? 'date' : intent.groupBy;
    
    const trendData = await this.prisma.transaction.groupBy({
      by: [groupByField],
      where: whereConditions,
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { [groupByField]: 'asc' }
    });

    return trendData.map(item => ({
      [groupByField]: groupByField === 'date' ? item.date.toISOString().split('T')[0] : item[groupByField],
      amount: Number(item._sum.amount || 0),
      count: item._count.id
    }));
  }

  /**
   * Generate comparison data
   */
  private async generateComparisonData(whereConditions: any, intent: VisualizationIntent): Promise<any[]> {
    const groupByField = intent.groupBy === 'category' ? 'category' : 'merchant';
    
    const comparisonData = await this.prisma.transaction.groupBy({
      by: [groupByField],
      where: whereConditions,
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10
    });

    return comparisonData.map(item => ({
      [groupByField]: item[groupByField],
      amount: Number(item._sum.amount || 0),
      count: item._count.id
    }));
  }

  /**
   * Generate breakdown data
   */
  private async generateBreakdownData(whereConditions: any, intent: VisualizationIntent): Promise<any[]> {
    const breakdownData = await this.prisma.transaction.groupBy({
      by: ['category'],
      where: whereConditions,
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } }
    });

    const total = breakdownData.reduce((sum, item) => sum + Number(item._sum.amount || 0), 0);

    return breakdownData.map(item => ({
      category: item.category,
      amount: Number(item._sum.amount || 0),
      percentage: total > 0 ? (Number(item._sum.amount || 0) / total) * 100 : 0
    }));
  }

  /**
   * Generate metric data
   */
  private async generateMetricData(whereConditions: any, intent: VisualizationIntent): Promise<any[]> {
    const metricData = await this.prisma.transaction.aggregate({
      where: whereConditions,
      _sum: { amount: true },
      _count: { id: true },
      _avg: { amount: true },
      _max: { amount: true },
      _min: { amount: true }
    });

    return [{
      total: Number(metricData._sum.amount || 0),
      count: metricData._count.id,
      average: Number(metricData._avg.amount || 0),
      max: Number(metricData._max.amount || 0),
      min: Number(metricData._min.amount || 0)
    }];
  }

  /**
   * Generate chart title based on query
   */
  private generateChartTitle(query: string, type: string, filters: any): string {
    let title = '';
    
    if (filters.category) {
      title += `${filters.category} `;
    }
    
    if (filters.merchant) {
      title += `at ${filters.merchant} `;
    }
    
    if (type === 'trend') {
      title += 'Spending Trend';
    } else if (type === 'comparison') {
      title += 'Spending Comparison';
    } else if (type === 'breakdown') {
      title += 'Spending Breakdown';
    } else if (type === 'metric') {
      title += 'Spending Metrics';
    }
    
    if (filters.timeRange) {
      const days = parseInt(filters.timeRange);
      if (days === 7) title += ' (Last Week)';
      else if (days === 30) title += ' (Last Month)';
      else if (days === 90) title += ' (Last 3 Months)';
      else if (days === 180) title += ' (Last 6 Months)';
      else if (days === 365) title += ' (Last Year)';
    }
    
    return title || 'Spending Analysis';
  }

  /**
   * Generate chart description
   */
  private generateChartDescription(query: string, type: string, filters: any): string {
    let description = 'Visualization showing ';
    
    if (filters.category) {
      description += `${filters.category.toLowerCase()} `;
    }
    
    if (type === 'trend') {
      description += 'spending trends over time';
    } else if (type === 'comparison') {
      description += 'spending comparison across categories or merchants';
    } else if (type === 'breakdown') {
      description += 'spending breakdown by category';
    } else if (type === 'metric') {
      description += 'key spending metrics and statistics';
    }
    
    return description;
  }

  /**
   * Get chart configuration for trend charts
   */
  private getTrendChartConfig(intent: VisualizationIntent): any {
    return {
      type: 'line',
      dataKey: 'amount',
      stroke: '#3B82F6',
      strokeWidth: 2,
      fill: '#3B82F6',
      fillOpacity: 0.1
    };
  }

  /**
   * Get chart configuration for comparison charts
   */
  private getComparisonChartConfig(intent: VisualizationIntent): any {
    return {
      type: 'bar',
      dataKey: 'amount',
      fill: '#10B981',
      radius: [4, 4, 0, 0]
    };
  }

  /**
   * Get chart configuration for breakdown charts
   */
  private getBreakdownChartConfig(intent: VisualizationIntent): any {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
    return {
      type: 'pie',
      dataKey: 'amount',
      colors: colors,
      innerRadius: 0,
      outerRadius: 80
    };
  }

  /**
   * Get chart configuration for metric charts
   */
  private getMetricChartConfig(intent: VisualizationIntent): any {
    return {
      type: 'bar',
      dataKey: 'total',
      fill: '#8B5CF6',
      radius: [4, 4, 0, 0]
    };
  }
}

import { FinancialBodyguard, Transaction, RiskAssessment, SpendingPattern, Location } from './FinancialBodyguard';

export interface AIInsight {
  id: string;
  type: 'spending_trend' | 'risk_alert' | 'pattern_anomaly' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-100
  timestamp: number;
  actionable: boolean;
  suggestedAction?: string;
}

export interface AutonomousAction {
  id: string;
  type: 'auto_block' | 'auto_approve' | 'auto_alert' | 'auto_geofence' | 'auto_limit_adjust';
  description: string;
  executed: boolean;
  timestamp: number;
  parameters: any;
}

export interface AIPrediction {
  type: 'spending_forecast' | 'risk_prediction' | 'merchant_visit_probability';
  value: number;
  confidence: number;
  timeframe: string;
  factors: string[];
}

export class AgenticAI {
  private financialBodyguard: FinancialBodyguard;
  private insights: AIInsight[] = [];
  private autonomousActions: AutonomousAction[] = [];
  private predictions: AIPrediction[] = [];
  private learningRate: number = 0.1;
  private decisionThreshold: number = 0.8;

  constructor(financialBodyguard: FinancialBodyguard) {
    this.financialBodyguard = financialBodyguard;
    this.startAutonomousAnalysis();
  }

  // Start continuous autonomous analysis
  private startAutonomousAnalysis(): void {
    // Run analysis every 30 seconds
    setInterval(() => {
      this.performAutonomousAnalysis();
    }, 30000);

    // Run deep analysis every 5 minutes
    setInterval(() => {
      this.performDeepAnalysis();
    }, 300000);
  }

  // Perform autonomous analysis
  private performAutonomousAnalysis(): void {
    const spendingPatterns = this.financialBodyguard.getSpendingPatterns();
    const highRiskMerchants = this.financialBodyguard.getHighRiskMerchants();

    // Analyze spending trends
    this.analyzeSpendingTrends(spendingPatterns);
    
    // Detect anomalies
    this.detectAnomalies(spendingPatterns);
    
    // Generate predictions
    this.generatePredictions(spendingPatterns);
    
    // Execute autonomous actions
    this.executeAutonomousActions();
  }

  // Perform deep analysis
  private performDeepAnalysis(): void {
    console.log('🤖 Agentic AI: Performing deep analysis...');
    
    const spendingPatterns = this.financialBodyguard.getSpendingPatterns();
    
    // Advanced pattern recognition
    this.identifyComplexPatterns(spendingPatterns);
    
    // Behavioral analysis
    this.analyzeBehavioralPatterns(spendingPatterns);
    
    // Risk modeling
    this.updateRiskModels(spendingPatterns);
    
    // Generate strategic insights
    this.generateStrategicInsights(spendingPatterns);
  }

  // Analyze spending trends
  private analyzeSpendingTrends(patterns: SpendingPattern[]): void {
    const now = Date.now();
    const lastWeek = now - (7 * 24 * 60 * 60 * 1000);
    const lastMonth = now - (30 * 24 * 60 * 60 * 1000);
    
    // Calculate recent spending trends
    const recentPatterns = patterns.filter(p => p.lastVisit > lastWeek);
    const weeklySpending = recentPatterns.reduce((sum, pattern) => {
      // Calculate spending in the last week based on visit frequency and average amount
      const daysSinceLastVisit = (now - pattern.lastVisit) / (1000 * 60 * 60 * 24);
      const estimatedWeeklyVisits = Math.min(7, pattern.visitCount * (7 / Math.max(1, daysSinceLastVisit)));
      const estimatedWeeklySpending = estimatedWeeklyVisits * pattern.averageAmount;
      return sum + estimatedWeeklySpending;
    }, 0);

    // Calculate monthly spending for comparison
    const monthlySpending = patterns.reduce((sum, pattern) => {
      const daysSinceLastVisit = (now - pattern.lastVisit) / (1000 * 60 * 60 * 24);
      if (daysSinceLastVisit <= 30) {
        const estimatedMonthlyVisits = Math.min(30, pattern.visitCount * (30 / Math.max(1, daysSinceLastVisit)));
        return sum + (estimatedMonthlyVisits * pattern.averageAmount);
      }
      return sum;
    }, 0);

    // Detect significant changes
    const avgDailySpending = weeklySpending / 7;
    const avgMonthlySpending = monthlySpending / 30;
    
    // High daily spending alert
    if (avgDailySpending > 150) {
      this.addInsight({
        id: `trend_high_daily_${Date.now()}`,
        type: 'spending_trend',
        title: 'High Daily Spending Detected',
        description: `Average daily spending is $${avgDailySpending.toFixed(2)}, which is significantly above normal levels.`,
        severity: 'high',
        confidence: 90,
        timestamp: now,
        actionable: true,
        suggestedAction: 'Consider setting daily spending limits or reviewing recent purchases.'
      });
    } else if (avgDailySpending > 100) {
      this.addInsight({
        id: `trend_moderate_daily_${Date.now()}`,
        type: 'spending_trend',
        title: 'Moderate Daily Spending Increase',
        description: `Average daily spending is $${avgDailySpending.toFixed(2)}, which is above normal levels.`,
        severity: 'medium',
        confidence: 75,
        timestamp: now,
        actionable: true,
        suggestedAction: 'Monitor your spending patterns and consider setting daily limits.'
      });
    }

    // Monthly spending analysis
    if (avgMonthlySpending > 2000) {
      this.addInsight({
        id: `trend_high_monthly_${Date.now()}`,
        type: 'spending_trend',
        title: 'High Monthly Spending Detected',
        description: `Projected monthly spending is $${avgMonthlySpending.toFixed(2)}, which may exceed your budget.`,
        severity: 'high',
        confidence: 80,
        timestamp: now,
        actionable: true,
        suggestedAction: 'Review your monthly budget and consider reducing discretionary spending.'
      });
    }
  }

  // Detect anomalies in spending patterns
  private detectAnomalies(patterns: SpendingPattern[]): void {
    patterns.forEach(pattern => {
      // Detect unusual spending spikes
      if (pattern.averageAmount > 200 && pattern.visitCount > 5) {
        this.addInsight({
          id: `anomaly_${pattern.merchant}_${Date.now()}`,
          type: 'pattern_anomaly',
          title: `Unusual Spending Pattern at ${pattern.merchant}`,
          description: `High average spending of $${pattern.averageAmount.toFixed(2)} with ${pattern.visitCount} visits.`,
          severity: 'medium',
          confidence: 75,
          timestamp: Date.now(),
          actionable: true,
          suggestedAction: 'Review spending at this merchant and consider setting spending caps.'
        });
      }

      // Detect frequency anomalies
      const daysSinceLastVisit = (Date.now() - pattern.lastVisit) / (1000 * 60 * 60 * 24);
      if (pattern.visitCount > 10 && daysSinceLastVisit < 1) {
        this.addInsight({
          id: `frequency_${pattern.merchant}_${Date.now()}`,
          type: 'pattern_anomaly',
          title: `Frequent Visits to ${pattern.merchant}`,
          description: `Multiple visits to ${pattern.merchant} in a short period.`,
          severity: 'high',
          confidence: 90,
          timestamp: Date.now(),
          actionable: true,
          suggestedAction: 'Consider if these visits are necessary or if spending is getting out of control.'
        });
      }
    });
  }

  // Generate predictions
  private generatePredictions(patterns: SpendingPattern[]): void {
    if (patterns.length === 0) return;

    // Calculate more accurate spending predictions
    const now = Date.now();
    const lastWeek = now - (7 * 24 * 60 * 60 * 1000);
    
    // Calculate recent weekly spending
    const recentSpending = patterns.reduce((sum, pattern) => {
      const daysSinceLastVisit = (now - pattern.lastVisit) / (1000 * 60 * 60 * 24);
      if (daysSinceLastVisit <= 7) {
        const estimatedWeeklyVisits = Math.min(7, pattern.visitCount * (7 / Math.max(1, daysSinceLastVisit)));
        return sum + (estimatedWeeklyVisits * pattern.averageAmount);
      }
      return sum;
    }, 0);

    // Calculate trend factor based on recent vs historical spending
    const historicalSpending = patterns.reduce((sum, pattern) => sum + pattern.totalSpent, 0);
    const historicalWeekly = historicalSpending / Math.max(patterns.length, 1);
    const trendFactor = recentSpending > 0 ? recentSpending / Math.max(historicalWeekly, 1) : 1.0;
    
    // Predict next week's spending with trend adjustment
    const basePrediction = recentSpending > 0 ? recentSpending : historicalWeekly;
    const trendAdjustedPrediction = basePrediction * Math.min(1.5, Math.max(0.5, trendFactor));
    
    this.addPrediction({
      type: 'spending_forecast',
      value: trendAdjustedPrediction,
      confidence: Math.min(95, 60 + (patterns.length * 5)), // Confidence based on data points
      timeframe: 'next_week',
      factors: [
        `Recent spending: $${recentSpending.toFixed(2)}`,
        `Historical average: $${historicalWeekly.toFixed(2)}`,
        `Trend factor: ${trendFactor.toFixed(2)}x`
      ]
    });

    // Predict high-risk merchant visits with better probability calculation
    const highRiskMerchants = patterns.filter(p => p.riskLevel === 'high');
    if (highRiskMerchants.length > 0) {
      // Calculate visit probability based on frequency and recency
      const avgVisitFrequency = highRiskMerchants.reduce((sum, p) => {
        const daysSinceLastVisit = (now - p.lastVisit) / (1000 * 60 * 60 * 24);
        return sum + (p.visitCount / Math.max(1, daysSinceLastVisit));
      }, 0) / highRiskMerchants.length;

      const visitProbability = Math.min(0.9, Math.max(0.1, avgVisitFrequency / 7)); // Normalize to weekly probability
      
      this.addPrediction({
        type: 'merchant_visit_probability',
        value: visitProbability,
        confidence: Math.min(90, 50 + (highRiskMerchants.length * 10)),
        timeframe: 'next_3_days',
        factors: [
          `Visit frequency: ${avgVisitFrequency.toFixed(2)}/day`,
          `High-risk merchants: ${highRiskMerchants.length}`,
          `Average spending: $${(highRiskMerchants.reduce((sum, p) => sum + p.averageAmount, 0) / highRiskMerchants.length).toFixed(2)}`
        ]
      });
    }

    // Predict risk level for next transaction
    const avgRiskLevel = patterns.reduce((sum, p) => {
      const riskScore = p.riskLevel === 'high' ? 3 : p.riskLevel === 'medium' ? 2 : 1;
      return sum + riskScore;
    }, 0) / patterns.length;

    this.addPrediction({
      type: 'risk_prediction',
      value: avgRiskLevel,
      confidence: 70,
      timeframe: 'next_transaction',
      factors: [
        `Average merchant risk: ${avgRiskLevel.toFixed(1)}/3`,
        `High-risk merchants: ${highRiskMerchants.length}`,
        `Total patterns: ${patterns.length}`
      ]
    });
  }

  // Identify complex patterns
  private identifyComplexPatterns(patterns: SpendingPattern[]): void {
    // Time-based patterns
    const timePatterns = this.analyzeTimePatterns(patterns);
    if (timePatterns.length > 0) {
      this.addInsight({
        id: `time_pattern_${Date.now()}`,
        type: 'spending_trend',
        title: 'Time-Based Spending Pattern Detected',
        description: `Spending patterns show ${timePatterns[0]} behavior.`,
        severity: 'low',
        confidence: 80,
        timestamp: Date.now(),
        actionable: false
      });
    }

    // Location-based patterns
    const locationPatterns = this.analyzeLocationPatterns(patterns);
    if (locationPatterns.length > 0) {
      this.addInsight({
        id: `location_pattern_${Date.now()}`,
        type: 'spending_trend',
        title: 'Location-Based Spending Pattern Detected',
        description: `Spending is concentrated in specific areas.`,
        severity: 'low',
        confidence: 75,
        timestamp: Date.now(),
        actionable: false
      });
    }
  }

  // Analyze behavioral patterns
  private analyzeBehavioralPatterns(patterns: SpendingPattern[]): void {
    // Impulse buying detection
    const impulseMerchants = patterns.filter(p => 
      p.averageAmount > 50 && p.visitCount > 3 && p.riskLevel === 'high'
    );

    if (impulseMerchants.length > 0) {
      this.addInsight({
        id: `impulse_${Date.now()}`,
        type: 'recommendation',
        title: 'Potential Impulse Buying Detected',
        description: `Multiple merchants show signs of impulse buying behavior.`,
        severity: 'medium',
        confidence: 70,
        timestamp: Date.now(),
        actionable: true,
        suggestedAction: 'Consider implementing a 24-hour cooling-off period for purchases over $50.'
      });
    }
  }

  // Update risk models
  private updateRiskModels(patterns: SpendingPattern[]): void {
    // Dynamic risk threshold adjustment
    const avgSpending = patterns.reduce((sum, p) => sum + p.averageAmount, 0) / patterns.length;
    
    if (avgSpending > 100) {
      this.addInsight({
        id: `risk_model_${Date.now()}`,
        type: 'recommendation',
        title: 'Risk Model Updated',
        description: 'Risk thresholds have been adjusted based on your spending patterns.',
        severity: 'low',
        confidence: 85,
        timestamp: Date.now(),
        actionable: false
      });
    }
  }

  // Generate strategic insights
  private generateStrategicInsights(patterns: SpendingPattern[]): void {
    // Budget optimization suggestions
    const totalSpending = patterns.reduce((sum, p) => sum + p.totalSpent, 0);
    const categoryBreakdown = this.categorizeSpending(patterns);

    if (categoryBreakdown.food > totalSpending * 0.4) {
      this.addInsight({
        id: `budget_${Date.now()}`,
        type: 'recommendation',
        title: 'Food Spending Optimization',
        description: `Food spending represents ${(categoryBreakdown.food / totalSpending * 100).toFixed(1)}% of total spending.`,
        severity: 'medium',
        confidence: 80,
        timestamp: Date.now(),
        actionable: true,
        suggestedAction: 'Consider meal planning or cooking at home to reduce food expenses.'
      });
    }
  }

  // Execute autonomous actions
  private executeAutonomousActions(): void {
    const recentInsights = this.insights.filter(i => 
      Date.now() - i.timestamp < 300000 && i.severity === 'critical'
    );

    recentInsights.forEach(insight => {
      if (insight.confidence > this.decisionThreshold) {
        this.createAutonomousAction(insight);
      }
    });
  }

  // Create autonomous action
  private createAutonomousAction(insight: AIInsight): void {
    const action: AutonomousAction = {
      id: `action_${Date.now()}`,
      type: 'auto_alert',
      description: `Autonomous action triggered by: ${insight.title}`,
      executed: false,
      timestamp: Date.now(),
      parameters: { insightId: insight.id }
    };

    this.autonomousActions.push(action);
    this.executeAction(action);
  }

  // Execute an action
  private executeAction(action: AutonomousAction): void {
    console.log(`🤖 Executing autonomous action: ${action.description}`);
    
    // Simulate action execution
    setTimeout(() => {
      action.executed = true;
      console.log(`✅ Action executed: ${action.description}`);
    }, 1000);
  }

  // Helper methods
  private analyzeTimePatterns(patterns: SpendingPattern[]): string[] {
    // Simplified time pattern analysis
    return ['evening_spending', 'weekend_splurges'];
  }

  private analyzeLocationPatterns(patterns: SpendingPattern[]): string[] {
    // Simplified location pattern analysis
    return ['downtown_concentration', 'mall_visits'];
  }

  private categorizeSpending(patterns: SpendingPattern[]): { [key: string]: number } {
    // Simplified categorization
    return {
      food: patterns.filter(p => p.merchant.includes('Starbucks') || p.merchant.includes('McDonald')).reduce((sum, p) => sum + p.totalSpent, 0),
      shopping: patterns.filter(p => p.merchant.includes('Target') || p.merchant.includes('Amazon')).reduce((sum, p) => sum + p.totalSpent, 0),
      transportation: patterns.filter(p => p.merchant.includes('Shell') || p.merchant.includes('Uber')).reduce((sum, p) => sum + p.totalSpent, 0)
    };
  }

  // Public methods
  addInsight(insight: AIInsight): void {
    this.insights.push(insight);
    console.log(`🧠 AI Insight: ${insight.title} (${insight.severity})`);
  }

  addPrediction(prediction: AIPrediction): void {
    this.predictions.push(prediction);
    console.log(`🔮 AI Prediction: ${prediction.type} - ${prediction.value} (${prediction.confidence}% confidence)`);
  }

  getInsights(): AIInsight[] {
    return [...this.insights];
  }

  getPredictions(): AIPrediction[] {
    return [...this.predictions];
  }

  getAutonomousActions(): AutonomousAction[] {
    return [...this.autonomousActions];
  }

  // Enhanced risk assessment with AI
  assessRiskWithAI(amount: number, merchant: string, category: string, location?: Location): RiskAssessment {
    const baseAssessment = this.financialBodyguard.assessRisk(amount, merchant, category, location);
    
    // Enhance with AI insights
    const relevantInsights = this.insights.filter(i => 
      i.type === 'pattern_anomaly' && i.description.includes(merchant)
    );

    if (relevantInsights.length > 0) {
      baseAssessment.score += 10; // Increase risk score
      baseAssessment.factors.push({
        type: 'history',
        severity: 'medium',
        message: `AI detected unusual patterns at ${merchant}`,
        weight: 15
      });
    }

    return baseAssessment;
  }
}

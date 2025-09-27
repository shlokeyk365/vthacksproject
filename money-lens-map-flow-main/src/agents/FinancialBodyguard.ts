export interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}

export interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  category: string;
  timestamp: number;
  location?: Location;
}

export interface RiskFactor {
  type: 'location' | 'history' | 'time' | 'amount' | 'frequency';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  weight: number;
}

export interface RiskAssessment {
  score: number; // 0-100
  level: 'safe' | 'caution' | 'warning' | 'danger' | 'critical';
  factors: RiskFactor[];
  recommendation: string;
  action: 'allow' | 'warn' | 'block' | 'require_approval';
}

export interface SpendingPattern {
  merchant: string;
  totalSpent: number;
  visitCount: number;
  averageAmount: number;
  lastVisit: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export class FinancialBodyguard {
  private spendingHistory: Transaction[] = [];
  private spendingPatterns: Map<string, SpendingPattern> = new Map();
  private highRiskMerchants: Set<string> = new Set();
  private userPreferences: {
    dailyLimit: number;
    weeklyLimit: number;
    monthlyLimit: number;
    enableLocationTracking: boolean;
    enableRealTimeAlerts: boolean;
  } = {
    dailyLimit: 200,
    weeklyLimit: 1000,
    monthlyLimit: 4000,
    enableLocationTracking: true,
    enableRealTimeAlerts: true
  };

  constructor() {
    this.loadUserPreferences();
  }

  // Load user preferences from localStorage
  private loadUserPreferences(): void {
    try {
      const saved = localStorage.getItem('financialBodyguardPrefs');
      if (saved) {
        this.userPreferences = { ...this.userPreferences, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.warn('Failed to load user preferences:', error);
    }
  }

  // Save user preferences to localStorage
  private saveUserPreferences(): void {
    try {
      localStorage.setItem('financialBodyguardPrefs', JSON.stringify(this.userPreferences));
    } catch (error) {
      console.warn('Failed to save user preferences:', error);
    }
  }

  // Add a new transaction to history
  addTransaction(transaction: Transaction): void {
    this.spendingHistory.push(transaction);
    this.updateSpendingPatterns(transaction);
    this.analyzeRiskPatterns();
  }

  // Update spending patterns for a merchant
  private updateSpendingPatterns(transaction: Transaction): void {
    const merchant = transaction.merchant;
    const existing = this.spendingPatterns.get(merchant) || {
      merchant,
      totalSpent: 0,
      visitCount: 0,
      averageAmount: 0,
      lastVisit: 0,
      riskLevel: 'low' as const
    };

    existing.totalSpent += transaction.amount;
    existing.visitCount += 1;
    existing.averageAmount = existing.totalSpent / existing.visitCount;
    existing.lastVisit = transaction.timestamp;

    // Calculate risk level based on spending patterns
    existing.riskLevel = this.calculateMerchantRiskLevel(existing);

    this.spendingPatterns.set(merchant, existing);
  }

  // Calculate risk level for a merchant
  private calculateMerchantRiskLevel(pattern: SpendingPattern): 'low' | 'medium' | 'high' {
    const daysSinceLastVisit = (Date.now() - pattern.lastVisit) / (1000 * 60 * 60 * 24);
    const weeklySpending = this.getWeeklySpending(pattern.merchant);
    const monthlySpending = this.getMonthlySpending(pattern.merchant);

    // High risk if: frequent visits, high amounts, or recent overspending
    if (pattern.visitCount > 10 && pattern.averageAmount > 50) return 'high';
    if (weeklySpending > this.userPreferences.weeklyLimit * 0.5) return 'high';
    if (monthlySpending > this.userPreferences.monthlyLimit * 0.3) return 'high';
    if (pattern.averageAmount > 100) return 'medium';
    if (pattern.visitCount > 5) return 'medium';
    
    return 'low';
  }

  // Get weekly spending for a merchant
  private getWeeklySpending(merchant: string): number {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return this.spendingHistory
      .filter(t => t.merchant === merchant && t.timestamp >= weekAgo)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // Get monthly spending for a merchant
  private getMonthlySpending(merchant: string): number {
    const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    return this.spendingHistory
      .filter(t => t.merchant === merchant && t.timestamp >= monthAgo)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // Analyze risk patterns and update high-risk merchants
  private analyzeRiskPatterns(): void {
    this.highRiskMerchants.clear();
    
    for (const [merchant, pattern] of this.spendingPatterns) {
      if (pattern.riskLevel === 'high') {
        this.highRiskMerchants.add(merchant);
      }
    }
  }

  // Assess risk for a potential transaction
  assessRisk(
    amount: number,
    merchant: string,
    category: string,
    userLocation?: Location
  ): RiskAssessment {
    const factors: RiskFactor[] = [];
    let totalScore = 0;

    // Factor 1: Amount-based risk
    const amountRisk = this.assessAmountRisk(amount);
    factors.push(amountRisk);
    totalScore += amountRisk.weight * this.getSeverityWeight(amountRisk.severity);

    // Factor 2: Merchant-based risk
    const merchantRisk = this.assessMerchantRisk(merchant);
    factors.push(merchantRisk);
    totalScore += merchantRisk.weight * this.getSeverityWeight(merchantRisk.severity);

    // Factor 3: Location-based risk
    if (userLocation) {
      const locationRisk = this.assessLocationRisk(userLocation, merchant);
      factors.push(locationRisk);
      totalScore += locationRisk.weight * this.getSeverityWeight(locationRisk.severity);
    }

    // Factor 4: Time-based risk
    const timeRisk = this.assessTimeRisk();
    factors.push(timeRisk);
    totalScore += timeRisk.weight * this.getSeverityWeight(timeRisk.severity);

    // Factor 5: Frequency-based risk
    const frequencyRisk = this.assessFrequencyRisk(merchant);
    factors.push(frequencyRisk);
    totalScore += frequencyRisk.weight * this.getSeverityWeight(frequencyRisk.severity);

    // Calculate final risk level
    const riskLevel = this.calculateRiskLevel(totalScore);
    const recommendation = this.generateRecommendation(riskLevel, factors);
    const action = this.determineAction(riskLevel, totalScore);

    return {
      score: Math.min(100, Math.max(0, totalScore)),
      level: riskLevel,
      factors,
      recommendation,
      action
    };
  }

  // Assess amount-based risk
  private assessAmountRisk(amount: number): RiskFactor {
    const dailySpent = this.getDailySpending();
    const weeklySpent = this.getTotalWeeklySpending();
    const monthlySpent = this.getTotalMonthlySpending();

    if (amount > this.userPreferences.dailyLimit) {
      return {
        type: 'amount',
        severity: 'critical',
        message: `Transaction amount ($${amount}) exceeds daily limit ($${this.userPreferences.dailyLimit})`,
        weight: 30
      };
    }

    if (amount > this.userPreferences.weeklyLimit * 0.3) {
      return {
        type: 'amount',
        severity: 'high',
        message: `Transaction amount ($${amount}) is high relative to weekly limit`,
        weight: 20
      };
    }

    if (amount > this.userPreferences.monthlyLimit * 0.1) {
      return {
        type: 'amount',
        severity: 'medium',
        message: `Transaction amount ($${amount}) is moderate relative to monthly limit`,
        weight: 10
      };
    }

    return {
      type: 'amount',
      severity: 'low',
      message: `Transaction amount ($${amount}) is within safe limits`,
      weight: 5
    };
  }

  // Assess merchant-based risk
  private assessMerchantRisk(merchant: string): RiskFactor {
    const pattern = this.spendingPatterns.get(merchant);
    
    if (this.highRiskMerchants.has(merchant)) {
      return {
        type: 'history',
        severity: 'high',
        message: `Merchant "${merchant}" has a history of high spending`,
        weight: 25
      };
    }

    if (pattern && pattern.riskLevel === 'medium') {
      return {
        type: 'history',
        severity: 'medium',
        message: `Merchant "${merchant}" has moderate spending history`,
        weight: 15
      };
    }

    return {
      type: 'history',
      severity: 'low',
      message: `Merchant "${merchant}" has safe spending history`,
      weight: 5
    };
  }

  // Assess location-based risk
  private assessLocationRisk(location: Location, merchant: string): RiskFactor {
    // For MVP, we'll use simple distance-based logic
    // In a real implementation, this would use geofencing
    const nearbyMerchants = this.findNearbyMerchants(location);
    
    if (nearbyMerchants.length > 0) {
      return {
        type: 'location',
        severity: 'medium',
        message: `You're near ${nearbyMerchants.length} known merchant(s)`,
        weight: 10
      };
    }

    return {
      type: 'location',
      severity: 'low',
      message: 'Location appears safe for spending',
      weight: 5
    };
  }

  // Assess time-based risk
  private assessTimeRisk(): RiskFactor {
    const hour = new Date().getHours();
    const day = new Date().getDay();

    // High risk during late night/early morning
    if (hour >= 22 || hour <= 6) {
      return {
        type: 'time',
        severity: 'high',
        message: 'Late night/early morning spending is typically higher risk',
        weight: 15
      };
    }

    // Medium risk on weekends
    if (day === 0 || day === 6) {
      return {
        type: 'time',
        severity: 'medium',
        message: 'Weekend spending patterns may be different',
        weight: 8
      };
    }

    return {
      type: 'time',
      severity: 'low',
      message: 'Time of day appears safe for spending',
      weight: 5
    };
  }

  // Assess frequency-based risk
  private assessFrequencyRisk(merchant: string): RiskFactor {
    const recentTransactions = this.spendingHistory.filter(
      t => t.merchant === merchant && (Date.now() - t.timestamp) < (24 * 60 * 60 * 1000)
    );

    if (recentTransactions.length >= 3) {
      return {
        type: 'frequency',
        severity: 'high',
        message: `Multiple transactions at "${merchant}" in the last 24 hours`,
        weight: 20
      };
    }

    if (recentTransactions.length >= 2) {
      return {
        type: 'frequency',
        severity: 'medium',
        message: `Multiple transactions at "${merchant}" recently`,
        weight: 10
      };
    }

    return {
      type: 'frequency',
      severity: 'low',
      message: 'Transaction frequency appears normal',
      weight: 5
    };
  }

  // Find nearby merchants (simplified for MVP)
  private findNearbyMerchants(location: Location): string[] {
    // This would normally use geofencing or distance calculations
    // For MVP, we'll return a simple list
    return ['Starbucks', 'Target', 'Kroger'];
  }

  // Calculate risk level from score
  private calculateRiskLevel(score: number): 'safe' | 'caution' | 'warning' | 'danger' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'danger';
    if (score >= 40) return 'warning';
    if (score >= 20) return 'caution';
    return 'safe';
  }

  // Generate recommendation based on risk level
  private generateRecommendation(level: string, factors: RiskFactor[]): string {
    switch (level) {
      case 'critical':
        return '🚨 CRITICAL: This transaction poses significant financial risk. Consider alternatives or wait.';
      case 'danger':
        return '⚠️ DANGER: High risk transaction. Review your spending goals before proceeding.';
      case 'warning':
        return '⚠️ WARNING: Moderate risk detected. Consider if this purchase aligns with your budget.';
      case 'caution':
        return '💡 CAUTION: Low risk detected. Proceed with awareness of your spending patterns.';
      default:
        return '✅ SAFE: Transaction appears to be within normal spending patterns.';
    }
  }

  // Determine action based on risk level
  private determineAction(level: string, score: number): 'allow' | 'warn' | 'block' | 'require_approval' {
    if (level === 'critical' || score >= 90) return 'block';
    if (level === 'danger' || score >= 70) return 'require_approval';
    if (level === 'warning' || score >= 50) return 'warn';
    return 'allow';
  }

  // Get severity weight for scoring
  private getSeverityWeight(severity: string): number {
    switch (severity) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 1;
    }
  }

  // Get daily spending
  private getDailySpending(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    
    return this.spendingHistory
      .filter(t => t.timestamp >= todayStart)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // Get total weekly spending
  private getTotalWeeklySpending(): number {
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return this.spendingHistory
      .filter(t => t.timestamp >= weekAgo)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // Get total monthly spending
  private getTotalMonthlySpending(): number {
    const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    return this.spendingHistory
      .filter(t => t.timestamp >= monthAgo)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  // Get spending patterns
  getSpendingPatterns(): SpendingPattern[] {
    return Array.from(this.spendingPatterns.values());
  }

  // Get high-risk merchants
  getHighRiskMerchants(): string[] {
    return Array.from(this.highRiskMerchants);
  }

  // Update user preferences
  updatePreferences(newPrefs: Partial<typeof this.userPreferences>): void {
    this.userPreferences = { ...this.userPreferences, ...newPrefs };
    this.saveUserPreferences();
  }

  // Get current preferences
  getPreferences() {
    return { ...this.userPreferences };
  }
}

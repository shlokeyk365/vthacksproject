import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  AreaChart,
  Sparkles,
  Download,
  RefreshCw,
  Eye,
  Settings,
  Brain,
  Lightbulb,
  Zap,
  FileText,
  AlertTriangle,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Activity,
  Calendar
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { 
  AreaChart as RechartsAreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { getCategoryBrandColor } from '@/lib/brandColors';
import { useCategoryBreakdown, useSpendingTrends } from '@/hooks/useApi';

interface AutoVisualizationAgentProps {
  className?: string;
}

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface AIInsight {
  type: 'summary' | 'anomaly' | 'trend';
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high';
  icon: React.ComponentType<any>;
  color: string;
}

interface AnomalyData {
  category: string;
  amount: number;
  date: string;
  deviation: number;
  description: string;
}

interface VisualizationConfig {
  chartType: 'bar' | 'pie' | 'line' | 'area';
  categories: string[];
  period: string;
  title: string;
}

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
  { value: 'pie', label: 'Pie Chart', icon: PieChart },
  { value: 'line', label: 'Line Chart', icon: TrendingUp },
  { value: 'area', label: 'Area Chart', icon: AreaChart },
];

const PERIODS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 3 months' },
  { value: '180', label: 'Last 6 months' },
  { value: '365', label: 'Last year' },
];

const AVAILABLE_CATEGORIES = [
  'Dining', 'Shopping', 'Transport', 'Entertainment', 
  'Utilities', 'Healthcare', 'Education', 'Travel', 'Other'
];

export function AutoVisualizationAgent({ className }: AutoVisualizationAgentProps) {
  const [config, setConfig] = useState<VisualizationConfig>({
    chartType: 'bar',
    categories: ['Dining', 'Shopping', 'Transport', 'Entertainment', 'Utilities', 'Healthcare'],
    period: '30',
    title: 'Spending Analysis'
  });
  
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [recommendedChartType, setRecommendedChartType] = useState<string | null>(null);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyData[]>([]);
  
  // Use the individual hooks
  const { data: categoryBreakdownData, isLoading: isCategoryLoading } = useCategoryBreakdown(config.period);
  const { data: spendingTrendsData, isLoading: isTrendsLoading } = useSpendingTrends(config.period);

  // AI Summary Insights Generation
  const generateAISummary = (data: ChartData[], categories: string[], period: string): AIInsight[] => {
    const insights: AIInsight[] = [];
    
    if (data.length === 0) return insights;

    // Calculate total spending
    const totalSpending = data.reduce((sum, item) => sum + item.value, 0);
    const topCategory = data.reduce((max, item) => item.value > max.value ? item : max, data[0]);
    const avgSpending = totalSpending / data.length;

    // Generate spending trend insights
    if (data.length > 1) {
      const sortedData = [...data].sort((a, b) => b.value - a.value);
      const topTwo = sortedData.slice(0, 2);
      const percentage = ((topTwo[0].value / totalSpending) * 100).toFixed(0);
      
      insights.push({
        type: 'summary',
        title: 'Spending Breakdown',
        description: `Your ${topTwo[0].name} spending represents ${percentage}% of total expenses, followed by ${topTwo[1].name} at ${((topTwo[1].value / totalSpending) * 100).toFixed(0)}%.`,
        icon: FileText,
        color: 'text-blue-600'
      });
    }

    // Generate period-based insights
    const periodDays = parseInt(period);
    const dailyAverage = totalSpending / periodDays;
    
    if (dailyAverage > 50) {
      insights.push({
        type: 'trend',
        title: 'High Spending Alert',
        description: `You're averaging $${dailyAverage.toFixed(2)} per day over the last ${periodDays} days. Consider reviewing your spending patterns.`,
        icon: TrendingUpIcon,
        color: 'text-orange-600'
      });
    } else if (dailyAverage < 20) {
      insights.push({
        type: 'trend',
        title: 'Conservative Spending',
        description: `Great job! You're maintaining a healthy spending average of $${dailyAverage.toFixed(2)} per day.`,
        icon: TrendingDown,
        color: 'text-green-600'
      });
    }

    // Category-specific insights
    if (topCategory.value > totalSpending * 0.4) {
      insights.push({
        type: 'summary',
        title: 'Category Focus',
        description: `${topCategory.name} dominates your spending at ${((topCategory.value / totalSpending) * 100).toFixed(0)}%. Consider diversifying your expenses.`,
        icon: Activity,
        color: 'text-purple-600'
      });
    }

    return insights;
  };

  // Anomaly Detection Algorithm
  const detectAnomalies = (data: ChartData[]): AnomalyData[] => {
    const anomalies: AnomalyData[] = [];
    
    if (data.length < 3) return anomalies;

    // Calculate statistical measures
    const values = data.map(item => item.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    const threshold = mean + (2 * standardDeviation); // 2-sigma rule

    // Detect anomalies
    data.forEach(item => {
      if (item.value > threshold) {
        const deviation = ((item.value - mean) / mean) * 100;
        anomalies.push({
          category: item.name,
          amount: item.value,
          date: new Date().toISOString().split('T')[0],
          deviation: Math.round(deviation),
          description: `Unusual spike detected: ${item.name} spending is ${Math.round(deviation)}% above average`
        });
      }
    });

    return anomalies;
  };

  // Generate AI insights when data changes
  useEffect(() => {
    if (chartData.length > 0) {
      const insights = generateAISummary(chartData, config.categories, config.period);
      const detectedAnomalies = detectAnomalies(chartData);
      
      setAiInsights(insights);
      setAnomalies(detectedAnomalies);
    }
  }, [chartData, config.categories, config.period]);

  // Auto-recommendation logic
  const getRecommendedChartType = (data: ChartData[], categories: string[], period: string) => {
    if (data.length === 0) return null;
    
    // Analyze data characteristics
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    const hasTimeSeries = period !== '7' && data.length > 3;
    const isComparison = categories.length > 1 && categories.length <= 5;
    const isShareAnalysis = categories.length >= 3;
    
    // Recommendation rules
    if (isShareAnalysis && categories.length >= 3) {
      return 'pie'; // Best for showing category shares/percentages
    } else if (hasTimeSeries && categories.length <= 3) {
      return 'line'; // Best for trends over time
    } else if (isComparison && categories.length <= 4) {
      return 'bar'; // Best for direct comparisons
    } else if (hasTimeSeries && categories.length > 3) {
      return 'area'; // Best for multiple trends over time
    } else {
      return 'bar'; // Default fallback
    }
  };

  // Generate recommendation when data changes
  useEffect(() => {
    if (chartData.length > 0) {
      const recommendation = getRecommendedChartType(chartData, config.categories, config.period);
      setRecommendedChartType(recommendation);
      setShowRecommendation(true);
    }
  }, [chartData, config.categories, config.period]);

  // Generate chart data based on configuration
  const generateVisualization = () => {
    setIsGenerating(true);
    
    try {
      let data: ChartData[] = [];
      
      if (config.chartType === 'pie' || config.chartType === 'bar') {
        // Use category breakdown data
        if (categoryBreakdownData) {
          data = categoryBreakdownData
            .filter(item => config.categories.includes(item.category))
            .map(item => ({
              name: item.category,
              value: item.amount,
              color: item.color
            }));
        }
      } else {
        // Use spending trends data for line/area charts
        if (spendingTrendsData) {
          data = spendingTrendsData
            .filter(item => config.categories.includes(item.category))
            .map(item => ({
              name: item.category,
              value: item.amount,
              color: getCategoryBrandColor(item.category)
            }));
        }
      }
      
      setChartData(data);
    } catch (error) {
      console.error('Error generating visualization:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Auto-generate on config change or data change
  useEffect(() => {
    if (config.categories.length > 0 && (categoryBreakdownData || spendingTrendsData)) {
      generateVisualization();
    }
  }, [config, categoryBreakdownData, spendingTrendsData]);

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select categories to generate visualization</p>
          </div>
        </div>
      );
    }

    const chartConfig = chartData.reduce((acc, item) => {
      acc[item.name.toLowerCase()] = {
        label: item.name,
        color: item.color || getCategoryBrandColor(item.name)
      };
      return acc;
    }, {} as any);

    switch (config.chartType) {
      case 'bar':
        return (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />} 
                animationDuration={0}
                isAnimationActive={false}
              />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ChartContainer>
        );

      case 'pie':
        return (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <RechartsPieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip 
                content={<ChartTooltipContent />} 
                animationDuration={0}
                isAnimationActive={false}
              />
            </RechartsPieChart>
          </ChartContainer>
        );

      case 'line':
        return (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <LineChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />} 
                animationDuration={0}
                isAnimationActive={false}
              />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        );

      case 'area':
        return (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <RechartsAreaChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />} 
                animationDuration={0}
                isAnimationActive={false}
              />
              <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            </RechartsAreaChart>
          </ChartContainer>
        );

      default:
        return null;
    }
  };

  const toggleCategory = (category: string) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const applyRecommendation = () => {
    if (recommendedChartType) {
      setConfig(prev => ({
        ...prev,
        chartType: recommendedChartType as any
      }));
      setShowRecommendation(false);
    }
  };

  const getRecommendationReason = (chartType: string, categories: string[], period: string) => {
    const categoryCount = categories.length;
    const isLongPeriod = parseInt(period) > 30;
    
    switch (chartType) {
      case 'pie':
        return `Perfect for showing ${categoryCount} category shares and proportions`;
      case 'line':
        return `Ideal for tracking trends over ${isLongPeriod ? 'extended' : 'short'} time periods`;
      case 'bar':
        return `Great for comparing ${categoryCount} categories side-by-side`;
      case 'area':
        return `Excellent for visualizing multiple trends over time`;
      default:
        return 'Recommended based on your data characteristics';
    }
  };

  const downloadChart = () => {
    // Implementation for downloading chart as image
    console.log('Download chart functionality');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="card-gradient border-2 border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Auto Visualization Agent
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Settings className="w-4 h-4" />
                {isExpanded ? 'Hide' : 'Configure'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateVisualization}
                disabled={isGenerating}
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : 'Refresh'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadChart}
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Configuration Panel */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 p-4 bg-muted/50 rounded-lg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chart Type Selection */}
                <div className="space-y-2">
                  <Label>Chart Type</Label>
                  <Select
                    value={config.chartType}
                    onValueChange={(value: any) => setConfig(prev => ({ ...prev, chartType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHART_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Period Selection */}
                <div className="space-y-2">
                  <Label>Time Period</Label>
                  <Select
                    value={config.period}
                    onValueChange={(value) => setConfig(prev => ({ ...prev, period: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIODS.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_CATEGORIES.map((category) => (
                    <Badge
                      key={category}
                      variant={config.categories.includes(category) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => toggleCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Custom Title */}
              <div className="space-y-2">
                <Label>Chart Title</Label>
                <Input
                  value={config.title}
                  onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter custom chart title"
                />
              </div>
            </motion.div>
          )}

          {/* Chart Display */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{config.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                {chartData.length} categories
              </div>
            </div>
            
            {renderChart()}
          </div>

          {/* AI Summary Insights - Compact */}
          {aiInsights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold">AI Insights</h4>
              </div>
              
              <div className="space-y-2">
                {aiInsights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-blue-800 bg-blue-900/20 hover:border-white hover:ring-2 hover:ring-white rounded-lg p-3 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <insight.icon className={`w-4 h-4 ${insight.color}`} />
                      <span className="text-sm font-medium text-blue-100">
                        {insight.title}:
                      </span>
                      <span className="text-sm text-blue-200">
                        {insight.description}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Anomaly Detection - Compact */}
          {anomalies.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <h4 className="text-sm font-semibold">Anomalies</h4>
                <Badge variant="destructive" className="text-xs">
                  {anomalies.length}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {anomalies.map((anomaly, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-orange-800 bg-orange-900/20 hover:border-white hover:ring-2 hover:ring-white rounded-lg p-3 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-medium text-orange-100">
                          {anomaly.category} +{anomaly.deviation}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-orange-200">
                        <span>${anomaly.amount.toFixed(2)}</span>
                        <span>•</span>
                        <span>{anomaly.date}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Smart Recommendation - Compact */}
          {showRecommendation && recommendedChartType && recommendedChartType !== config.chartType && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border-blue-800 bg-blue-900/20 hover:border-white hover:ring-2 hover:ring-white rounded-lg p-3 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-100">
                    Try {CHART_TYPES.find(t => t.value === recommendedChartType)?.label}?
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={applyRecommendation}
                    className="h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs"
                  >
                    <Zap className="w-3 h-3 mr-1" />
                    Apply
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowRecommendation(false)}
                    className="h-7 px-2 text-blue-300 hover:text-blue-100 hover:bg-blue-800/30"
                  >
                    ×
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chart Type Selector - Clean */}
          <div className="flex items-center gap-1 pt-4 border-t">
            <span className="text-sm text-muted-foreground mr-2">Chart:</span>
            {CHART_TYPES.map((type) => (
              <Button
                key={type.value}
                variant={config.chartType === type.value ? "default" : "ghost"}
                size="sm"
                onClick={() => setConfig(prev => ({ ...prev, chartType: type.value as any }))}
                className={`h-8 px-3 text-xs ${
                  config.chartType === type.value 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-muted'
                }`}
              >
                <type.icon className="w-3 h-3 mr-1" />
                {type.label}
              </Button>
            ))}
            {recommendedChartType && recommendedChartType !== config.chartType && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfig(prev => ({ ...prev, chartType: recommendedChartType as any }))}
                className="h-8 px-3 text-xs border-blue-800 bg-blue-900/20 text-blue-100 hover:border-white hover:ring-2 hover:ring-white hover:bg-blue-800/30"
              >
                <Brain className="w-3 h-3 mr-1" />
                Smart
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

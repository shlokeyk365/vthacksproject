import { motion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  AlertTriangle,
  Eye,
  Lightbulb,
  TrendingUp as TrendingUpIcon,
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  LineChart
} from "recharts";

const monthlyData = [
  { month: "Jan", dining: 486, shopping: 329, transport: 245, utilities: 187 },
  { month: "Feb", dining: 523, shopping: 287, transport: 267, utilities: 189 },
  { month: "Mar", dining: 445, shopping: 398, transport: 223, utilities: 192 },
  { month: "Apr", dining: 512, shopping: 356, transport: 289, utilities: 185 },
  { month: "May", dining: 478, shopping: 423, transport: 234, utilities: 188 },
  { month: "Jun", dining: 567, shopping: 389, transport: 278, utilities: 191 },
];

const topMerchants = [
  { name: "Amazon", amount: 892, visits: 12, category: "Shopping", color: "#3B82F6" },
  { name: "Target", amount: 523, visits: 8, category: "Shopping", color: "#10B981" },
  { name: "Shell", amount: 356, visits: 15, category: "Transport", color: "#F59E0B" },
  { name: "Starbucks", amount: 247, visits: 18, category: "Dining", color: "#EF4444" },
  { name: "McDonald's", amount: 189, visits: 14, category: "Dining", color: "#8B5CF6" },
];

// Ensure data is properly formatted for charts
const formattedMerchants = topMerchants.map(merchant => ({
  ...merchant,
  amount: Number(merchant.amount),
  visits: Number(merchant.visits)
}));

const spendingVsCaps = [
  { category: "Dining", spent: 486, cap: 500, target: 450 },
  { category: "Shopping", spent: 329, cap: 400, target: 350 },
  { category: "Transport", spent: 245, cap: 300, target: 250 },
  { category: "Utilities", spent: 187, cap: 200, target: 180 },
];

// Spending projection data for next 6 months
const spendingProjection = [
  { month: "Jul", actual: null, projected: 2847, trend: "increasing" },
  { month: "Aug", actual: null, projected: 2923, trend: "increasing" },
  { month: "Sep", actual: null, projected: 2987, trend: "increasing" },
  { month: "Oct", actual: null, projected: 3054, trend: "increasing" },
  { month: "Nov", actual: null, projected: 3121, trend: "increasing" },
  { month: "Dec", actual: null, projected: 3289, trend: "holiday_spike" },
];

const chartConfig = {
  dining: { label: "Dining", color: "#3B82F6" },
  shopping: { label: "Shopping", color: "#10B981" },
  transport: { label: "Transport", color: "#F59E0B" },
  utilities: { label: "Utilities", color: "#EF4444" },
};

const merchantsChartConfig = {
  amount: { label: "Amount Spent", color: "#3B82F6" },
};

const projectionChartConfig = {
  projected: { label: "Projected Spending", color: "#8B5CF6" },
  actual: { label: "Actual Spending", color: "#3B82F6" },
};

export default function Analytics() {
  const [isInsightsDialogOpen, setIsInsightsDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [isExporting, setIsExporting] = useState(false);

  // Comprehensive insights data
  const allInsights = [
    {
      id: 1,
      type: "alert",
      icon: AlertCircle,
      title: "Spending Pattern Alert",
      description: "Your dining expenses have increased 15% compared to last month. Consider setting a stricter cap to maintain your budget goals.",
      category: "Dining",
      impact: "High",
      recommendation: "Set dining cap to $400/month"
    },
    {
      id: 2,
      type: "success",
      icon: CheckCircle,
      title: "Savings Opportunity",
      description: "You're consistently under budget on transportation. You could reallocate $50/month to your savings goal.",
      category: "Transportation",
      impact: "Medium",
      recommendation: "Increase transportation cap by $50"
    },
    {
      id: 3,
      type: "warning",
      icon: AlertTriangle,
      title: "Budget Risk Warning",
      description: "Shopping expenses typically increase 20% in December. Consider adjusting your caps accordingly.",
      category: "Shopping",
      impact: "High",
      recommendation: "Prepare for holiday spending surge"
    },
    {
      id: 4,
      type: "info",
      icon: Info,
      title: "Spending Trend Analysis",
      description: "Your monthly spending has decreased by 8% over the past 3 months. Great job maintaining budget discipline!",
      category: "Overall",
      impact: "Positive",
      recommendation: "Continue current spending patterns"
    },
    {
      id: 5,
      type: "alert",
      icon: AlertCircle,
      title: "Merchant Concentration Risk",
      description: "45% of your spending is concentrated at just 3 merchants. Consider diversifying your spending for better budget control.",
      category: "Merchants",
      impact: "Medium",
      recommendation: "Set individual merchant spending limits"
    },
    {
      id: 6,
      type: "success",
      icon: TrendingUpIcon,
      title: "Goal Achievement",
      description: "You're on track to save $2,400 this year, exceeding your goal by $400. Consider increasing your savings target.",
      category: "Savings",
      impact: "High",
      recommendation: "Increase annual savings goal to $3,000"
    },
    {
      id: 7,
      type: "warning",
      icon: AlertTriangle,
      title: "Weekend Spending Spike",
      description: "Your weekend spending is 35% higher than weekdays. Monitor weekend activities to maintain budget balance.",
      category: "Timing",
      impact: "Medium",
      recommendation: "Set weekend-specific spending caps"
    },
    {
      id: 8,
      type: "info",
      icon: Lightbulb,
      title: "Optimization Opportunity",
      description: "Switching to bulk purchases for groceries could save you $80/month based on your current patterns.",
      category: "Groceries",
      impact: "High",
      recommendation: "Plan monthly bulk grocery trips"
    }
  ];

  // Handler functions
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    toast.success(`Analytics updated for ${getPeriodLabel(period)}`);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case "1month": return "Last Month";
      case "3months": return "Last 3 Months";
      case "6months": return "Last 6 Months";
      case "1year": return "Last Year";
      case "all": return "All Time";
      default: return "Last 6 Months";
    }
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;
      
      // Helper function to add new page if needed
      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
          return true;
        }
        return false;
      };
      
      // Helper function to draw a line
      const drawLine = (y: number) => {
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, y, pageWidth - 20, y);
      };
      
      // Header
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(50, 50, 50);
      pdf.text('Financial Analytics Report', 20, yPosition);
      yPosition += 15;
      
      // Date and time
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      const reportDate = new Date().toLocaleDateString();
      const currentTime = new Date().toLocaleTimeString();
      pdf.text(`Generated on ${reportDate} at ${currentTime}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Report Period: ${getPeriodLabel(selectedPeriod)}`, 20, yPosition);
      yPosition += 20;
      
      // Executive Summary
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(50, 50, 50);
      pdf.text('Executive Summary', 20, yPosition);
      yPosition += 10;
      
      drawLine(yPosition);
      yPosition += 5;
      
      // Summary metrics
      const summaryData = {
        totalSpending: 2847.50,
        averageMonthly: 474.58,
        topCategory: "Dining",
        topMerchant: "Starbucks Coffee",
        savingsRate: 12.5
      };
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Spending: $${summaryData.totalSpending.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Average Monthly Spending: $${summaryData.averageMonthly.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Top Spending Category: ${summaryData.topCategory}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Top Merchant: ${summaryData.topMerchant}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Savings Rate: ${summaryData.savingsRate}%`, 20, yPosition);
      yPosition += 15;
      
      // Key Insights
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Insights & Recommendations', 20, yPosition);
      yPosition += 10;
      
      drawLine(yPosition);
      yPosition += 5;
      
      // Add top insights
      const topInsights = allInsights.slice(0, 5);
      topInsights.forEach((insight, index) => {
        if (checkNewPage(20)) {
          yPosition = 20;
        }
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(50, 50, 50);
        pdf.text(`${index + 1}. ${insight.title}`, 20, yPosition);
        yPosition += 6;
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        const description = insight.description.length > 80 
          ? insight.description.substring(0, 77) + '...' 
          : insight.description;
        pdf.text(description, 20, yPosition);
        yPosition += 5;
        
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Category: ${insight.category} | Impact: ${insight.impact}`, 20, yPosition);
        yPosition += 4;
        pdf.text(`Recommendation: ${insight.recommendation}`, 20, yPosition);
        yPosition += 8;
      });
      
      yPosition += 10;
      
      // Spending Analysis
      if (checkNewPage(30)) {
        yPosition = 20;
      }
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Spending Analysis', 20, yPosition);
      yPosition += 10;
      
      drawLine(yPosition);
      yPosition += 5;
      
      // Monthly spending data
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Monthly Spending Trends:', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      monthlyData.forEach((month, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${month.month}: $${month.amount.toFixed(2)}`, 30, yPosition);
        yPosition += 5;
      });
      
      yPosition += 10;
      
      // Top Merchants
      if (checkNewPage(20)) {
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Top Merchants:', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      topMerchants.forEach((merchant, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${index + 1}. ${merchant.name}: $${merchant.amount.toFixed(2)}`, 30, yPosition);
        yPosition += 5;
      });
      
      yPosition += 10;
      
      // Spending vs Caps Analysis
      if (checkNewPage(20)) {
        yPosition = 20;
      }
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Spending vs Budget Caps:', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      spendingVsCaps.forEach((category, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        const percentage = ((category.spent / category.cap) * 100).toFixed(1);
        pdf.text(`${category.category}: $${category.spent.toFixed(2)} / $${category.cap.toFixed(2)} (${percentage}%)`, 30, yPosition);
        yPosition += 5;
      });
      
      // Footer
      yPosition = pageHeight - 20;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(150, 150, 150);
      pdf.text('Generated by MoneyLens - Financial Analytics System', 20, yPosition);
      
      const currentDate = new Date().toISOString().split('T')[0];
      pdf.save(`analytics-report-${selectedPeriod}-${currentDate}.pdf`);
      
      toast.success("Analytics report exported successfully!");
    } catch (error) {
      console.error('Export failed:', error);
      toast.error("Failed to export report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      className="h-full min-h-screen space-y-6 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Financial Analytics
          </h1>
          <p className="text-muted-foreground text-sm">
            Comprehensive insights into your spending patterns
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            size="sm" 
            className="h-9"
            onClick={handleExportReport}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">
              {isExporting ? "Exporting..." : "Export Report"}
            </span>
            <span className="sm:hidden">
              {isExporting ? "..." : "Export"}
            </span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Daily Spending</p>
                <p className="text-2xl font-bold">$94.90</p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingDown className="w-3 h-3 text-success" />
                  <span className="text-success">-5.2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Target className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget Adherence</p>
                <p className="text-2xl font-bold">87%</p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-success">+2.1%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Spending Velocity</p>
                <p className="text-2xl font-bold">+3.4%</p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-3 h-3 text-warning" />
                  <span className="text-warning">Increasing</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Savings Rate</p>
                <p className="text-2xl font-bold">18.5%</p>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-success">+1.8%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Spending Trends */}
        <Card className="card-gradient">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Monthly Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={chartConfig} className="h-[280px] w-full">
              <AreaChart data={monthlyData}>
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="dining"
                  stackId="1"
                  stroke={chartConfig.dining.color}
                  fill={chartConfig.dining.color}
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="shopping"
                  stackId="1"
                  stroke={chartConfig.shopping.color}
                  fill={chartConfig.shopping.color}
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="transport"
                  stackId="1"
                  stroke={chartConfig.transport.color}
                  fill={chartConfig.transport.color}
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="utilities"
                  stackId="1"
                  stroke={chartConfig.utilities.color}
                  fill={chartConfig.utilities.color}
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Merchants */}
        <Card className="card-gradient">
          <CardHeader className="pb-4">
            <CardTitle>Top 5 Merchants</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={{}} className="h-[280px] w-full">
              <BarChart data={formattedMerchants} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [`$${value}`, 'Amount Spent']}
                />
                <Bar 
                  dataKey="amount" 
                  radius={[4, 4, 0, 0]}
                  name="Amount Spent"
                >
                  {formattedMerchants.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Spending vs Caps */}
        <Card className="card-gradient">
          <CardHeader className="pb-4">
            <CardTitle>Spending vs Caps Comparison</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={{}} className="h-[280px] w-full">
              <ComposedChart data={spendingVsCaps}>
                <XAxis 
                  dataKey="category" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="spent" 
                  fill="#3B82F6" 
                  name="Spent"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="cap" 
                  fill="#10B981" 
                  name="Cap"
                  radius={[4, 4, 0, 0]}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  name="Target"
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Spending Projection */}
        <Card className="card-gradient">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Spending Projection
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={projectionChartConfig} className="h-[280px] w-full">
              <AreaChart data={spendingProjection} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  domain={[2500, 3500]}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value, name) => [`$${value}`, name === 'projected' ? 'Projected' : 'Actual']}
                />
                <Area
                  type="monotone"
                  dataKey="projected"
                  stroke={projectionChartConfig.projected.color}
                  fill={projectionChartConfig.projected.color}
                  fillOpacity={0.3}
                  strokeWidth={3}
                  name="Projected Spending"
                  dot={{ fill: projectionChartConfig.projected.color, strokeWidth: 2, r: 4 }}
                />
              </AreaChart>
            </ChartContainer>
            <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-primary text-sm">Projection Insights</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Current Average</p>
                  <p className="font-semibold text-primary">$2,847</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Year-End</p>
                  <p className="font-semibold text-primary">$3,289</p>
                </div>
              </div>
              <div className="mt-2 p-2 bg-background/50 rounded border border-primary/10">
                <p className="text-xs text-foreground">
                  <strong className="text-primary">Forecast:</strong> Gradual increase with holiday spike in December.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights Panel */}
        <Card className="card-gradient lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">Spending Pattern Alert</h4>
              <p className="text-sm">
                Your dining expenses have increased 15% compared to last month. 
                Consider setting a stricter cap to maintain your budget goals.
              </p>
            </div>
            
            <div className="p-4 bg-success/10 rounded-lg border border-success/20">
              <h4 className="font-semibold text-success mb-2">Savings Opportunity</h4>
              <p className="text-sm">
                You're consistently under budget on transportation. 
                You could reallocate $50/month to your savings goal.
              </p>
            </div>
            
            <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
              <h4 className="font-semibold text-warning mb-2">Seasonal Trend</h4>
              <p className="text-sm">
                Shopping expenses typically increase 20% in December. 
                Consider adjusting your caps accordingly.
              </p>
            </div>

            <Dialog open={isInsightsDialogOpen} onOpenChange={setIsInsightsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View All Insights
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    AI-Generated Insights
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {allInsights.map((insight) => {
                    const IconComponent = insight.icon;
                    const getTypeStyles = (type: string) => {
                      switch (type) {
                        case "alert":
                          return "bg-red-50 border-red-200 text-red-800";
                        case "success":
                          return "bg-green-50 border-green-200 text-green-800";
                        case "warning":
                          return "bg-yellow-50 border-yellow-200 text-yellow-800";
                        case "info":
                          return "bg-blue-50 border-blue-200 text-blue-800";
                        default:
                          return "bg-gray-50 border-gray-200 text-gray-800";
                      }
                    };
                    
                    const getImpactBadge = (impact: string) => {
                      const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
                      
                      switch (impact) {
                        case "High":
                          return <span className={`${baseClasses} bg-red-500 text-white`}>High Impact</span>;
                        case "Medium":
                          return <span className={`${baseClasses} bg-yellow-500 text-white`}>Medium Impact</span>;
                        case "Positive":
                          return <span className={`${baseClasses} bg-green-500 text-white`}>Positive</span>;
                        default:
                          return <span className={`${baseClasses} bg-gray-100 text-gray-700 border border-gray-300`}>{impact}</span>;
                      }
                    };

                    return (
                      <div key={insight.id} className={`p-4 rounded-lg border ${getTypeStyles(insight.type)}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-5 h-5" />
                            <h4 className="font-semibold">{insight.title}</h4>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">{insight.category}</span>
                            {getImpactBadge(insight.impact)}
                          </div>
                        </div>
                        <p className="text-sm mb-3">{insight.description}</p>
                        <div className="bg-white/50 p-3 rounded border">
                          <p className="text-sm font-medium text-gray-700">
                            💡 <strong>Recommendation:</strong> {insight.recommendation}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>Spending Patterns Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-primary">Tuesday</h3>
              <p className="text-sm text-muted-foreground">Highest Spending Day</p>
              <p className="text-xs text-muted-foreground mt-1">Avg: $127.45</p>
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-bold text-success">3:00 PM</h3>
              <p className="text-sm text-muted-foreground">Peak Spending Time</p>
              <p className="text-xs text-muted-foreground mt-1">23% of daily transactions</p>
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-bold text-warning">Coffee Shops</h3>
              <p className="text-sm text-muted-foreground">Most Frequent Category</p>
              <p className="text-xs text-muted-foreground mt-1">45 visits this month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
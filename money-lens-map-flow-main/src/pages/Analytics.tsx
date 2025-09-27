import { motion } from "framer-motion";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Send,
  MessageSquare,
  Building
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
import { getBrandColor, getCategoryBrandColor } from "@/lib/brandColors";
import { AutoVisualizationAgent } from "@/components/agents/AutoVisualizationAgent";
import { AIDescription } from "@/components/ui/AIDescription";
import { chartData } from "@/lib/unifiedData";
import { RealBankingDashboard } from "@/components/nessie/RealBankingDashboard";
import { useNessieSpendingAnalysis } from "@/hooks/useNessie";

// Use unified dataset for consistent data across all components
const monthlyData = chartData.monthlySpending;
const topMerchants = chartData.topMerchants;
const spendingVsCaps = chartData.spendingVsCaps;
const spendingProjection = chartData.spendingProjection;

// Ensure data is properly formatted for charts
const formattedMerchants = topMerchants.map(merchant => ({
  ...merchant,
  amount: Number(merchant.amount),
  visits: Number(merchant.visits)
}));

const chartConfig = {
  dining: { label: "Dining", color: getCategoryBrandColor("Dining") },
  shopping: { label: "Shopping", color: getCategoryBrandColor("Shopping") },
  transport: { label: "Transport", color: getCategoryBrandColor("Transport") },
  utilities: { label: "Utilities", color: getCategoryBrandColor("Utilities") },
  healthcare: { label: "Healthcare", color: getCategoryBrandColor("Healthcare") },
  entertainment: { label: "Entertainment", color: getCategoryBrandColor("Entertainment") },
  groceries: { label: "Groceries", color: getCategoryBrandColor("Groceries") },
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
  const [currentView, setCurrentView] = useState(0);
  const [nlQuery, setNlQuery] = useState("");
  const [isProcessingQuery, setIsProcessingQuery] = useState(false);
  const [queryResult, setQueryResult] = useState(null);
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);

  // Define all available views
  const views = [
    { id: 'ava', name: 'Auto Visualization Agent', icon: Sparkles, component: 'ava' },
    { id: 'ava-chat', name: 'AVA Chat Assistant', icon: MessageSquare, component: 'ava-chat' },
    { id: 'nessie', name: 'Real Banking Data', icon: Building, component: 'nessie' },
    { id: 'monthly', name: 'Monthly Trends', icon: BarChart3, component: 'monthly' },
    { id: 'merchants', name: 'Top Merchants', icon: Target, component: 'merchants' },
    { id: 'caps', name: 'Spending vs Caps', icon: AlertTriangle, component: 'caps' },
    { id: 'projection', name: 'Spending Projection', icon: TrendingUp, component: 'projection' }
  ];

  const nextView = () => {
    setCurrentView((prev) => (prev + 1) % views.length);
  };

  const prevView = () => {
    setCurrentView((prev) => (prev - 1 + views.length) % views.length);
  };

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

  const handleNaturalLanguageQuery = async () => {
    if (!nlQuery.trim()) {
      toast.error("Please enter a query");
      return;
    }

    setIsProcessingQuery(true);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Parse the query and generate appropriate data
      const query = nlQuery.toLowerCase();
      let result = null;
      
      // Extract percentage from query (e.g., "reduce by 20%", "cut 60%", "10 percent")
      const percentageMatch = query.match(/(\d+)%/) || query.match(/(\d+)\s*percent/);
      const percentage = percentageMatch ? parseInt(percentageMatch[1]) : 20;
      
      console.log('Query:', query, 'Percentage detected:', percentage); // Debug log
      
      if (query.includes('healthcare') && query.includes('shopping')) {
        result = {
          type: 'comparison',
          title: 'Healthcare vs Shopping Spending',
          data: [
            { category: 'Healthcare', amount: 150, color: '#8B5CF6' },
            { category: 'Shopping', amount: 329, color: '#3B82F6' }
          ],
          summary: 'Your shopping spending ($329) is higher than healthcare ($150) this month.'
        };
      } else if (query.includes('dining') && (query.includes('reduce') || query.includes('cut') || query.includes('decrease'))) {
        // Calculate actual dining reduction scenario
        const currentDining = 486; // Current monthly dining
        const reductionAmount = (currentDining * percentage) / 100;
        const newDining = currentDining - reductionAmount;
        const monthlySavings = reductionAmount;
        const annualSavings = monthlySavings * 12;
        
        result = {
          type: 'scenario',
          title: `Dining Reduction Scenario (${percentage}%)`,
          data: [
            { period: 'Current', dining: currentDining, projected: currentDining },
            { period: `With ${percentage}% Reduction`, dining: newDining, projected: newDining }
          ],
          summary: `Reducing dining by ${percentage}% would save you $${monthlySavings.toFixed(0)}/month, totaling $${annualSavings.toFixed(0)} annually.`
        };
      } else if (query.includes('shopping') && (query.includes('reduce') || query.includes('cut') || query.includes('decrease'))) {
        const currentShopping = 329;
        const reductionAmount = (currentShopping * percentage) / 100;
        const newShopping = currentShopping - reductionAmount;
        const monthlySavings = reductionAmount;
        const annualSavings = monthlySavings * 12;
        
        result = {
          type: 'scenario',
          title: `Shopping Reduction Scenario (${percentage}%)`,
          data: [
            { period: 'Current', shopping: currentShopping, projected: currentShopping },
            { period: `With ${percentage}% Reduction`, shopping: newShopping, projected: newShopping }
          ],
          summary: `Reducing shopping by ${percentage}% would save you $${monthlySavings.toFixed(0)}/month, totaling $${annualSavings.toFixed(0)} annually.`
        };
      } else if (query.includes('transport') && (query.includes('reduce') || query.includes('cut') || query.includes('decrease'))) {
        const currentTransport = 245;
        const reductionAmount = (currentTransport * percentage) / 100;
        const newTransport = currentTransport - reductionAmount;
        const monthlySavings = reductionAmount;
        const annualSavings = monthlySavings * 12;
        
        result = {
          type: 'scenario',
          title: `Transport Reduction Scenario (${percentage}%)`,
          data: [
            { period: 'Current', transport: currentTransport, projected: currentTransport },
            { period: `With ${percentage}% Reduction`, transport: newTransport, projected: newTransport }
          ],
          summary: `Reducing transport by ${percentage}% would save you $${monthlySavings.toFixed(0)}/month, totaling $${annualSavings.toFixed(0)} annually.`
        };
      } else if (query.includes('trend') || query.includes('over time')) {
        result = {
          type: 'trend',
          title: 'Spending Trends Over Time',
          data: monthlyData,
          summary: 'Your spending shows a gradual increase trend with seasonal variations.'
        };
      } else if (query.includes('merchant') || query.includes('store')) {
        result = {
          type: 'merchants',
          title: 'Top Merchants Analysis',
          data: formattedMerchants,
          summary: 'Amazon leads your spending at $892, followed by Target at $523.'
        };
      } else if (query.includes('compare') || query.includes('vs') || query.includes('versus')) {
        // Extract categories to compare
        const categories = [];
        if (query.includes('dining')) categories.push({ category: 'Dining', amount: 486, color: '#EF4444' });
        if (query.includes('shopping')) categories.push({ category: 'Shopping', amount: 329, color: '#3B82F6' });
        if (query.includes('transport')) categories.push({ category: 'Transport', amount: 245, color: '#10B981' });
        if (query.includes('utilities')) categories.push({ category: 'Utilities', amount: 187, color: '#F59E0B' });
        if (query.includes('healthcare')) categories.push({ category: 'Healthcare', amount: 150, color: '#8B5CF6' });
        if (query.includes('entertainment')) categories.push({ category: 'Entertainment', amount: 120, color: '#EC4899' });
        
        if (categories.length >= 2) {
          result = {
            type: 'comparison',
            title: `${categories[0].category} vs ${categories[1].category} Spending`,
            data: categories.slice(0, 2),
            summary: `${categories[0].category} spending ($${categories[0].amount}) is ${categories[0].amount > categories[1].amount ? 'higher' : 'lower'} than ${categories[1].category} ($${categories[1].amount}).`
          };
        } else {
          result = {
            type: 'general',
            title: 'Spending Analysis',
            data: monthlyData,
            summary: 'Based on your query, here\'s your spending analysis with key insights.'
          };
        }
      } else {
        result = {
          type: 'general',
          title: 'Spending Analysis',
          data: monthlyData,
          summary: 'Based on your query, here\'s your spending analysis with key insights.'
        };
      }
      
      console.log('Query result:', result); // Debug log
      setQueryResult(result);
      toast.success("Query processed successfully!");
    } catch (error) {
      toast.error("Failed to process query. Please try again.");
    } finally {
      setIsProcessingQuery(false);
    }
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      console.log('Starting PDF export...');
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
        pdf.text(`${index + 1}. ${insight.title || 'Insight'}`, 20, yPosition);
        yPosition += 6;
        
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        const description = (insight.description || '').length > 80 
          ? (insight.description || '').substring(0, 77) + '...' 
          : (insight.description || 'No description available');
        pdf.text(description, 20, yPosition);
        yPosition += 5;
        
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Category: ${insight.category || 'N/A'} | Impact: ${insight.impact || 'N/A'}`, 20, yPosition);
        yPosition += 4;
        pdf.text(`Recommendation: ${insight.recommendation || 'No recommendation'}`, 20, yPosition);
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
      (monthlyData || []).forEach((month, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        const totalSpending = (month.dining || 0) + (month.shopping || 0) + (month.transport || 0) + (month.utilities || 0);
        pdf.text(`${month.month || 'Unknown'}: $${totalSpending.toFixed(2)}`, 30, yPosition);
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
      (topMerchants || []).forEach((merchant, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${index + 1}. ${merchant.name || 'Unknown'}: $${(merchant.amount || 0).toFixed(2)}`, 30, yPosition);
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
      (spendingVsCaps || []).forEach((category, index) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        const spent = category.spent || 0;
        const cap = category.cap || 1;
        const percentage = ((spent / cap) * 100).toFixed(1);
        pdf.text(`${category.category || 'Unknown'}: $${spent.toFixed(2)} / $${cap.toFixed(2)} (${percentage}%)`, 30, yPosition);
        yPosition += 5;
      });
      
      // Footer
      yPosition = pageHeight - 20;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(150, 150, 150);
      pdf.text('Generated by MoneyLens - Financial Analytics System', 20, yPosition);
      
      const currentDate = new Date().toISOString().split('T')[0];
      console.log('Saving PDF...');
      pdf.save(`analytics-report-${selectedPeriod}-${currentDate}.pdf`);
      
      console.log('PDF export completed successfully');
      toast.success("Analytics report exported successfully!");
    } catch (error) {
      console.error('Export failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
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

      {/* Unified Analytics Panel */}
      <Card className="card-gradient border-2 border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {React.createElement(views[currentView].icon, { className: "w-5 h-5 text-primary" })}
              {views[currentView].name}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevView}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1">
                {views.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentView ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={nextView}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[400px]"
          >
            {views[currentView].component === 'ava' && (
              <div>
                <AutoVisualizationAgent />
                <AIDescription
                  shortDescription="The Auto Visualization Agent intelligently analyzes your spending data and automatically generates the most relevant charts and insights based on your financial patterns and trends."
                  longDescription="This advanced AI-powered agent continuously monitors your financial data to identify patterns, anomalies, and trends. It automatically selects the most appropriate visualization type (bar charts, pie charts, line graphs, or area charts) based on the data characteristics and your spending behavior. The agent can detect spending anomalies, seasonal patterns, budget deviations, and emerging trends. It provides real-time insights and recommendations, helping you understand your financial habits without manual analysis. The system learns from your spending patterns to provide increasingly personalized and relevant visualizations over time."
                  insights={[
                    "Automatically selects optimal chart types based on data patterns",
                    "Detects spending anomalies and unusual patterns",
                    "Provides real-time insights and recommendations",
                    "Learns from your spending behavior for personalized analysis"
                  ]}
                />
              </div>
            )}
            
            {views[currentView].component === 'ava-chat' && (
              <div>
                {/* Information Icon */}
                <div className="flex justify-end mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsInfoDialogOpen(true)}
                    className="rounded-full w-8 h-8 p-0 bg-primary/10 hover:bg-primary/20 border-primary/30"
                  >
                    <Info className="w-4 h-4 text-primary" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Try: 'What if I reduce dining by 60%?' or 'Compare dining vs shopping spending'"
                      value={nlQuery}
                      onChange={(e) => setNlQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleNaturalLanguageQuery()}
                      className="flex-1"
                      disabled={isProcessingQuery}
                    />
                    <Button 
                      onClick={handleNaturalLanguageQuery}
                      disabled={isProcessingQuery || !nlQuery.trim()}
                      className="px-6"
                    >
                      {isProcessingQuery ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Example queries */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNlQuery("Compare dining vs shopping spending")}
                      className="text-left justify-start h-auto p-3"
                      disabled={isProcessingQuery}
                    >
                      <div>
                        <p className="font-medium text-xs">Dining vs Shopping</p>
                        <p className="text-xs text-muted-foreground">Compare categories</p>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNlQuery("What if I reduce dining by 60%?")}
                      className="text-left justify-start h-auto p-3"
                      disabled={isProcessingQuery}
                    >
                      <div>
                        <p className="font-medium text-xs">Dining Reduction</p>
                        <p className="text-xs text-muted-foreground">Scenario simulation</p>
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNlQuery("Show me my spending trends over time")}
                      className="text-left justify-start h-auto p-3"
                      disabled={isProcessingQuery}
                    >
                      <div>
                        <p className="font-medium text-xs">Spending Trends</p>
                        <p className="text-xs text-muted-foreground">Time series analysis</p>
                      </div>
                    </Button>
                  </div>

                  {/* Query Result */}
                  {queryResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6"
                    >
                      <Card className="border-primary/20">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">{queryResult.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{queryResult.summary}</p>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[300px]">
                            {queryResult.type === 'comparison' && (
                              <ChartContainer config={{}} className="h-full w-full">
                                <BarChart data={queryResult.data}>
                                  <XAxis dataKey="category" />
                                  <YAxis />
                                  <ChartTooltip content={<ChartTooltipContent />} />
                                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                    {queryResult.data.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ChartContainer>
                            )}
                            
                            {queryResult.type === 'scenario' && (
                              <ChartContainer config={{}} className="h-full w-full">
                                <BarChart data={queryResult.data}>
                                  <XAxis dataKey="period" />
                                  <YAxis />
                                  <ChartTooltip content={<ChartTooltipContent />} />
                                  {queryResult.data[0].dining !== undefined && (
                                    <Bar dataKey="dining" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                  )}
                                  {queryResult.data[0].shopping !== undefined && (
                                    <Bar dataKey="shopping" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                  )}
                                  {queryResult.data[0].transport !== undefined && (
                                    <Bar dataKey="transport" fill="#10B981" radius={[4, 4, 0, 0]} />
                                  )}
                                  {queryResult.data[0].utilities !== undefined && (
                                    <Bar dataKey="utilities" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                  )}
                                  {queryResult.data[0].healthcare !== undefined && (
                                    <Bar dataKey="healthcare" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                  )}
                                  {queryResult.data[0].entertainment !== undefined && (
                                    <Bar dataKey="entertainment" fill="#EC4899" radius={[4, 4, 0, 0]} />
                                  )}
                                  {queryResult.data[0].groceries !== undefined && (
                                    <Bar dataKey="groceries" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                                  )}
                                </BarChart>
                              </ChartContainer>
                            )}
                            
                            {queryResult.type === 'trend' && (
                              <ChartContainer config={chartConfig} className="h-full w-full">
                                <AreaChart data={queryResult.data}>
                                  <XAxis dataKey="month" />
                                  <YAxis />
                                  <ChartTooltip content={<ChartTooltipContent />} />
                                  <Area
                                    type="monotone"
                                    dataKey="dining"
                                    stackId="1"
                                    stroke={chartConfig.dining.color}
                                    fill={chartConfig.dining.color}
                                    fillOpacity={0.6}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="shopping"
                                    stackId="1"
                                    stroke={chartConfig.shopping.color}
                                    fill={chartConfig.shopping.color}
                                    fillOpacity={0.6}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="transport"
                                    stackId="1"
                                    stroke={chartConfig.transport.color}
                                    fill={chartConfig.transport.color}
                                    fillOpacity={0.6}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="utilities"
                                    stackId="1"
                                    stroke={chartConfig.utilities.color}
                                    fill={chartConfig.utilities.color}
                                    fillOpacity={0.6}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="healthcare"
                                    stackId="1"
                                    stroke={chartConfig.healthcare.color}
                                    fill={chartConfig.healthcare.color}
                                    fillOpacity={0.6}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="entertainment"
                                    stackId="1"
                                    stroke={chartConfig.entertainment.color}
                                    fill={chartConfig.entertainment.color}
                                    fillOpacity={0.6}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="groceries"
                                    stackId="1"
                                    stroke={chartConfig.groceries.color}
                                    fill={chartConfig.groceries.color}
                                    fillOpacity={0.6}
                                  />
                                </AreaChart>
                              </ChartContainer>
                            )}
                            
                            {queryResult.type === 'merchants' && (
                              <ChartContainer config={{}} className="h-full w-full">
                                <BarChart data={queryResult.data}>
                                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                                  <YAxis />
                                  <ChartTooltip content={<ChartTooltipContent />} />
                                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                    {queryResult.data.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ChartContainer>
                            )}
                            
                            {queryResult.type === 'general' && (
                              <ChartContainer config={chartConfig} className="h-full w-full">
                                <AreaChart data={queryResult.data}>
                                  <XAxis dataKey="month" />
                                  <YAxis />
                                  <ChartTooltip content={<ChartTooltipContent />} />
                                  <Area
                                    type="monotone"
                                    dataKey="dining"
                                    stackId="1"
                                    stroke={chartConfig.dining.color}
                                    fill={chartConfig.dining.color}
                                    fillOpacity={0.6}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="shopping"
                                    stackId="1"
                                    stroke={chartConfig.shopping.color}
                                    fill={chartConfig.shopping.color}
                                    fillOpacity={0.6}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="transport"
                                    stackId="1"
                                    stroke={chartConfig.transport.color}
                                    fill={chartConfig.transport.color}
                                    fillOpacity={0.6}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="utilities"
                                    stackId="1"
                                    stroke={chartConfig.utilities.color}
                                    fill={chartConfig.utilities.color}
                                    fillOpacity={0.6}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="healthcare"
                                    stackId="1"
                                    stroke={chartConfig.healthcare.color}
                                    fill={chartConfig.healthcare.color}
                                    fillOpacity={0.6}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="entertainment"
                                    stackId="1"
                                    stroke={chartConfig.entertainment.color}
                                    fill={chartConfig.entertainment.color}
                                    fillOpacity={0.6}
                                  />
                                  <Area
                                    type="monotone"
                                    dataKey="groceries"
                                    stackId="1"
                                    stroke={chartConfig.groceries.color}
                                    fill={chartConfig.groceries.color}
                                    fillOpacity={0.6}
                                  />
                                </AreaChart>
                              </ChartContainer>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>
                <AIDescription
                  shortDescription="The AVA Chat Assistant allows you to ask questions in natural language and automatically generates the perfect chart to answer your query. Simply type what you want to know about your spending patterns."
                  longDescription="This intelligent chat interface understands natural language queries about your financial data and automatically selects the most appropriate visualization. Whether you want to compare categories, simulate scenarios, analyze trends, or explore merchant spending, AVA will generate the right chart type and provide meaningful insights. The system processes your questions using advanced natural language understanding and creates dynamic, interactive visualizations that help you understand your spending patterns better than ever before."
                  insights={[
                    "Ask questions in plain English - no technical knowledge required",
                    "Automatically selects the best chart type for your query",
                    "Supports comparison, scenario simulation, and trend analysis",
                    "Provides instant insights and recommendations"
                  ]}
                />
              </div>
            )}
            
            {views[currentView].component === 'nessie' && (
              <div>
                <RealBankingDashboard />
                <AIDescription
                  shortDescription="Real banking data integration using Capital One's Nessie API. View actual account balances, transaction history, and spending patterns from real bank accounts."
                  longDescription="This integration connects to Capital One's Nessie API to provide real banking data including customer accounts, transaction history, spending analysis, and financial insights. Users can view actual account balances, transfer money between accounts, create new transactions, and analyze spending patterns using real bank data. The system automatically categorizes transactions and provides detailed financial analytics based on actual banking activity."
                  insights={[
                    "Real account balances and transaction history from Capital One API",
                    "Live spending analysis with automatic transaction categorization",
                    "Money transfer capabilities between accounts",
                    "Bill payment and transaction creation features"
                  ]}
                />
              </div>
            )}
            
            {views[currentView].component === 'monthly' && (
              <div>
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
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
                      labelStyle={{ color: '#374151', fontSize: '14px', fontWeight: '600', lineHeight: '1.5' }}
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        padding: '8px 12px'
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
                    <Area
                      type="monotone"
                      dataKey="healthcare"
                      stackId="1"
                      stroke={chartConfig.healthcare.color}
                      fill={chartConfig.healthcare.color}
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="entertainment"
                      stackId="1"
                      stroke={chartConfig.entertainment.color}
                      fill={chartConfig.entertainment.color}
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="groceries"
                      stackId="1"
                      stroke={chartConfig.groceries.color}
                      fill={chartConfig.groceries.color}
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
                <AIDescription
                  shortDescription="Your spending shows a consistent pattern with dining being your highest category, averaging $502/month. There's a notable increase in shopping expenses during March and May."
                  longDescription="The monthly trends reveal several key patterns in your spending behavior. Dining expenses consistently lead your spending categories, with an average of $502 per month and a peak of $567 in June. Shopping expenses show seasonal variation, with significant increases in March ($398) and May ($423), likely reflecting seasonal purchases or lifestyle changes. Transportation costs remain relatively stable around $250-280 per month, while utilities show minimal fluctuation, indicating good budget discipline in essential expenses. The overall trend suggests you maintain consistent spending habits with occasional spikes in discretionary categories."
                  insights={[
                    "Dining expenses are 25% higher than other categories on average",
                    "Shopping spikes in March and May suggest seasonal spending patterns",
                    "Transportation costs are well-controlled with minimal variance",
                    "Utilities spending is the most predictable category"
                  ]}
                />
              </div>
            )}
            
            {views[currentView].component === 'merchants' && (
              <div>
                <ChartContainer config={{}} className="h-[400px] w-full">
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
                      labelStyle={{ color: '#374151', fontSize: '14px', fontWeight: '600', lineHeight: '1.5' }}
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        padding: '8px 12px'
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
                <AIDescription
                  shortDescription="Amazon dominates your spending at $892, representing 40% of your top merchant expenses. You have a good mix of shopping, dining, and transport merchants with Starbucks showing high visit frequency."
                  longDescription="Your merchant spending reveals a concentrated pattern with Amazon accounting for the largest portion of your expenses at $892. This suggests you rely heavily on online shopping for various needs. Target follows as your second-largest merchant at $523, indicating a preference for retail shopping. Interestingly, while Shell has the highest visit frequency (15 visits), your spending per visit is lower, suggesting frequent but smaller fuel purchases. Starbucks shows the highest visit frequency among dining establishments (18 visits), indicating regular coffee purchases. McDonald's represents smaller individual transactions but frequent visits, suggesting convenience-based dining choices."
                  insights={[
                    "Amazon represents 40% of your top merchant spending",
                    "High visit frequency at Shell suggests regular commuting patterns",
                    "Starbucks visits indicate a daily coffee habit",
                    "Merchant diversity is good across shopping, dining, and transport"
                  ]}
                />
              </div>
            )}
            
            {views[currentView].component === 'caps' && (
              <div>
                <ChartContainer config={{}} className="h-[400px] w-full">
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
                      labelStyle={{ color: '#374151', fontSize: '14px', fontWeight: '600', lineHeight: '1.5' }}
                      contentStyle={{ 
                        backgroundColor: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        padding: '8px 12px'
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
                <AIDescription
                  shortDescription="Excellent budget control! You're under your caps in all categories, with dining at 97% of cap and utilities at 94%. Your targets are well-calibrated and achievable."
                  longDescription="Your spending vs caps analysis reveals strong financial discipline across all categories. Dining expenses are at 97% of your cap ($486/$500), showing excellent control while still allowing for lifestyle spending. Shopping is well-managed at 82% of cap ($329/$400), indicating good restraint in discretionary purchases. Transportation spending is at 82% of cap ($245/$300), suggesting efficient travel management. Utilities are at 94% of cap ($187/$200), showing consistent and predictable essential spending. Your target lines are well-positioned between actual spending and caps, providing a healthy buffer for unexpected expenses while maintaining budget discipline."
                  insights={[
                    "All categories are under budget caps - excellent financial discipline",
                    "Dining is closest to cap at 97% - monitor for potential overruns",
                    "Target lines provide good buffer zones for each category",
                    "Utilities spending is most predictable and well-controlled"
                  ]}
                />
              </div>
            )}
            
            {views[currentView].component === 'projection' && (
              <div>
                <ChartContainer config={projectionChartConfig} className="h-[400px] w-full">
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
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div style={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              padding: '8px 12px',
                              lineHeight: '1.5'
                            }}>
                              <p style={{ color: '#374151', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>
                                {label} 2024
                              </p>
                              <p style={{ color: '#374151', fontSize: '14px', margin: '0' }}>
                                ${payload[0].value} Actual
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
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
                <AIDescription
                  shortDescription="Your spending is projected to increase gradually from $2,847 to $3,289 by December, with a notable holiday spike. The trend suggests seasonal spending patterns and lifestyle inflation."
                  longDescription="The spending projection reveals a steady upward trend in your monthly expenses, increasing from $2,847 in July to $3,289 by December. This represents a 15.5% increase over six months, averaging 2.6% growth per month. The gradual increase suggests normal lifestyle inflation and seasonal spending patterns. The December spike to $3,289 indicates anticipated holiday spending, which is typical for most households. The consistent upward trend suggests you may need to adjust your budget caps or spending targets to accommodate this growth. The projection is based on historical spending patterns and seasonal trends, providing a realistic forecast for budget planning."
                  insights={[
                    "15.5% spending increase projected over 6 months",
                    "December holiday spike expected at $3,289",
                    "Average monthly growth rate of 2.6%",
                    "Consider adjusting budget caps for projected increases"
                  ]}
                />
              </div>
            )}
          </motion.div>
        </CardContent>
      </Card>

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

      {/* Information Dialog for AVA Chat Assistant */}
      <Dialog open={isInfoDialogOpen} onOpenChange={setIsInfoDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Automation & Agent Behavior
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Natural Language Queries */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Lightbulb className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-primary">Natural Language Queries</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Let users type "Show me my healthcare spending vs shopping in September". 
                  AVA generates the right chart + summary.
                </p>
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs text-foreground font-medium mb-1">Example Query:</p>
                  <p className="text-xs text-muted-foreground italic">
                    "Show me my healthcare spending vs shopping in September"
                  </p>
                </div>
              </div>

              {/* Alerting System */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  </div>
                  <h3 className="font-semibold text-warning">Alerting System</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Email/Slack/notification when spending crosses a threshold.
                </p>
                <div className="p-3 bg-warning/5 rounded-lg border border-warning/20">
                  <p className="text-xs text-foreground font-medium mb-1">Smart Alerts:</p>
                  <p className="text-xs text-muted-foreground">
                    • Budget threshold breaches<br/>
                    • Unusual spending patterns<br/>
                    • Category cap warnings
                  </p>
                </div>
              </div>

              {/* Scenario Simulations */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Target className="w-4 h-4 text-success" />
                  </div>
                  <h3 className="font-semibold text-success">Scenario Simulations</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  "What if I reduce dining by 20%?" → AVA updates chart & shows savings impact.
                </p>
                <div className="p-3 bg-success/5 rounded-lg border border-success/20">
                  <p className="text-xs text-foreground font-medium mb-1">Simulation Example:</p>
                  <p className="text-xs text-muted-foreground italic">
                    "What if I reduce dining by 20%?"
                  </p>
                  <p className="text-xs text-success mt-1">
                    → Shows potential savings: $100/month
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">How It Works</h4>
              <p className="text-sm text-muted-foreground">
                The AVA Chat Assistant combines all three automation features into one intelligent interface. 
                Simply type your question in natural language, and AVA will automatically determine whether you 
                want a comparison, scenario simulation, or trend analysis, then generate the perfect chart and insights.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
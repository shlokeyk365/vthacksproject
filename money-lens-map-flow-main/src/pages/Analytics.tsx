import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Calendar,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  AlertTriangle
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
  { name: "Starbucks", amount: 247, visits: 18 },
  { name: "Amazon", amount: 892, visits: 12 },
  { name: "Shell", amount: 356, visits: 15 },
  { name: "Target", amount: 523, visits: 8 },
  { name: "McDonald's", amount: 189, visits: 14 },
];

const spendingVsCaps = [
  { category: "Dining", spent: 486, cap: 500, target: 450 },
  { category: "Shopping", spent: 329, cap: 400, target: 350 },
  { category: "Transport", spent: 245, cap: 300, target: 250 },
  { category: "Utilities", spent: 187, cap: 200, target: 180 },
];

const chartConfig = {
  dining: { label: "Dining", color: "#3B82F6" },
  shopping: { label: "Shopping", color: "#10B981" },
  transport: { label: "Transport", color: "#F59E0B" },
  utilities: { label: "Utilities", color: "#EF4444" },
};

export default function Analytics() {
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
          <Button variant="outline" size="sm" className="h-9">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Last 6 Months</span>
            <span className="sm:hidden">6M</span>
          </Button>
          <Button size="sm" className="h-9">
            <Download className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
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
              <BarChart data={topMerchants} layout="horizontal">
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80}
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
                  dataKey="amount" 
                  fill="#3B82F6"
                  radius={[0, 4, 4, 0]}
                />
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

            <Button className="w-full" variant="outline">
              View All Insights
            </Button>
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
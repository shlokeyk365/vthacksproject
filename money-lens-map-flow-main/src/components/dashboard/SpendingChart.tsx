import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";
import { useDashboardStats } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryBrandColor } from "@/lib/brandColors";

const chartConfig = {
  amount: {
    label: "Spending",
    color: getCategoryBrandColor("Shopping"), // Use brand color for spending trend
  },
};

// Format date for better display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

// Format currency for tooltip
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export function SpendingChart() {
  const { data: dashboardData, isLoading } = useDashboardStats();
  const spendingData = dashboardData?.spendingTrend || [];
  if (isLoading) {
    return (
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>30-Day Spending Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-gradient">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">30-Day Spending Trend</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {spendingData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">No spending data available</p>
              <p className="text-xs mt-1">Start tracking your expenses to see trends</p>
            </div>
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={spendingData}
                  margin={{ 
                    top: 30, 
                    right: 40, 
                    left: 50, 
                    bottom: 30 
                  }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="hsl(var(--muted))" 
                    opacity={0.3}
                  />
                  <XAxis 
                    dataKey="date" 
                    tick={{ 
                      fontSize: 12, 
                      fill: "hsl(var(--muted-foreground))" 
                    }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatDate}
                    interval="preserveStartEnd"
                    tickMargin={8}
                  />
                  <YAxis 
                    tick={{ 
                      fontSize: 12, 
                      fill: "hsl(var(--muted-foreground))" 
                    }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                    domain={['dataMin - 10', 'dataMax + 10']}
                    tickMargin={8}
                  />
                  <ChartTooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border border-border rounded-lg shadow-lg p-4" style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            padding: '12px 16px'
                          }}>
                            <p className="text-sm font-semibold text-foreground mb-1" style={{ fontSize: '14px', fontWeight: '600' }}>
                              {formatDate(label)}
                            </p>
                            <p className="text-sm text-primary font-medium">
                              {formatCurrency(payload[0].value as number)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                    cursor={{ 
                      stroke: "hsl(var(--primary))", 
                      strokeWidth: 1, 
                      strokeDasharray: "3 3" 
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ 
                      fill: "hsl(var(--primary))", 
                      strokeWidth: 2, 
                      r: 3,
                      stroke: "hsl(var(--background))"
                    }}
                    activeDot={{ 
                      r: 5, 
                      strokeWidth: 2,
                      stroke: "hsl(var(--primary))",
                      fill: "hsl(var(--background))"
                    }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
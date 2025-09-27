import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useDashboardStats } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";

const chartConfig = {
  amount: {
    label: "Spending",
    color: "hsl(var(--primary))",
  },
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
      <CardHeader>
        <CardTitle>30-Day Spending Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {spendingData.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            <p>No spending data available</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px]">
            <LineChart data={spendingData}>
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="var(--color-amount)"
                strokeWidth={3}
                dot={{ fill: "var(--color-amount)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
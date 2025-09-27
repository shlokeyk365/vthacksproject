import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

const spendingData = [
  { date: "Jan 1", amount: 1200 },
  { date: "Jan 5", amount: 1850 },
  { date: "Jan 10", amount: 2100 },
  { date: "Jan 15", amount: 2847 },
  { date: "Jan 20", amount: 3200 },
  { date: "Jan 25", amount: 3650 },
  { date: "Jan 30", amount: 4100 },
];

const chartConfig = {
  amount: {
    label: "Spending",
    color: "hsl(var(--primary))",
  },
};

export function SpendingChart() {
  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle>30-Day Spending Trend</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Coffee, 
  ShoppingBag, 
  Car, 
  Home,
  Utensils,
  Play,
  CheckCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const mockTransactions = [
  {
    id: "1",
    merchant: "Starbucks Coffee",
    amount: 5.47,
    date: "2024-01-15",
    category: "Food & Dining",
    icon: Coffee,
    status: "completed",
    location: "Main St, Blacksburg"
  },
  {
    id: "2",
    merchant: "Amazon",
    amount: 129.99,
    date: "2024-01-14",
    category: "Shopping",
    icon: ShoppingBag,
    status: "completed",
    location: "Online"
  },
  {
    id: "3",
    merchant: "Shell Gas Station",
    amount: 45.20,
    date: "2024-01-14",
    category: "Transportation",
    icon: Car,
    status: "completed",
    location: "University Blvd"
  },
  {
    id: "4",
    merchant: "Electric Company",
    amount: 156.78,
    date: "2024-01-13",
    category: "Utilities",
    icon: Home,
    status: "completed",
    location: "Monthly Bill"
  },
  {
    id: "5",
    merchant: "McDonald's",
    amount: 12.34,
    date: "2024-01-13",
    category: "Food & Dining",
    icon: Utensils,
    status: "completed",
    location: "South Main St"
  },
];

const categoryData = [
  { name: "Food & Dining", value: 486, color: "#3B82F6" },
  { name: "Shopping", value: 329, color: "#10B981" },
  { name: "Transportation", value: 245, color: "#F59E0B" },
  { name: "Utilities", value: 187, color: "#EF4444" },
  { name: "Entertainment", value: 156, color: "#8B5CF6" },
];

const chartConfig = {
  value: {
    label: "Amount",
  },
};

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Manage and simulate your financial transactions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Simulate Transaction
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-gradient">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            
            <div className="flex gap-2">
              <Badge 
                variant={selectedCategory === "all" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Badge>
              {categoryData.map((category) => (
                <Badge
                  key={category.name}
                  variant={selectedCategory === category.name ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transactions Table */}
        <div className="lg:col-span-2">
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTransactions.map((transaction) => {
                    const IconComponent = transaction.icon;
                    return (
                      <TableRow key={transaction.id} className="hover:bg-muted/20">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <IconComponent className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{transaction.merchant}</p>
                              <p className="text-xs text-muted-foreground">
                                {transaction.location}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.category}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ${transaction.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-success" />
                            <span className="text-sm text-success">Completed</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Transaction Simulator */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Transaction Simulator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Merchant</label>
                <Input placeholder="Enter merchant name..." />
              </div>
              
              <div>
                <label className="text-sm font-medium">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input placeholder="0.00" className="pl-8" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Category</label>
                <select className="w-full p-2 border border-input rounded-md bg-background">
                  <option>Food & Dining</option>
                  <option>Shopping</option>
                  <option>Transportation</option>
                  <option>Utilities</option>
                  <option>Entertainment</option>
                </select>
              </div>
              
              <Button className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Simulate Transaction
              </Button>
              
              <div className="p-3 bg-muted/20 rounded-lg">
                <p className="text-sm font-medium text-success">
                  ✓ Transaction would be approved
                </p>
                <p className="text-xs text-muted-foreground">
                  No spending caps would be exceeded
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[200px]">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                  />
                </PieChart>
              </ChartContainer>
              
              <div className="space-y-2 mt-4">
                {categoryData.map((category) => (
                  <div key={category.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span>{category.name}</span>
                    </div>
                    <span className="font-semibold">${category.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="card-gradient">
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total Transactions</span>
                <span className="font-semibold">247</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Average Transaction</span>
                <span className="font-semibold">$45.67</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Top Merchant</span>
                <span className="font-semibold">Starbucks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">This Month</span>
                <span className="font-semibold">$2,847</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
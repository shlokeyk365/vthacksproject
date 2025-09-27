import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2
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
import { useSimulateTransaction } from "@/hooks/useApi";

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
  
  // Transaction simulator state
  const [simulatorData, setSimulatorData] = useState({
    merchant: "",
    amount: "",
    category: "Food & Dining"
  });
  const [simulationResult, setSimulationResult] = useState(null);
  
  const simulateTransaction = useSimulateTransaction();

  const handleSimulate = async () => {
    if (!simulatorData.merchant || !simulatorData.amount) {
      return;
    }

    try {
      const result = await simulateTransaction.mutateAsync({
        merchant: simulatorData.merchant,
        amount: parseFloat(simulatorData.amount),
        category: simulatorData.category
      });
      setSimulationResult(result.data);
    } catch (error) {
      console.error('Simulation failed:', error);
    }
  };

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
                <Input 
                  placeholder="Enter merchant name..." 
                  value={simulatorData.merchant}
                  onChange={(e) => setSimulatorData({...simulatorData, merchant: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input 
                    placeholder="0.00" 
                    className="pl-8" 
                    type="number"
                    step="0.01"
                    value={simulatorData.amount}
                    onChange={(e) => setSimulatorData({...simulatorData, amount: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Category</label>
                <select 
                  className="w-full p-2 border border-input rounded-md bg-background"
                  value={simulatorData.category}
                  onChange={(e) => setSimulatorData({...simulatorData, category: e.target.value})}
                >
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                </select>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleSimulate}
                disabled={simulateTransaction.isPending || !simulatorData.merchant || !simulatorData.amount}
              >
                {simulateTransaction.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Simulate Transaction
              </Button>
              
              {/* Simulation Results */}
              {simulationResult && (
                <div className="space-y-3">
                  {simulationResult.wouldBeApproved ? (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>✓ Transaction would be approved</strong>
                        {simulationResult.warnings?.length > 0 && (
                          <p className="text-sm mt-1">⚠️ With {simulationResult.warnings.length} warning(s)</p>
                        )}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="border-red-200 bg-red-50">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>✗ Transaction would be rejected</strong>
                        <p className="text-sm mt-1">{simulationResult.violations?.length} violation(s) found</p>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Violations */}
                  {simulationResult.violations?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-red-700">Violations:</h4>
                      {simulationResult.violations.map((violation: any, index: number) => (
                        <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                          <div className="font-medium text-red-800">{violation.name}</div>
                          <div className="text-red-600">
                            Would exceed by ${violation.wouldExceed?.toFixed(2)} 
                            ({violation.percentage?.toFixed(1)}% of limit)
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Warnings */}
                  {simulationResult.warnings?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-yellow-700">Warnings:</h4>
                      {simulationResult.warnings.map((warning: any, index: number) => (
                        <div key={index} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                          <div className="font-medium text-yellow-800">{warning.name}</div>
                          <div className="text-yellow-600">
                            {warning.percentage?.toFixed(1)}% of limit used
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Summary */}
                  <div className="p-3 bg-muted/20 rounded-lg text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-muted-foreground">Current Spending:</span>
                        <div className="font-medium">${simulationResult.currentSpending?.toFixed(2)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">After Transaction:</span>
                        <div className="font-medium">${simulationResult.wouldSpend?.toFixed(2)}</div>
                      </div>
                    </div>
                    {simulationResult.monthlyBudget && (
                      <div className="mt-2 pt-2 border-t">
                        <span className="text-muted-foreground">Monthly Budget:</span>
                        <div className="font-medium">${simulationResult.monthlyBudget.toFixed(2)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
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
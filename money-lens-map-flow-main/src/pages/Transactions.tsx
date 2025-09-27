import { useState, useRef } from "react";
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
import jsPDF from 'jspdf';
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
import { getBrandColor, getCategoryBrandColor } from "@/lib/brandColors";

// Merchant logo mapping for real app logos
const getMerchantLogo = (merchantName: string) => {
  const merchant = merchantName.toLowerCase();
  
  // Popular merchants with their brand colors and icons
  if (merchant.includes('netflix')) {
    return {
      icon: '🎬',
      bgColor: 'bg-red-500',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('starbucks') || merchant.includes('starbucks coffee')) {
    return {
      icon: '☕',
      bgColor: 'bg-green-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('amazon')) {
    return {
      icon: '📦',
      bgColor: 'bg-orange-500',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('mcdonald') || merchant.includes('mcdonalds')) {
    return {
      icon: '🍟',
      bgColor: 'bg-yellow-500',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('uber') || merchant.includes('lyft')) {
    return {
      icon: '🚗',
      bgColor: 'bg-black',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('spotify')) {
    return {
      icon: '🎵',
      bgColor: 'bg-green-500',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('apple') || merchant.includes('app store')) {
    return {
      icon: '🍎',
      bgColor: 'bg-gray-800',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('google') || merchant.includes('google play')) {
    return {
      icon: '🔍',
      bgColor: 'bg-blue-500',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('shell') || merchant.includes('gas')) {
    return {
      icon: '⛽',
      bgColor: 'bg-yellow-400',
      textColor: 'text-black'
    };
  }
  if (merchant.includes('target')) {
    return {
      icon: '🎯',
      bgColor: 'bg-red-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('walmart')) {
    return {
      icon: '🏪',
      bgColor: 'bg-blue-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('kroger')) {
    return {
      icon: '🛒',
      bgColor: 'bg-red-700',
      textColor: 'text-white'
    };
  }
  
  // Default fallback to category icon
  return null;
};

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
  { name: "Food & Dining", value: 486, color: getCategoryBrandColor("Food & Dining") },
  { name: "Shopping", value: 329, color: getCategoryBrandColor("Shopping") },
  { name: "Transportation", value: 245, color: getCategoryBrandColor("Transportation") },
  { name: "Utilities", value: 187, color: getCategoryBrandColor("Utilities") },
  { name: "Entertainment", value: 156, color: getCategoryBrandColor("Entertainment") },
];

const chartConfig = {
  value: {
    label: "Amount",
    color: "#3B82F6",
  },
};

export default function Transactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  
  // Filter transactions based on search query and selected category
  const filteredTransactions = mockTransactions.filter((transaction) => {
    const matchesSearch = transaction.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || transaction.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Create filtered category data for pie chart
  const filteredCategoryData = filteredTransactions.reduce((acc, transaction) => {
    const existing = acc.find(item => item.name === transaction.category);
    if (existing) {
      existing.value += transaction.amount;
    } else {
      acc.push({
        name: transaction.category,
        value: transaction.amount,
        color: categoryData.find(cat => cat.name === transaction.category)?.color || "#6B7280"
      });
    }
    return acc;
  }, [] as Array<{name: string, value: number, color: string}>);
  
  // Debug logging
  console.log("Category data:", categoryData);
  
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

  const handleExportPDF = async () => {
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
      pdf.text('Transaction Report', 20, yPosition);
      yPosition += 15;
      
      // Date and time
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      const reportDate = new Date().toLocaleDateString();
      const currentTime = new Date().toLocaleTimeString();
      pdf.text(`Generated on ${reportDate} at ${currentTime}`, 20, yPosition);
      yPosition += 20;
      
      // Summary section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(50, 50, 50);
      pdf.text('Summary', 20, yPosition);
      yPosition += 10;
      
      drawLine(yPosition);
      yPosition += 5;
      
      // Calculate totals from filtered transactions
      const totalAmount = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      const categoryTotals = filteredTransactions.reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Transactions: ${filteredTransactions.length}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Total Amount: $${totalAmount.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Average Transaction: $${filteredTransactions.length > 0 ? (totalAmount / filteredTransactions.length).toFixed(2) : '0.00'}`, 20, yPosition);
      yPosition += 15;
      
      // Category breakdown
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Spending by Category', 20, yPosition);
      yPosition += 10;
      
      drawLine(yPosition);
      yPosition += 5;
      
      Object.entries(categoryTotals).forEach(([category, amount]) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${category}: $${amount.toFixed(2)}`, 20, yPosition);
        yPosition += 6;
      });
      
      yPosition += 10;
      
      // Transactions table header
      if (checkNewPage(30)) {
        yPosition = 20;
      }
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Transaction Details', 20, yPosition);
      yPosition += 10;
      
      drawLine(yPosition);
      yPosition += 5;
      
      // Table headers
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(50, 50, 50);
      
      const colWidths = [60, 40, 30, 30, 30]; // Merchant, Category, Amount, Date, Status
      const colPositions = [20, 80, 120, 150, 180];
      const headers = ['Merchant', 'Category', 'Amount', 'Date', 'Status'];
      
      headers.forEach((header, index) => {
        pdf.text(header, colPositions[index], yPosition);
      });
      yPosition += 8;
      
      drawLine(yPosition);
      yPosition += 5;
      
      // Transaction rows
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      
      filteredTransactions.forEach((transaction) => {
        if (checkNewPage(15)) {
          yPosition = 20;
          // Redraw headers on new page
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(10);
          headers.forEach((header, index) => {
            pdf.text(header, colPositions[index], yPosition);
          });
          yPosition += 8;
          drawLine(yPosition);
          yPosition += 5;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
        }
        
        // Merchant (truncated if too long)
        const merchantText = transaction.merchant.length > 20 
          ? transaction.merchant.substring(0, 17) + '...' 
          : transaction.merchant;
        pdf.text(merchantText, colPositions[0], yPosition);
        
        // Category
        pdf.text(transaction.category, colPositions[1], yPosition);
        
        // Amount
        pdf.text(`$${transaction.amount.toFixed(2)}`, colPositions[2], yPosition);
        
        // Date
        const date = new Date(transaction.date).toLocaleDateString();
        pdf.text(date, colPositions[3], yPosition);
        
        // Status
        pdf.text('Completed', colPositions[4], yPosition);
        
        yPosition += 6;
      });
      
      // Footer
      yPosition = pageHeight - 20;
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(150, 150, 150);
      pdf.text('Generated by MoneyLens - Financial Tracking System', 20, yPosition);
      
      const currentDate = new Date().toISOString().split('T')[0];
      pdf.save(`transactions-report-${currentDate}.pdf`);
    } catch (error) {
      console.error('Export failed:', error);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            Manage and simulate your financial transactions
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
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
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center">
                            <Search className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground">No transactions found</p>
                          <p className="text-sm text-muted-foreground">
                            Try adjusting your search or filter criteria
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => {
                    const merchantLogo = getMerchantLogo(transaction.merchant);
                    const IconComponent = transaction.icon;
                    return (
                      <TableRow key={transaction.id} className="hover:bg-muted/20">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {merchantLogo ? (
                              <div className={`p-2 rounded-lg ${merchantLogo.bgColor} ${merchantLogo.textColor} flex items-center justify-center w-8 h-8`}>
                                <span className="text-lg">{merchantLogo.icon}</span>
                              </div>
                            ) : (
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <IconComponent className="w-4 h-4 text-primary" />
                              </div>
                            )}
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
                  })
                  )}
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

              {/* Spending by Category - Always Visible */}
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Spending by Category</h4>
                <div className="h-[150px] w-full flex items-center justify-center">
                  {filteredCategoryData.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <div className="w-8 h-8 rounded-full bg-muted/20 flex items-center justify-center">
                        <Search className="w-4 h-4" />
                      </div>
                      <p className="text-xs">No data available</p>
                    </div>
                  ) : (
                    <PieChart width={150} height={150}>
                      <Pie
                        data={filteredCategoryData}
                        cx={75}
                        cy={75}
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {filteredCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  )}
                </div>
                
                <div className="space-y-1 mt-2">
                  {filteredCategoryData.slice(0, 3).map((category) => (
                    <div key={category.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div 
                          className="w-2 h-2 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="truncate">{category.name}</span>
                      </div>
                      <span className="font-semibold ml-2 flex-shrink-0">${category.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
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

                  {/* Quick Stats */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Quick Stats</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-muted/20 rounded text-center">
                        <div className="font-semibold text-primary">${simulationResult.currentSpending?.toFixed(0)}</div>
                        <div className="text-muted-foreground">Current</div>
                      </div>
                      <div className="p-2 bg-muted/20 rounded text-center">
                        <div className="font-semibold text-primary">${simulationResult.wouldSpend?.toFixed(0)}</div>
                        <div className="text-muted-foreground">After</div>
                      </div>
                      <div className="p-2 bg-muted/20 rounded text-center">
                        <div className="font-semibold text-primary">{filteredCategoryData.length}</div>
                        <div className="text-muted-foreground">Categories</div>
                      </div>
                      <div className="p-2 bg-muted/20 rounded text-center">
                        <div className="font-semibold text-primary">
                          {simulationResult.monthlyBudget ? 
                            ((simulationResult.wouldSpend / simulationResult.monthlyBudget) * 100).toFixed(0) + '%' : 
                            'N/A'
                          }
                        </div>
                        <div className="text-muted-foreground">Budget Used</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
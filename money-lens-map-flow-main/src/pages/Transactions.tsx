import React, { useState, useMemo } from "react";
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
import { useSimulateTransaction, useTransactions } from "@/hooks/useApi";
import { useDebouncedSearch } from "@/hooks/useDebouncedSearch";
import { useAutocomplete } from "@/hooks/useAutocomplete";
import { HighlightText } from "@/components/ui/highlight-text";
import { Autocomplete } from "@/components/ui/autocomplete";

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
  {
    id: "6",
    merchant: "Netflix",
    amount: 15.99,
    date: "2024-01-12",
    category: "Entertainment",
    icon: Play,
    status: "completed",
    location: "Subscription"
  },
  {
    id: "7",
    merchant: "Target",
    amount: 78.45,
    date: "2024-01-12",
    category: "Shopping",
    icon: ShoppingBag,
    status: "completed",
    location: "Downtown Mall"
  },
  {
    id: "8",
    merchant: "Uber",
    amount: 23.50,
    date: "2024-01-11",
    category: "Transportation",
    icon: Car,
    status: "completed",
    location: "Ride Share"
  },
  {
    id: "9",
    merchant: "Chipotle",
    amount: 8.75,
    date: "2024-01-11",
    category: "Food & Dining",
    icon: Utensils,
    status: "completed",
    location: "Campus Center"
  },
  {
    id: "10",
    merchant: "Spotify",
    amount: 9.99,
    date: "2024-01-10",
    category: "Entertainment",
    icon: Play,
    status: "completed",
    location: "Subscription"
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
    color: "#3B82F6",
  },
};

export default function Transactions() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isExporting, setIsExporting] = useState(false);
  
  // Use debounced search hook
  const {
    query: searchQuery,
    setQuery: setSearchQuery,
    results: searchResults,
    searchTerms,
    filters,
    isLoading: isSearching,
    isError: searchError
  } = useDebouncedSearch({
    debounceMs: 300,
    minQueryLength: 1,
    limit: 50
  });

  // Use autocomplete hook
  const { suggestions, saveRecentSearch } = useAutocomplete();

  // Handle autocomplete selection
  const handleAutocompleteSelect = (item: any) => {
    setSearchQuery(item.value);
    saveRecentSearch(item.value);
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // Get all transactions for fallback and category filtering
  const { data: allTransactionsData, isLoading: isLoadingTransactions } = useTransactions({
    limit: 100
  });

  const allTransactions = allTransactionsData?.transactions || mockTransactions;

  // Determine which transactions to display
  const displayTransactions = useMemo(() => {
    // If user is searching and we have search results, use those
    if (searchQuery.trim().length > 0 && searchResults.length > 0) {
      return searchResults;
    }
    
    // If user is searching but no results, return empty array
    if (searchQuery.trim().length > 0 && !isSearching) {
      return [];
    }
    
    // Otherwise, use all transactions and filter by category
    return allTransactions.filter((transaction) => {
      return selectedCategory === "all" || transaction.category === selectedCategory;
    });
  }, [searchQuery, searchResults, isSearching, allTransactions, selectedCategory]);
  
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
      
      // Calculate totals
      const totalAmount = mockTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      const categoryTotals = mockTransactions.reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {} as Record<string, number>);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Total Transactions: ${mockTransactions.length}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Total Amount: $${totalAmount.toFixed(2)}`, 20, yPosition);
      yPosition += 8;
      pdf.text(`Average Transaction: $${(totalAmount / mockTransactions.length).toFixed(2)}`, 20, yPosition);
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
      
      mockTransactions.forEach((transaction) => {
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
              <div className="relative">
                {isSearching && (
                  <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 animate-spin z-10" />
                )}
                <Autocomplete
                  value={searchQuery}
                  onChange={setSearchQuery}
                  onSelect={handleAutocompleteSelect}
                  suggestions={suggestions}
                  isLoading={isSearching}
                  placeholder="Search transactions... (e.g., merchant:Starbucks, amount>50, food)"
                  disabled={isLoadingTransactions}
                  className="pl-10"
                />
                {!isSearching && (
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
                )}
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 z-10"
                    onClick={handleClearSearch}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                )}
              </div>
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
            <div className="flex items-center justify-between">
              <CardTitle>
                {searchQuery.trim().length > 0 ? 'Search Results' : 'Recent Transactions'}
              </CardTitle>
              {searchQuery.trim().length > 0 && !isSearching && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {displayTransactions.length} result{displayTransactions.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              )}
            </div>
            {searchQuery.trim().length > 0 && (
              <div className="mt-2 p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Search:</span>
                  <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                    {searchQuery}
                  </code>
                </div>
                {filters && Object.keys(filters).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground">Active filters:</span>
                    {Object.entries(filters).map(([key, value]) => (
                      <Badge key={key} variant="secondary" className="text-xs">
                        {key}: {typeof value === 'object' && value.contains ? value.contains : String(value)}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  <strong>Examples:</strong> merchant:Starbucks, amount&gt;50, category:food, status:completed
                </div>
              </div>
            )}
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
                  {isSearching ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                          <p className="text-muted-foreground">Searching transactions...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : displayTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 bg-muted/20 rounded-full">
                            <Search className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {searchQuery.trim().length > 0 
                                ? "No transactions found"
                                : "No transactions available"
                              }
                            </h3>
                            <p className="text-muted-foreground max-w-md">
                              {searchQuery.trim().length > 0 
                                ? `No transactions match your search "${searchQuery}". Try adjusting your search terms or filters.`
                                : "There are no transactions to display. Try adjusting your category filter or add some transactions."
                              }
                            </p>
                          </div>
                          {searchQuery.trim().length > 0 && (
                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                              <p className="font-medium">Search tips:</p>
                              <ul className="text-left space-y-1">
                                <li>• Try general terms like "food" or "coffee"</li>
                                <li>• Use specific filters: merchant:Starbucks</li>
                                <li>• Search by amount: amount&gt;50</li>
                                <li>• Check your spelling</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayTransactions.map((transaction) => {
                      // Map category to icon
                      const getCategoryIcon = (category: string) => {
                        switch (category.toLowerCase()) {
                          case 'food & dining':
                          case 'food':
                            return Utensils;
                          case 'shopping':
                            return ShoppingBag;
                          case 'transportation':
                            return Car;
                          case 'utilities':
                            return Home;
                          case 'entertainment':
                            return Play;
                          default:
                            return Coffee;
                        }
                      };

                      const IconComponent = getCategoryIcon(transaction.category);
                      const statusIcon = transaction.status === 'COMPLETED' ? CheckCircle : 
                                        transaction.status === 'PENDING' ? Loader2 : XCircle;
                      const statusColor = transaction.status === 'COMPLETED' ? 'text-green-600' : 
                                        transaction.status === 'PENDING' ? 'text-yellow-600' : 'text-red-600';

                      return (
                        <TableRow key={transaction.id} className="hover:bg-muted/20">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <IconComponent className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  <HighlightText 
                                    text={transaction.merchant} 
                                    searchTerms={searchTerms}
                                  />
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  <HighlightText 
                                    text={transaction.location || 'No location'} 
                                    searchTerms={searchTerms}
                                  />
                                </p>
                                {transaction.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    <HighlightText 
                                      text={transaction.description} 
                                      searchTerms={searchTerms}
                                    />
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              <HighlightText 
                                text={transaction.category} 
                                searchTerms={searchTerms}
                              />
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold">
                            ${Number(transaction.amount).toFixed(2)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {React.createElement(statusIcon, { className: `w-4 h-4 ${statusColor}` })}
                              <span className={`text-sm ${statusColor}`}>
                                {transaction.status}
                              </span>
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
              <div className="h-[200px] w-full flex items-center justify-center">
                <PieChart width={200} height={200}>
                  <Pie
                    data={categoryData}
                    cx={100}
                    cy={100}
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </div>
              
              <div className="legend-container-responsive space-y-2 mt-4">
                {categoryData.map((category) => (
                  <div key={category.name} className="flex items-center justify-between text-sm legend-item">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div 
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="truncate">{category.name}</span>
                    </div>
                    <span className="font-semibold ml-2 flex-shrink-0">${category.value}</span>
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
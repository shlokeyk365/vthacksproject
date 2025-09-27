import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownLeft, Coffee, ShoppingBag, Car, Home } from "lucide-react";

const mockTransactions = [
  {
    id: "1",
    merchant: "Starbucks Coffee",
    amount: -5.47,
    date: "2024-01-15",
    category: "Food & Dining",
    icon: Coffee,
    status: "completed"
  },
  {
    id: "2",
    merchant: "Amazon",
    amount: -129.99,
    date: "2024-01-14",
    category: "Shopping",
    icon: ShoppingBag,
    status: "completed"
  },
  {
    id: "3",
    merchant: "Shell Gas Station",
    amount: -45.20,
    date: "2024-01-14",
    category: "Transportation",
    icon: Car,
    status: "completed"
  },
  {
    id: "4",
    merchant: "Electric Company",
    amount: -156.78,
    date: "2024-01-13",
    category: "Utilities",
    icon: Home,
    status: "completed"
  },
  {
    id: "5",
    merchant: "Salary Deposit",
    amount: 3200.00,
    date: "2024-01-12",
    category: "Income",
    icon: ArrowDownLeft,
    status: "completed"
  },
];

export function RecentTransactions() {
  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Recent Transactions
          <Badge variant="secondary" className="ml-auto">
            {mockTransactions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {mockTransactions.map((transaction) => {
              const IconComponent = transaction.icon;
              const isIncome = transaction.amount > 0;
              
              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isIncome 
                        ? 'bg-success/10 text-success' 
                        : 'bg-primary/10 text-primary'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.merchant}</p>
                      <p className="text-xs text-muted-foreground">{transaction.category}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-semibold ${
                      isIncome ? 'text-success' : 'text-foreground'
                    }`}>
                      {isIncome ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
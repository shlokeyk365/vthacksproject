import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertTriangle } from "lucide-react";

interface BudgetStatusProps {
  monthlyBudget: number;
  totalSpent: number;
}

export function BudgetStatus({ monthlyBudget, totalSpent }: BudgetStatusProps) {
  const budgetRemaining = monthlyBudget - totalSpent;
  const spentPercentage = (totalSpent / monthlyBudget) * 100;
  const isOverBudget = totalSpent > monthlyBudget;

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Budget Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Monthly Budget</span>
          <span className="font-semibold">${monthlyBudget.toLocaleString()}</span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              isOverBudget 
                ? 'bg-red-500' 
                : spentPercentage > 80 
                  ? 'bg-yellow-500' 
                  : 'bg-green-500'
            }`}
            style={{ 
              width: `${Math.min(spentPercentage, 100)}%`,
              maxWidth: '100%'
            }}
          ></div>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className={`font-medium ${isOverBudget ? 'text-red-500' : 'text-muted-foreground'}`}>
            ${totalSpent.toLocaleString()} spent
          </span>
          <span className={`font-medium ${budgetRemaining < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
            {budgetRemaining < 0 
              ? `$${Math.abs(budgetRemaining).toLocaleString()} over budget`
              : `$${budgetRemaining.toLocaleString()} remaining`
            }
          </span>
        </div>

        {isOverBudget && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700 font-medium">
              Budget exceeded by ${Math.abs(budgetRemaining).toLocaleString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

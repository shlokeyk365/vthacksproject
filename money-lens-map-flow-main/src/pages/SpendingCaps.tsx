import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Target, 
  Store, 
  Calendar, 
  DollarSign, 
  Edit, 
  Trash2,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const mockCaps = [
  {
    id: "1",
    type: "merchant",
    name: "Starbucks Coffee",
    limit: 100,
    spent: 85,
    period: "monthly",
    enabled: true,
    category: "Food & Dining"
  },
  {
    id: "2",
    type: "category",
    name: "Food & Dining",
    limit: 500,
    spent: 420,
    period: "monthly",
    enabled: true,
    category: "Food & Dining"
  },
  {
    id: "3",
    type: "global",
    name: "Monthly Budget",
    limit: 3500,
    spent: 2847,
    period: "monthly",
    enabled: true,
    category: "All Categories"
  },
  {
    id: "4",
    type: "merchant",
    name: "Amazon",
    limit: 300,
    spent: 156,
    period: "monthly",
    enabled: false,
    category: "Shopping"
  },
];

export default function SpendingCaps() {
  const [caps, setCaps] = useState(mockCaps);

  const toggleCap = (id: string) => {
    setCaps(caps.map(cap => 
      cap.id === id ? { ...cap, enabled: !cap.enabled } : cap
    ));
  };

  const getCapStatus = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return { status: "exceeded", color: "danger" };
    if (percentage >= 80) return { status: "warning", color: "warning" };
    return { status: "safe", color: "success" };
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "merchant": return Store;
      case "category": return Target;
      case "global": return DollarSign;
      default: return Target;
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
          <h1 className="text-3xl font-bold">Spending Caps</h1>
          <p className="text-muted-foreground">
            Manage your spending limits and financial rules
          </p>
        </div>
        
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Cap
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Caps</p>
                <p className="text-2xl font-bold">{caps.filter(c => c.enabled).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Saved</p>
                <p className="text-2xl font-bold">$1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Caps List */}
      <div className="grid gap-4">
        {caps.map((cap) => {
          const IconComponent = getTypeIcon(cap.type);
          const { status, color } = getCapStatus(cap.spent, cap.limit);
          const percentage = Math.min((cap.spent / cap.limit) * 100, 100);
          
          return (
            <motion.div
              key={cap.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className={`${cap.enabled ? 'card-gradient' : 'opacity-60'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        color === 'danger' ? 'bg-danger/10' :
                        color === 'warning' ? 'bg-warning/10' : 'bg-success/10'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          color === 'danger' ? 'text-danger' :
                          color === 'warning' ? 'text-warning' : 'text-success'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{cap.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {cap.type.charAt(0).toUpperCase() + cap.type.slice(1)}
                          </Badge>
                          <span>•</span>
                          <Calendar className="w-3 h-3" />
                          <span>{cap.period.charAt(0).toUpperCase() + cap.period.slice(1)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <p className="text-sm text-muted-foreground">
                          ${cap.spent} / ${cap.limit}
                        </p>
                        <p className={`text-sm font-medium ${
                          color === 'danger' ? 'text-danger' :
                          color === 'warning' ? 'text-warning' : 'text-success'
                        }`}>
                          {percentage.toFixed(0)}% used
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCap(cap.id)}
                      >
                        {cap.enabled ? (
                          <ToggleRight className="w-5 h-5 text-primary" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                        )}
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${
                        color === 'danger' ? '[&>div]:bg-danger' :
                        color === 'warning' ? '[&>div]:bg-warning' : '[&>div]:bg-success'
                      }`}
                    />
                    
                    {status === "exceeded" && (
                      <div className="flex items-center gap-2 text-sm text-danger">
                        <AlertTriangle className="w-4 h-4" />
                        Cap exceeded by ${(cap.spent - cap.limit).toFixed(2)}
                      </div>
                    )}
                    
                    {status === "warning" && (
                      <div className="flex items-center gap-2 text-sm text-warning">
                        <AlertTriangle className="w-4 h-4" />
                        Approaching limit - ${(cap.limit - cap.spent).toFixed(2)} remaining
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Analytics Section */}
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle>Cap Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-success">$1,247</h3>
              <p className="text-sm text-muted-foreground">Total Savings This Month</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-primary">87%</h3>
              <p className="text-sm text-muted-foreground">Average Cap Adherence</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-warning">3</h3>
              <p className="text-sm text-muted-foreground">Caps Exceeded This Month</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
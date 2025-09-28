import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/contexts/NotificationContext";
import { 
  Plus, 
  Target, 
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Loader2
} from "lucide-react";
import { useSpendingCaps } from "@/hooks/useApi";
import CapEditor from "@/components/spending-caps/CapEditor";
import SpendingCapCard from "@/components/spending-caps/SpendingCapCard";

export default function SpendingCaps() {
  const [isAddCapOpen, setIsAddCapOpen] = useState(false);
  const { data: caps = [], isLoading, refetch } = useSpendingCaps();
  const { checkSpendingAlerts } = useNotifications();

  const handleAddCapSuccess = () => {
    setIsAddCapOpen(false);
    refetch();
  };

  const handleCapUpdate = () => {
    refetch();
  };

  // Check for spending alerts when caps change
  useEffect(() => {
    if (caps.length > 0) {
      // Simulate current spending for demo purposes
      const mockSpending = {
        'Food & Dining': 450,
        'Shopping': 320,
        'Transportation': 180,
        'Entertainment': 120,
        'Utilities': 150
      };

      caps.forEach(cap => {
        const currentSpending = mockSpending[cap.category] || 0;
        checkSpendingAlerts(currentSpending, [cap]);
      });
    }
  }, [caps, checkSpendingAlerts]);

  // Calculate analytics
  const activeCaps = caps.filter(cap => cap.enabled);
  const atRiskCaps = caps.filter(cap => {
    const percentage = ((cap.spent || 0) / cap.limit) * 100;
    return cap.enabled && percentage >= 80 && percentage < 100;
  });
  const exceededCaps = caps.filter(cap => {
    const percentage = ((cap.spent || 0) / cap.limit) * 100;
    return cap.enabled && percentage >= 100;
  });
  const onTrackCaps = caps.filter(cap => {
    const percentage = ((cap.spent || 0) / cap.limit) * 100;
    return cap.enabled && percentage < 80;
  });

  const totalSaved = caps.reduce((sum, cap) => {
    const remaining = cap.limit - (cap.spent || 0);
    return sum + Math.max(0, remaining);
  }, 0);

  const averageAdherence = caps.length > 0 
    ? caps.reduce((sum, cap) => {
        const percentage = ((cap.spent || 0) / cap.limit) * 100;
        return sum + Math.min(percentage, 100);
      }, 0) / caps.length
    : 0;

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
          <h1 className="text-3xl font-bold">Spending Caps</h1>
          <p className="text-muted-foreground">
            Manage your spending limits and financial rules
          </p>
        </div>
        
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsAddCapOpen(true)}
        >
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
                <span className="text-2xl">🎯</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Caps</p>
                <p className="text-2xl font-bold">{activeCaps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold">{atRiskCaps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold">{onTrackCaps.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-gradient">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Saved</p>
                <p className="text-2xl font-bold">${totalSaved.toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Caps List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : caps.length === 0 ? (
        <Card className="card-gradient">
          <CardContent className="p-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Spending Caps Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first spending cap to start managing your finances better.
            </p>
            <Button onClick={() => setIsAddCapOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Cap
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {caps.map((cap) => (
            <SpendingCapCard
              key={cap.id}
              cap={cap}
              onUpdate={handleCapUpdate}
            />
          ))}
        </div>
      )}

      {/* Analytics Section */}
      {caps.length > 0 && (
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle>Cap Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-success">${totalSaved.toFixed(0)}</h3>
                <p className="text-sm text-muted-foreground">Total Savings This Period</p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-primary">{averageAdherence.toFixed(0)}%</h3>
                <p className="text-sm text-muted-foreground">Average Cap Adherence</p>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-warning">{exceededCaps.length}</h3>
                <p className="text-sm text-muted-foreground">Caps Exceeded This Period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Cap Dialog */}
      <CapEditor
        isOpen={isAddCapOpen}
        onClose={() => setIsAddCapOpen(false)}
        onSuccess={handleAddCapSuccess}
      />
    </motion.div>
  );
}
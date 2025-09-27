import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFinancialBodyguard } from '@/contexts/FinancialBodyguardContext';
import { 
  CreditCard, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface SimulatedTransaction {
  id: string;
  amount: number;
  merchant: string;
  category: string;
  timestamp: number;
  location?: {
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: number;
  };
}

const MERCHANTS = [
  { name: 'Starbucks', category: 'Coffee & Tea', riskLevel: 'medium' },
  { name: 'Target', category: 'Retail', riskLevel: 'high' },
  { name: 'Kroger', category: 'Grocery', riskLevel: 'low' },
  { name: 'McDonald\'s', category: 'Fast Food', riskLevel: 'low' },
  { name: 'Apple Store', category: 'Electronics', riskLevel: 'high' },
  { name: 'Gas Station', category: 'Fuel', riskLevel: 'low' },
  { name: 'Amazon', category: 'Online', riskLevel: 'high' },
  { name: 'Local Bar', category: 'Entertainment', riskLevel: 'high' },
];

const CATEGORIES = [
  'Coffee & Tea',
  'Retail',
  'Grocery',
  'Fast Food',
  'Electronics',
  'Fuel',
  'Online',
  'Entertainment',
  'Transportation',
  'Healthcare'
];

export const TransactionSimulator: React.FC = () => {
  const { 
    assessTransactionRisk, 
    addTransaction, 
    currentLocation,
    isActive,
    showAlert 
  } = useFinancialBodyguard();

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(5000); // 5 seconds
  const [simulatedTransactions, setSimulatedTransactions] = useState<SimulatedTransaction[]>([]);
  const [lastRiskAssessment, setLastRiskAssessment] = useState<any>(null);

  // Manual transaction form
  const [manualTransaction, setManualTransaction] = useState({
    amount: '',
    merchant: '',
    category: ''
  });

  // Simulate random transactions
  useEffect(() => {
    if (!isSimulating || !isActive) return;

    const interval = setInterval(() => {
      const randomMerchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
      const randomAmount = Math.floor(Math.random() * 200) + 5; // $5-$205
      
      const transaction: SimulatedTransaction = {
        id: Date.now().toString(),
        amount: randomAmount,
        merchant: randomMerchant.name,
        category: randomMerchant.category,
        timestamp: Date.now(),
        location: currentLocation ? {
          lat: currentLocation.lat + (Math.random() - 0.5) * 0.01, // Add some randomness
          lng: currentLocation.lng + (Math.random() - 0.5) * 0.01,
          accuracy: 50,
          timestamp: Date.now()
        } : undefined
      };

      // Assess risk
      const riskAssessment = assessTransactionRisk(
        transaction.amount,
        transaction.merchant,
        transaction.category
      );

      setLastRiskAssessment(riskAssessment);

      // Add transaction
      addTransaction(transaction);
      setSimulatedTransactions(prev => [transaction, ...prev.slice(0, 9)]); // Keep last 10

      // Show alert based on risk level
      if (riskAssessment.level === 'critical' || riskAssessment.level === 'danger') {
        showAlert(`🚨 High risk transaction: $${transaction.amount} at ${transaction.merchant}`, 'error');
      } else if (riskAssessment.level === 'warning') {
        showAlert(`⚠️ Moderate risk: $${transaction.amount} at ${transaction.merchant}`, 'warning');
      }

    }, simulationSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, isActive, simulationSpeed, currentLocation, assessTransactionRisk, addTransaction, showAlert]);

  const startSimulation = () => {
    setIsSimulating(true);
    showAlert('Transaction simulation started', 'info');
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    showAlert('Transaction simulation stopped', 'info');
  };

  const resetSimulation = () => {
    setSimulatedTransactions([]);
    setLastRiskAssessment(null);
    showAlert('Simulation reset', 'info');
  };

  const handleManualTransaction = () => {
    if (!manualTransaction.amount || !manualTransaction.merchant || !manualTransaction.category) {
      showAlert('Please fill in all fields', 'error');
      return;
    }

    const transaction: SimulatedTransaction = {
      id: Date.now().toString(),
      amount: parseFloat(manualTransaction.amount),
      merchant: manualTransaction.merchant,
      category: manualTransaction.category,
      timestamp: Date.now(),
      location: currentLocation ? {
        lat: currentLocation.lat,
        lng: currentLocation.lng,
        accuracy: currentLocation.accuracy || 50,
        timestamp: Date.now()
      } : undefined
    };

    // Assess risk
    const riskAssessment = assessTransactionRisk(
      transaction.amount,
      transaction.merchant,
      transaction.category
    );

    setLastRiskAssessment(riskAssessment);

    // Add transaction
    addTransaction(transaction);
    setSimulatedTransactions(prev => [transaction, ...prev.slice(0, 9)]);

    // Reset form
    setManualTransaction({ amount: '', merchant: '', category: '' });

    showAlert(`Transaction added: $${transaction.amount} at ${transaction.merchant}`, 'success');
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'danger': return 'bg-orange-500';
      case 'warning': return 'bg-yellow-500';
      case 'caution': return 'bg-blue-500';
      case 'safe': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'danger': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'caution': return <CheckCircle className="w-4 h-4" />;
      case 'safe': return <CheckCircle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Transaction Simulator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Simulation Controls */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={isSimulating ? stopSimulation : startSimulation}
              disabled={!isActive}
              className="flex items-center space-x-2"
            >
              {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isSimulating ? 'Stop' : 'Start'} Simulation</span>
            </Button>
            
            <Button
              onClick={resetSimulation}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </Button>

            <div className="flex items-center space-x-2">
              <Label htmlFor="speed">Speed:</Label>
              <Select
                value={simulationSpeed.toString()}
                onValueChange={(value) => setSimulationSpeed(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000">1s</SelectItem>
                  <SelectItem value="3000">3s</SelectItem>
                  <SelectItem value="5000">5s</SelectItem>
                  <SelectItem value="10000">10s</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!isActive && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Financial Bodyguard must be active to simulate transactions
              </AlertDescription>
            </Alert>
          )}

          {/* Manual Transaction Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={manualTransaction.amount}
                onChange={(e) => setManualTransaction(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="merchant">Merchant</Label>
              <Input
                id="merchant"
                placeholder="Merchant name"
                value={manualTransaction.merchant}
                onChange={(e) => setManualTransaction(prev => ({ ...prev, merchant: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={manualTransaction.category}
                onValueChange={(value) => setManualTransaction(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleManualTransaction}
            disabled={!isActive}
            className="w-full"
          >
            Add Manual Transaction
          </Button>
        </CardContent>
      </Card>

      {/* Last Risk Assessment */}
      {lastRiskAssessment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getRiskLevelIcon(lastRiskAssessment.level)}
              <span>Last Risk Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={`${getRiskLevelColor(lastRiskAssessment.level)} text-white`}>
                  {lastRiskAssessment.level.toUpperCase()}
                </Badge>
                <span className="text-2xl font-bold">{lastRiskAssessment.score}/100</span>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{lastRiskAssessment.recommendation}</AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">Risk Factors:</h4>
                {lastRiskAssessment.factors.map((factor: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{factor.message}</span>
                    <Badge variant="outline">{factor.severity}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {simulatedTransactions.length > 0 ? (
              simulatedTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-medium">{transaction.merchant}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.category} • {new Date(transaction.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${transaction.amount.toFixed(2)}</div>
                    {transaction.location && (
                      <div className="text-xs text-muted-foreground flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>Location tracked</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No transactions yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Merchant Risk Levels */}
      <Card>
        <CardHeader>
          <CardTitle>Merchant Risk Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {MERCHANTS.map((merchant, index) => (
              <div key={index} className="p-3 border rounded">
                <div className="font-medium text-sm">{merchant.name}</div>
                <div className="text-xs text-muted-foreground">{merchant.category}</div>
                <Badge 
                  className={`mt-2 ${
                    merchant.riskLevel === 'high' ? 'bg-red-500' :
                    merchant.riskLevel === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                >
                  {merchant.riskLevel}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

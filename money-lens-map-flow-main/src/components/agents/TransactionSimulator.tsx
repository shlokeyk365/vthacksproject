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
  RotateCcw,
  DollarSign,
  Activity,
  Search
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

// Export the simulator controls as a separate component
export const TransactionSimulatorControls: React.FC<{
  isSimulating: boolean;
  simulationSpeed: number;
  manualTransaction: any;
  onStartSimulation: () => void;
  onStopSimulation: () => void;
  onResetSimulation: () => void;
  onSpeedChange: (speed: number) => void;
  onManualTransactionChange: (field: string, value: string) => void;
  onAddManualTransaction: () => void;
  isActive: boolean;
}> = ({
  isSimulating,
  simulationSpeed,
  manualTransaction,
  onStartSimulation,
  onStopSimulation,
  onResetSimulation,
  onSpeedChange,
  onManualTransactionChange,
  onAddManualTransaction,
  isActive
}) => {
  return (
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
            onClick={isSimulating ? onStopSimulation : onStartSimulation}
            disabled={!isActive}
            className="flex items-center space-x-2"
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isSimulating ? 'Stop' : 'Start'} Simulation</span>
          </Button>
          
          <Button
            onClick={onResetSimulation}
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
              onValueChange={(value) => onSpeedChange(parseInt(value))}
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
              onChange={(e) => onManualTransactionChange('amount', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="merchant">Merchant</Label>
            <Input
              id="merchant"
              placeholder="Merchant name"
              value={manualTransaction.merchant}
              onChange={(e) => onManualTransactionChange('merchant', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={manualTransaction.category}
              onValueChange={(value) => onManualTransactionChange('category', value)}
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
          onClick={onAddManualTransaction}
          disabled={!isActive}
          className="w-full"
        >
          Add Manual Transaction
        </Button>
      </CardContent>
    </Card>
  );
};

// Export the results as a separate component
export const TransactionSimulatorResults: React.FC<{
  simulatedTransactions: SimulatedTransaction[];
  lastRiskAssessment: any;
}> = ({ simulatedTransactions, lastRiskAssessment }) => {
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllRiskFactors, setShowAllRiskFactors] = useState(false);
  const [showAllMerchants, setShowAllMerchants] = useState(false);
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

  // Calculate spending by category with better accuracy
  const spendingByCategory = simulatedTransactions.reduce((acc, transaction) => {
    const category = transaction.category;
    if (!acc[category]) {
      acc[category] = { 
        total: 0, 
        count: 0, 
        average: 0,
        merchants: new Set<string>()
      };
    }
    acc[category].total += transaction.amount;
    acc[category].count += 1;
    acc[category].average = acc[category].total / acc[category].count;
    acc[category].merchants.add(transaction.merchant);
    return acc;
  }, {} as Record<string, { total: number; count: number; average: number; merchants: Set<string> }>);

  // Calculate quick stats with more precision
  const totalSpent = simulatedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const averageTransaction = simulatedTransactions.length > 0 ? totalSpent / simulatedTransactions.length : 0;
  const uniqueMerchants = new Set(simulatedTransactions.map(t => t.merchant)).size;
  const uniqueCategories = new Set(simulatedTransactions.map(t => t.category)).size;
  
  // Calculate additional metrics
  const maxTransaction = simulatedTransactions.length > 0 ? Math.max(...simulatedTransactions.map(t => t.amount)) : 0;
  const minTransaction = simulatedTransactions.length > 0 ? Math.min(...simulatedTransactions.map(t => t.amount)) : 0;
  const recentTransactions = simulatedTransactions.filter(t => Date.now() - t.timestamp < 24 * 60 * 60 * 1000).length;
  const highValueTransactions = simulatedTransactions.filter(t => t.amount > 100).length;

  return (
    <div className="w-full overflow-hidden">
      {/* Single Row: All 4 boxes */}
      <div className="flex w-full gap-4">
        {/* Recent Transactions */}
        <Card className="flex-1 flex flex-col min-w-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {simulatedTransactions.length > 0 ? (
                <>
                  {(showAllTransactions ? simulatedTransactions : simulatedTransactions.slice(0, 3)).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="font-medium text-base break-words">{transaction.merchant}</div>
                        <div className="text-sm text-muted-foreground break-words">
                          {transaction.category} • {new Date(transaction.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-base">${transaction.amount.toFixed(2)}</div>
                        {transaction.location && (
                          <div className="text-xs text-muted-foreground flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>Location tracked</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {simulatedTransactions.length > 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllTransactions(!showAllTransactions)}
                      className="w-full"
                    >
                      {showAllTransactions ? 'Show Less' : `See All (${simulatedTransactions.length})`}
                    </Button>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <p className="text-muted-foreground text-sm">No transactions yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Spending by Category */}
        {Object.keys(spendingByCategory).length > 0 && (
          <Card className="flex-1 flex flex-col min-w-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-xl font-semibold">
                <DollarSign className="w-6 h-6" />
                <span>Spending by Category</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(showAllCategories ? Object.entries(spendingByCategory) : Object.entries(spendingByCategory).slice(0, 3))
                  .sort(([, a], [, b]) => b.total - a.total)
                  .map(([category, data]) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="font-medium text-base break-words">{category}</div>
                        <div className="text-sm text-muted-foreground break-words">
                          {data.count} transactions • {data.merchants.size} merchants
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-base">${data.total.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">
                          Avg: ${data.average.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                {Object.keys(spendingByCategory).length > 3 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="w-full"
                  >
                    {showAllCategories ? 'Show Less' : `See All (${Object.keys(spendingByCategory).length})`}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Last Risk Assessment */}
        {lastRiskAssessment && (
          <Card className="flex-1 flex flex-col min-w-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-xl font-semibold">
                {getRiskLevelIcon(lastRiskAssessment.level)}
                <span>Risk Assessment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 flex flex-col">
                <div className="flex items-center justify-between">
                  <Badge className={`${getRiskLevelColor(lastRiskAssessment.level)} text-white px-2 py-1 text-xs`}>
                    {lastRiskAssessment.level.toUpperCase()}
                  </Badge>
                  <span className="text-xl font-bold">{lastRiskAssessment.score}/100</span>
                </div>
                
                <Alert className="flex-shrink-0">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{lastRiskAssessment.recommendation}</AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="font-medium text-base">Risk Factors:</h4>
                  {(showAllRiskFactors ? lastRiskAssessment.factors : lastRiskAssessment.factors.slice(0, 3)).map((factor: any, index: number) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-muted/30 rounded-lg border">
                      <span className="text-sm flex-1 min-w-0 mr-2 break-words">{factor.message}</span>
                      <Badge variant="outline" className="text-xs flex-shrink-0">{factor.severity}</Badge>
                    </div>
                  ))}
                  {lastRiskAssessment.factors.length > 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllRiskFactors(!showAllRiskFactors)}
                      className="w-full"
                    >
                      {showAllRiskFactors ? 'Show Less' : `See All (${lastRiskAssessment.factors.length})`}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Merchant Risk Levels */}
        <Card className="flex-1 flex flex-col min-w-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold">Merchant Risk Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(showAllMerchants ? MERCHANTS : MERCHANTS.slice(0, 3)).map((merchant, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg border">
                  <div className="font-medium text-sm mb-1 break-words">{merchant.name}</div>
                  <div className="text-sm text-muted-foreground mb-2 break-words">{merchant.category}</div>
                  <Badge 
                    className={`${
                      merchant.riskLevel === 'high' ? 'bg-red-500 text-white' :
                      merchant.riskLevel === 'medium' ? 'bg-yellow-500 text-white' :
                      'bg-green-500 text-white'
                    } text-xs`}
                  >
                    {merchant.riskLevel}
                  </Badge>
                </div>
              ))}
              {MERCHANTS.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllMerchants(!showAllMerchants)}
                  className="w-full"
                >
                  {showAllMerchants ? 'Show Less' : `See All (${MERCHANTS.length})`}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main component that combines both
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

  // Handler functions for the controls component
  const handleStartSimulation = () => {
    setIsSimulating(true);
    showAlert('Transaction simulation started', 'info');
  };

  const handleStopSimulation = () => {
    setIsSimulating(false);
    showAlert('Transaction simulation stopped', 'info');
  };

  const handleResetSimulation = () => {
    setSimulatedTransactions([]);
    setLastRiskAssessment(null);
    showAlert('Simulation reset', 'info');
  };

  const handleSpeedChange = (speed: number) => {
    setSimulationSpeed(speed);
  };

  const handleManualTransactionChange = (field: string, value: string) => {
    setManualTransaction(prev => ({ ...prev, [field]: value }));
  };

  const handleAddManualTransaction = () => {
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

  return (
    <div className="w-full">
      {/* Top Row: Simulator Controls */}
      <div className="w-full mb-6">
        <TransactionSimulatorControls
          isSimulating={isSimulating}
          simulationSpeed={simulationSpeed}
          manualTransaction={manualTransaction}
          onStartSimulation={handleStartSimulation}
          onStopSimulation={handleStopSimulation}
          onResetSimulation={handleResetSimulation}
          onSpeedChange={handleSpeedChange}
          onManualTransactionChange={handleManualTransactionChange}
          onAddManualTransaction={handleAddManualTransaction}
          isActive={isActive}
        />
      </div>

      {/* Full Width Results */}
      <TransactionSimulatorResults
        simulatedTransactions={simulatedTransactions}
        lastRiskAssessment={lastRiskAssessment}
      />
    </div>
  );
};

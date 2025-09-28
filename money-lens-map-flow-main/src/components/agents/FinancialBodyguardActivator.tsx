import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFinancialBodyguard } from '@/contexts/FinancialBodyguardContext';
import { 
  Shield, 
  MapPin, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  Play,
  Square,
  Activity
} from 'lucide-react';

export const FinancialBodyguardActivator: React.FC = () => {
  const context = useFinancialBodyguard();
  
  if (!context) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Financial Bodyguard Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Financial Bodyguard context not available. Please ensure the agent is properly initialized.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const {
    isActive,
    isTracking,
    currentLocation,
    activateAgent,
    deactivateAgent,
    startLocationTracking,
    stopLocationTracking,
    assessTransactionRisk,
    addTransaction,
    getSpendingPatterns,
    getHighRiskMerchants,
    alerts
  } = context;

  const [testAmount, setTestAmount] = useState('50');
  const [testMerchant, setTestMerchant] = useState('Starbucks');
  const [testCategory, setTestCategory] = useState('Food & Dining');
  const [lastAssessment, setLastAssessment] = useState<any>(null);

  const handleActivate = () => {
    activateAgent();
  };

  const handleDeactivate = () => {
    deactivateAgent();
  };

  const handleStartTracking = async () => {
    try {
      await startLocationTracking();
    } catch (error) {
      console.error('Failed to start location tracking:', error);
    }
  };

  const handleStopTracking = () => {
    stopLocationTracking();
  };

  const handleTestTransaction = () => {
    const amount = parseFloat(testAmount);
    if (isNaN(amount)) return;

    // Add transaction to history
    const transaction = {
      id: Date.now().toString(),
      amount: -amount, // Negative for spending
      merchant: testMerchant,
      category: testCategory,
      timestamp: Date.now(),
      location: currentLocation
    };

    addTransaction(transaction);

    // Assess risk
    const assessment = assessTransactionRisk(amount, testMerchant, testCategory);
    setLastAssessment(assessment);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'danger': return 'bg-orange-500';
      case 'warning': return 'bg-yellow-500';
      case 'caution': return 'bg-blue-500';
      case 'safe': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const spendingPatterns = getSpendingPatterns();
  const highRiskMerchants = getHighRiskMerchants();

  return (
    <div className="space-y-6">
      {/* Activation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Financial Bodyguard Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="font-medium">
                Agent Status: {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <Button
              onClick={isActive ? handleDeactivate : handleActivate}
              variant={isActive ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="font-medium">
                Location Tracking: {isTracking ? 'Active' : 'Stopped'}
              </span>
            </div>
            <Button
              onClick={isTracking ? handleStopTracking : handleStartTracking}
              variant={isTracking ? "destructive" : "default"}
              className="flex items-center gap-2"
            >
              {isTracking ? <Square className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </Button>
          </div>

          {currentLocation && (
            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                Current Location: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                {currentLocation.accuracy && ` (Accuracy: ${Math.round(currentLocation.accuracy)}m)`}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Transaction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Test Transaction Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="testAmount">Amount ($)</Label>
              <Input
                id="testAmount"
                type="number"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                placeholder="50.00"
              />
            </div>
            <div>
              <Label htmlFor="testMerchant">Merchant</Label>
              <Input
                id="testMerchant"
                value={testMerchant}
                onChange={(e) => setTestMerchant(e.target.value)}
                placeholder="Starbucks"
              />
            </div>
            <div>
              <Label htmlFor="testCategory">Category</Label>
              <Input
                id="testCategory"
                value={testCategory}
                onChange={(e) => setTestCategory(e.target.value)}
                placeholder="Food & Dining"
              />
            </div>
          </div>

          <Button
            onClick={handleTestTransaction}
            className="w-full"
            disabled={!isActive}
          >
            <Activity className="w-4 h-4 mr-2" />
            Test Transaction Risk
          </Button>

          {lastAssessment && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className={`${getRiskColor(lastAssessment.level)} text-white`}>
                  {lastAssessment.level.toUpperCase()}
                </Badge>
                <span className="text-2xl font-bold">{lastAssessment.score}/100</span>
              </div>
              
              <Alert className={lastAssessment.level === 'critical' || lastAssessment.level === 'danger' ? 'border-red-500' : ''}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{lastAssessment.recommendation}</AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">Risk Factors:</h4>
                {lastAssessment.factors.map((factor: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{factor.message}</span>
                    <Badge variant="outline">{factor.severity}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spending Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Detected Spending Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {spendingPatterns.length > 0 ? (
            <div className="space-y-3">
            {spendingPatterns.map((pattern, index) => (
              <div key={`pattern-${pattern.merchant}-${index}`} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{pattern.merchant}</div>
                    <div className="text-sm text-muted-foreground">
                      ${pattern.totalSpent.toFixed(2)} • {pattern.visitCount} visits
                    </div>
                  </div>
                  <Badge 
                    className={
                      pattern.riskLevel === 'high' ? 'bg-red-500' :
                      pattern.riskLevel === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }
                  >
                    {pattern.riskLevel}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No spending patterns detected yet. Test some transactions to build patterns!
            </p>
          )}
        </CardContent>
      </Card>

      {/* High-Risk Merchants */}
      {highRiskMerchants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              High-Risk Merchants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {highRiskMerchants.map((merchant, index) => (
                <div key={`risk-${merchant}-${index}`} className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">{merchant}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(-3).map((alert) => (
                <Alert key={`alert-${alert.id}`} className={alert.dismissed ? 'opacity-50' : ''}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

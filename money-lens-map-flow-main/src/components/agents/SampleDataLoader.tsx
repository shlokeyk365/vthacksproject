import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFinancialBodyguard } from '@/contexts/FinancialBodyguardContext';
import { Database, MapPin, DollarSign, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const SampleDataLoader: React.FC = () => {
  const context = useFinancialBodyguard();
  
  if (!context) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Sample Data Loader
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
  
  const { addTransaction, addGeofence, getSpendingPatterns, getGeofences } = context;
  
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isLoadingGeofences, setIsLoadingGeofences] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [transactionsLoaded, setTransactionsLoaded] = useState(false);
  const [geofencesLoaded, setGeofencesLoaded] = useState(false);

  const loadSampleTransactions = async () => {
    setIsLoadingTransactions(true);
    setTransactionsLoaded(false);
    
    try {
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));
    const sampleTransactions = [
      {
        id: '1',
        amount: -45.67,
        merchant: 'Starbucks',
        category: 'Food & Dining',
        timestamp: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
        location: {
          lat: 37.2296,
          lng: -80.4139,
          accuracy: 10,
          timestamp: Date.now() - (2 * 60 * 60 * 1000)
        }
      },
      {
        id: '2',
        amount: -120.00,
        merchant: 'Shell Gas Station',
        category: 'Transportation',
        timestamp: Date.now() - (5 * 60 * 60 * 1000), // 5 hours ago
        location: {
          lat: 37.2300,
          lng: -80.4140,
          accuracy: 15,
          timestamp: Date.now() - (5 * 60 * 60 * 1000)
        }
      },
      {
        id: '3',
        amount: -89.99,
        merchant: 'Amazon',
        category: 'Shopping',
        timestamp: Date.now() - (24 * 60 * 60 * 1000), // 1 day ago
        location: {
          lat: 37.2290,
          lng: -80.4145,
          accuracy: 20,
          timestamp: Date.now() - (24 * 60 * 60 * 1000)
        }
      },
      {
        id: '4',
        amount: -25.50,
        merchant: 'McDonald\'s',
        category: 'Food & Dining',
        timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
        location: {
          lat: 37.2305,
          lng: -80.4135,
          accuracy: 12,
          timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000)
        }
      },
      {
        id: '5',
        amount: -15.99,
        merchant: 'Netflix',
        category: 'Entertainment',
        timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 days ago
        location: {
          lat: 37.2295,
          lng: -80.4142,
          accuracy: 8,
          timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000)
        }
      },
      {
        id: '6',
        amount: -200.00,
        merchant: 'Target',
        category: 'Shopping',
        timestamp: Date.now() - (4 * 24 * 60 * 60 * 1000), // 4 days ago
        location: {
          lat: 37.2310,
          lng: -80.4130,
          accuracy: 25,
          timestamp: Date.now() - (4 * 24 * 60 * 60 * 1000)
        }
      },
      {
        id: '7',
        amount: -75.00,
        merchant: 'Uber',
        category: 'Transportation',
        timestamp: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
        location: {
          lat: 37.2285,
          lng: -80.4148,
          accuracy: 18,
          timestamp: Date.now() - (5 * 24 * 60 * 60 * 1000)
        }
      },
      {
        id: '8',
        amount: -12.50,
        merchant: 'CVS Pharmacy',
        category: 'Healthcare',
        timestamp: Date.now() - (6 * 24 * 60 * 60 * 1000), // 6 days ago
        location: {
          lat: 37.2302,
          lng: -80.4138,
          accuracy: 14,
          timestamp: Date.now() - (6 * 24 * 60 * 60 * 1000)
        }
      }
    ];

      sampleTransactions.forEach(transaction => {
        addTransaction(transaction);
      });
      
      setTransactionsLoaded(true);
      toast.success('Sample transactions loaded successfully!', {
        description: `${sampleTransactions.length} transactions added to the system`
      });
    } catch (error) {
      toast.error('Failed to load sample transactions');
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const loadSampleGeofences = async () => {
    setIsLoadingGeofences(true);
    setGeofencesLoaded(false);
    
    try {
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const sampleGeofences = [
      {
        id: 'starbucks-1',
        name: 'Starbucks Downtown',
        center: { lat: 37.2296, lng: -80.4139, timestamp: Date.now() },
        radius: 50,
        type: 'merchant' as const,
        merchantId: 'starbucks'
      },
      {
        id: 'target-1',
        name: 'Target Store',
        center: { lat: 37.2310, lng: -80.4130, timestamp: Date.now() },
        radius: 100,
        type: 'merchant' as const,
        merchantId: 'target'
      },
      {
        id: 'high-risk-zone',
        name: 'High-Risk Shopping Area',
        center: { lat: 37.2300, lng: -80.4140, timestamp: Date.now() },
        radius: 200,
        type: 'high_risk' as const
      },
      {
        id: 'safe-zone',
        name: 'Safe Zone - Home',
        center: { lat: 37.2295, lng: -80.4142, timestamp: Date.now() },
        radius: 150,
        type: 'safe_zone' as const
      }
    ];

      sampleGeofences.forEach(geofence => {
        addGeofence(geofence);
      });
      
      setGeofencesLoaded(true);
      toast.success('Sample geofences loaded successfully!', {
        description: `${sampleGeofences.length} geofences added to the system`
      });
    } catch (error) {
      toast.error('Failed to load sample geofences');
      console.error('Error loading geofences:', error);
    } finally {
      setIsLoadingGeofences(false);
    }
  };

  const loadAllSampleData = async () => {
    setIsLoadingAll(true);
    setTransactionsLoaded(false);
    setGeofencesLoaded(false);
    
    try {
      // Load transactions first
      await loadSampleTransactions();
      // Then load geofences
      await loadSampleGeofences();
      
      toast.success('All sample data loaded successfully!', {
        description: 'Transactions and geofences are now ready for AI analysis'
      });
    } catch (error) {
      toast.error('Failed to load sample data');
      console.error('Error loading all data:', error);
    } finally {
      setIsLoadingAll(false);
    }
  };

  const spendingPatterns = getSpendingPatterns();
  const geofences = getGeofences();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Sample Data Loader
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Load sample transactions and geofences to test the Financial Bodyguard AI agent.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={loadSampleTransactions}
            variant="outline"
            disabled={isLoadingTransactions || isLoadingAll}
            className="flex items-center gap-2"
          >
            {isLoadingTransactions ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : transactionsLoaded ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <DollarSign className="w-4 h-4" />
            )}
            {isLoadingTransactions ? 'Loading...' : transactionsLoaded ? 'Loaded!' : 'Load Sample Transactions'}
          </Button>

          <Button
            onClick={loadSampleGeofences}
            variant="outline"
            disabled={isLoadingGeofences || isLoadingAll}
            className="flex items-center gap-2"
          >
            {isLoadingGeofences ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : geofencesLoaded ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            {isLoadingGeofences ? 'Loading...' : geofencesLoaded ? 'Loaded!' : 'Load Sample Geofences'}
          </Button>

          <Button
            onClick={loadAllSampleData}
            disabled={isLoadingAll || isLoadingTransactions || isLoadingGeofences}
            className="flex items-center gap-2"
          >
            {isLoadingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (transactionsLoaded && geofencesLoaded) ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            {isLoadingAll ? 'Loading All...' : (transactionsLoaded && geofencesLoaded) ? 'All Loaded!' : 'Load All Sample Data'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Current Data</h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Spending Patterns:</span>
                <Badge variant="outline">{spendingPatterns.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Geofences:</span>
                <Badge variant="outline">{geofences.length}</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Sample Data Includes</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 8 sample transactions</li>
              <li>• 4 geofences (merchants & zones)</li>
              <li>• Various spending patterns</li>
              <li>• Location data for testing</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  MapPin, 
  Calendar,
  Users,
  Building,
  AlertCircle,
  CheckCircle,
  ArrowUpDown,
  Plus,
  ExternalLink
} from 'lucide-react';
import { useNessieCustomers, useNessieCustomerData, useTransferMoney, useCreateNessieTransaction } from '@/hooks/useNessie';
import { isNessieConfigured } from '@/lib/nessieApi';
import { toast } from 'sonner';

export function RealBankingDashboard() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferDescription, setTransferDescription] = useState<string>('');
  const [transactionAmount, setTransactionAmount] = useState<string>('');
  const [transactionDescription, setTransactionDescription] = useState<string>('');

  // Check if Nessie API is configured
  if (!isNessieConfigured()) {
    return (
      <Card className="card-gradient border-warning/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-6 h-6 text-warning" />
            Nessie API Not Configured
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-warning">
              <AlertCircle className="w-5 h-5" />
              <span>Nessie API key is not configured</span>
            </div>
            <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
              <h4 className="font-semibold mb-2">Setup Instructions:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Go to <a href="http://api.nessieisreal.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">api.nessieisreal.com</a></li>
                <li>Sign in with GitHub</li>
                <li>Copy your API key from your profile</li>
                <li>Create a <code className="bg-muted px-1 rounded">.env</code> file in the project root</li>
                <li>Add: <code className="bg-muted px-1 rounded">VITE_NESSIE_API_KEY=your-api-key-here</code></li>
                <li>Restart the development server</li>
              </ol>
            </div>
            <Button 
              onClick={() => window.open('http://api.nessieisreal.com/', '_blank')}
              variant="outline"
              className="w-full"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Get Your API Key
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { data: customers, isLoading: customersLoading } = useNessieCustomers();
  const { customer, accounts, spendingAnalysis, isLoading, error } = useNessieCustomerData(selectedCustomerId);
  
  const transferMoney = useTransferMoney();
  const createTransaction = useCreateNessieTransaction();

  const handleTransfer = async () => {
    if (!selectedCustomerId || !transferAmount || !transferDescription) {
      toast.error('Please fill in all transfer fields');
      return;
    }

    if (accounts.data && accounts.data.length >= 2) {
      try {
        await transferMoney.mutateAsync({
          fromAccountId: accounts.data[0]._id,
          toAccountId: accounts.data[1]._id,
          amount: parseFloat(transferAmount),
          description: transferDescription,
        });
        toast.success('Transfer completed successfully!');
        setTransferAmount('');
        setTransferDescription('');
      } catch (error) {
        toast.error('Transfer failed. Please try again.');
      }
    } else {
      toast.error('Need at least 2 accounts to transfer between');
    }
  };

  const handleCreateTransaction = async () => {
    if (!selectedCustomerId || !transactionAmount || !transactionDescription) {
      toast.error('Please fill in all transaction fields');
      return;
    }

    if (accounts.data && accounts.data.length > 0) {
      try {
        await createTransaction.mutateAsync({
          accountId: accounts.data[0]._id,
          transactionData: {
            type: 'purchase',
            amount: parseFloat(transactionAmount),
            description: transactionDescription,
            medium: 'balance',
            status: 'completed',
            transaction_date: new Date().toISOString(),
          },
        });
        toast.success('Transaction created successfully!');
        setTransactionAmount('');
        setTransactionDescription('');
      } catch (error) {
        toast.error('Transaction creation failed. Please try again.');
      }
    }
  };

  if (customersLoading) {
    return (
      <Card className="card-gradient">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading Nessie API data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="card-gradient border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <span>Failed to load Nessie API data. Please check your API key.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="card-gradient border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-6 h-6 text-primary" />
            Capital One Nessie API Integration
            <Badge variant="secondary" className="ml-auto">
              Real Banking Data
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer-select">Select Customer</Label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer._id} value={customer._id}>
                      {customer.first_name} {customer.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={() => window.open('http://api.nessieisreal.com/', '_blank')}
                variant="outline"
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Nessie API Docs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedCustomerId && (
        <>
          {/* Customer Info */}
          {customer.data && (
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-semibold">{customer.data.first_name} {customer.data.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-semibold">
                      {customer.data.address.street_number} {customer.data.address.street_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {customer.data.address.city}, {customer.data.address.state} {customer.data.address.zip}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Accounts */}
          {accounts.data && accounts.data.length > 0 && (
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Accounts ({accounts.data.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accounts.data.map((account) => (
                    <div key={account._id} className="p-4 border rounded-lg bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{account.nickname}</h4>
                        <Badge variant={account.balance >= 0 ? 'default' : 'destructive'}>
                          {account.balance >= 0 ? 'Positive' : 'Negative'}
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-primary">
                        ${account.balance.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {account.type} • {account.rewards} rewards
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Spending Analysis */}
          {spendingAnalysis.data && (
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Spending Analysis (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      ${spendingAnalysis.data.totalSpent.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      ${spendingAnalysis.data.averageDaily.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Daily Average</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {spendingAnalysis.data.topMerchants.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Active Merchants</p>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Spending by Category</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(spendingAnalysis.data.categoryBreakdown).map(([category, amount]) => (
                      <div key={category} className="p-3 border rounded-lg bg-muted/10">
                        <p className="text-sm text-muted-foreground capitalize">{category}</p>
                        <p className="font-semibold">${amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Merchants */}
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Top Merchants</h4>
                  <div className="space-y-2">
                    {spendingAnalysis.data.topMerchants.slice(0, 5).map((merchant, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                        <div>
                          <p className="font-medium">{merchant.merchant}</p>
                          <p className="text-sm text-muted-foreground">{merchant.count} transactions</p>
                        </div>
                        <p className="font-semibold">${merchant.amount.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Banking Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Transfer Money */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="w-5 h-5 text-primary" />
                  Transfer Money
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="transfer-amount">Amount</Label>
                  <Input
                    id="transfer-amount"
                    type="number"
                    placeholder="0.00"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="transfer-description">Description</Label>
                  <Input
                    id="transfer-description"
                    placeholder="Transfer description"
                    value={transferDescription}
                    onChange={(e) => setTransferDescription(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleTransfer}
                  disabled={transferMoney.isPending}
                  className="w-full"
                >
                  {transferMoney.isPending ? 'Processing...' : 'Transfer Money'}
                </Button>
              </CardContent>
            </Card>

            {/* Create Transaction */}
            <Card className="card-gradient">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Create Transaction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="transaction-amount">Amount</Label>
                  <Input
                    id="transaction-amount"
                    type="number"
                    placeholder="0.00"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="transaction-description">Description</Label>
                  <Input
                    id="transaction-description"
                    placeholder="Transaction description"
                    value={transactionDescription}
                    onChange={(e) => setTransactionDescription(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleCreateTransaction}
                  disabled={createTransaction.isPending}
                  className="w-full"
                >
                  {createTransaction.isPending ? 'Processing...' : 'Create Transaction'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

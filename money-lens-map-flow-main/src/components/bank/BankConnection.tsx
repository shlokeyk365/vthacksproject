import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Unlink, Loader2, CheckCircle, Plus, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface Bank {
  id: string;
  name: string;
  logo: string;
  accountCount: number;
}

interface ConnectedBank {
  id: string;
  name: string;
  logo: string;
  connectedAt: string;
  accounts: Array<{
    id: string;
    name: string;
    type: string;
    balance: number;
    mask: string;
  }>;
}

export function BankConnection() {
  const [availableBanks, setAvailableBanks] = useState<Bank[]>([]);
  const [connectedBanks, setConnectedBanks] = useState<ConnectedBank[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);

  // Get available banks
  useEffect(() => {
    const fetchBanks = async () => {
      setIsLoadingBanks(true);
      try {
        const response = await apiClient.getAvailableBanks();
        setAvailableBanks(response.banks);
      } catch (error) {
        console.error('Error fetching banks:', error);
        toast.error('Failed to load available banks');
      } finally {
        setIsLoadingBanks(false);
      }
    };

    fetchBanks();
  }, []);

  // Check connected banks
  useEffect(() => {
    const checkConnectedBanks = async () => {
      try {
        const response = await apiClient.getPlaidAccounts();
        if (response.data?.accounts && response.data.accounts.length > 0) {
          // Group accounts by bank
          const bankMap = new Map<string, ConnectedBank>();
          
          response.data.accounts.forEach((account: any) => {
            const bankId = account.bankName?.toLowerCase().replace(/\s+/g, '_') || 'unknown';
            const bankName = account.bankName || 'Unknown Bank';
            const bankLogo = account.bankLogo || '🏦';
            
            if (!bankMap.has(bankId)) {
              bankMap.set(bankId, {
                id: bankId,
                name: bankName,
                logo: bankLogo,
                connectedAt: account.connectedAt || new Date().toISOString(),
                accounts: []
              });
            }
            
            bankMap.get(bankId)!.accounts.push({
              id: account.id,
              name: account.name,
              type: account.type,
              balance: account.balance,
              mask: account.mask
            });
          });
          
          setConnectedBanks(Array.from(bankMap.values()));
        } else {
          setConnectedBanks([]);
        }
      } catch (error) {
        console.error('Error checking connected banks:', error);
        // No banks connected yet
        setConnectedBanks([]);
      }
    };

    checkConnectedBanks();
  }, []);

  const handleConnectBank = async (bankId: string) => {
    setIsLoading(true);
    try {
      await apiClient.connectBank(bankId);
      toast.success('Bank account connected successfully!');
      
      // Refresh connected banks
      const response = await apiClient.getPlaidAccounts();
      if (response.data?.accounts && response.data.accounts.length > 0) {
        const bankMap = new Map<string, ConnectedBank>();
        
        response.data.accounts.forEach((account: any) => {
          const bankId = account.bankName?.toLowerCase().replace(/\s+/g, '_') || 'unknown';
          const bankName = account.bankName || 'Unknown Bank';
          const bankLogo = account.bankLogo || '🏦';
          
          if (!bankMap.has(bankId)) {
            bankMap.set(bankId, {
              id: bankId,
              name: bankName,
              logo: bankLogo,
              connectedAt: account.connectedAt || new Date().toISOString(),
              accounts: []
            });
          }
          
          bankMap.get(bankId)!.accounts.push({
            id: account.id,
            name: account.name,
            type: account.type,
            balance: account.balance,
            mask: account.mask
          });
        });
        
        setConnectedBanks(Array.from(bankMap.values()));
      }
    } catch (error: any) {
      console.error('Error connecting bank:', error);
      toast.error('Failed to connect bank account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectBank = async (bankId: string) => {
    setIsLoading(true);
    try {
      await apiClient.removePlaidConnection();
      setConnectedBanks([]);
      toast.success('Bank account disconnected');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect bank account');
    } finally {
      setIsLoading(false);
    }
  };

  if (connectedBanks.length > 0) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            Bank Accounts Connected
          </CardTitle>
          <CardDescription>
            Your bank accounts are connected and syncing transactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectedBanks.map((bank) => (
            <div key={bank.id} className="p-4 bg-white rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{bank.logo}</span>
                  <div>
                    <div className="font-medium">{bank.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Connected {new Date(bank.connectedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnectBank(bank.id)}
                  disabled={isLoading}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Unlink className="w-4 h-4" />
                  )}
                  Disconnect
                </Button>
              </div>
              
              <div className="space-y-2">
                {bank.accounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-gray-600" />
                      <div>
                        <div className="font-medium text-sm">{account.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {account.type} • ****{account.mask}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      ${account.balance.toLocaleString()}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Connect Your Bank Account
        </CardTitle>
        <CardDescription>
          Choose from popular banks to connect your account and automatically import transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Secure connection</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Real-time transactions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Automatic categorization</span>
            </div>
          </div>

          {isLoadingBanks ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading banks...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableBanks?.map((bank) => (
                <div
                  key={bank.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleConnectBank(bank.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{bank.logo}</span>
                    <div>
                      <div className="font-medium">{bank.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {bank.accountCount} account{bank.accountCount !== 1 ? 's' : ''} available
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={isLoading}
                    className="ml-auto"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Demo Mode • No real bank connections required
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

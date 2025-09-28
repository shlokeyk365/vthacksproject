import React, { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Unlink, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

interface PlaidLinkProps {
  onSuccess?: () => void;
  onExit?: () => void;
}

export function PlaidLink({ onSuccess, onExit }: PlaidLinkProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);

  // Get link token
  useEffect(() => {
    const getLinkToken = async () => {
      try {
        const response = await apiClient.createLinkToken();
        setLinkToken(response.link_token);
      } catch (error: any) {
        console.error('Error getting link token:', error);
        if (error.message?.includes('Plaid credentials not configured')) {
          toast.error('Bank connection not configured. Please contact support.');
        } else {
          toast.error('Failed to initialize bank connection');
        }
      }
    };

    getLinkToken();
  }, []);

  // Check if already connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await apiClient.getPlaidAccounts();
        if (response.accounts && response.accounts.length > 0) {
          setIsConnected(true);
          setAccounts(response.accounts);
        }
      } catch (error) {
        // Not connected yet
        setIsConnected(false);
      }
    };

    checkConnection();
  }, []);

  const onPlaidSuccess = async (publicToken: string) => {
    setIsLoading(true);
    try {
      await apiClient.exchangePlaidToken(publicToken);
      setIsConnected(true);
      toast.success('Bank account connected successfully!');
      onSuccess?.();
    } catch (error) {
      console.error('Error exchanging token:', error);
      toast.error('Failed to connect bank account');
    } finally {
      setIsLoading(false);
    }
  };

  const onPlaidExit = () => {
    onExit?.();
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onPlaidSuccess,
    onExit: onPlaidExit,
  });

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await apiClient.removePlaidConnection();
      setIsConnected(false);
      setAccounts([]);
      toast.success('Bank account disconnected');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect bank account');
    } finally {
      setIsLoading(false);
    }
  };

  if (isConnected) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="w-5 h-5" />
            Bank Account Connected
          </CardTitle>
          <CardDescription>
            Your bank account is successfully connected and syncing transactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {accounts.map((account) => (
            <div key={account.account_id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">{account.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {account.type} • ****{account.mask}
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                ${account.balances?.available?.toLocaleString() || '0'}
              </Badge>
            </div>
          ))}
          
          <Button
            variant="outline"
            onClick={handleDisconnect}
            disabled={isLoading}
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Unlink className="w-4 h-4 mr-2" />
            )}
            Disconnect Bank Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Connect Your Bank Account
        </CardTitle>
        <CardDescription>
          Securely connect your bank account to automatically import transactions and get real-time financial insights.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Bank-level security</span>
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

          <Button
            onClick={() => open()}
            disabled={!ready || isLoading || !linkToken}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4 mr-2" />
            )}
            {isLoading ? 'Connecting...' : !linkToken ? 'Bank Connection Not Available' : 'Connect Bank Account'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Powered by Plaid • Your credentials are never stored
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { FinancialBodyguardDashboard } from '@/components/agents/FinancialBodyguardDashboard';
import { TransactionSimulator } from '@/components/agents/TransactionSimulator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const FinancialBodyguardPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Financial Bodyguard Agent</h1>
        <p className="text-muted-foreground">
          AI-powered spending protection that monitors your location and spending patterns in real-time
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="simulator">Transaction Simulator</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <FinancialBodyguardDashboard />
        </TabsContent>
        
        <TabsContent value="simulator">
          <TransactionSimulator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

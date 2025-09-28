import React from 'react';
import { FinancialBodyguardDashboard } from '@/components/agents/FinancialBodyguardDashboard';
import { FinancialBodyguardActivator } from '@/components/agents/FinancialBodyguardActivator';
import { SampleDataLoader } from '@/components/agents/SampleDataLoader';
import { AIInsightsDashboard } from '@/components/agents/AIInsightsDashboard';
import { TransactionSimulator } from '@/components/agents/TransactionSimulator';
import { GeolocationNotificationManager } from '@/components/agents/GeolocationNotificationManager';
import { SpendingAlertDemo } from '@/components/agents/SpendingAlertDemo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const FinancialBodyguardPage: React.FC = () => {
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Financial Bodyguard Agent</h1>
        <p className="text-muted-foreground">
          AI-powered spending protection that monitors your location and spending patterns in real-time
        </p>
      </div>

      <Tabs defaultValue="activator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="activator">Quick Start</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
          <TabsTrigger value="simulator">Transaction Simulator</TabsTrigger>
          <TabsTrigger value="geolocation">Location Notifications</TabsTrigger>
          <TabsTrigger value="apple-notifications">Spending Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activator" className="space-y-6">
          <SampleDataLoader />
          <FinancialBodyguardActivator />
        </TabsContent>
        
        <TabsContent value="dashboard">
          <FinancialBodyguardDashboard />
        </TabsContent>
        
        <TabsContent value="ai-insights">
          <AIInsightsDashboard />
        </TabsContent>
        
        <TabsContent value="simulator" className="w-full">
          <TransactionSimulator />
        </TabsContent>
        
        <TabsContent value="geolocation">
          <GeolocationNotificationManager />
        </TabsContent>
        
        <TabsContent value="apple-notifications">
          <SpendingAlertDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
};

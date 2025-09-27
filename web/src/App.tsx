import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import MapView from './components/MapView';
import BudgetPanel from './components/BudgetPanel';
import Charts from './components/Charts';
import { Merchant, TransactionSummary, Rule } from './lib/api';
import { apiClient } from './lib/api';

const BLACKSBURG_COORDS = { lat: 37.2296, lng: -80.4139 };

function App() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBudgetPanel, setShowBudgetPanel] = useState(false);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [merchantsData, summaryData, rulesData] = await Promise.all([
        apiClient.getNearbyMerchants(BLACKSBURG_COORDS.lat, BLACKSBURG_COORDS.lng, 1000),
        apiClient.getTransactionSummary('30d'),
        apiClient.getRules()
      ]);
      
      setMerchants(merchantsData);
      setTransactionSummary(summaryData);
      setRules(rulesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMerchantSelect = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
  };

  const handleTransactionSimulated = () => {
    loadData(); // Refresh all data
  };

  const handleRuleCreated = () => {
    loadData(); // Refresh all data
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading MoneyLens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">MoneyLens</h1>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                MVP
              </span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setShowBudgetPanel(!showBudgetPanel)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {showBudgetPanel ? 'Hide' : 'Show'} Budget Panel
              </button>
              <button
                onClick={() => setShowCharts(!showCharts)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {showCharts ? 'Hide' : 'Show'} Charts
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Main Map Area */}
        <div className="flex-1">
          <MapView
            merchants={merchants}
            onMerchantSelect={handleMerchantSelect}
            selectedMerchant={selectedMerchant}
            onTransactionSimulated={handleTransactionSimulated}
          />
        </div>

        {/* Side Panels */}
        <div className="w-80 bg-white border-l flex flex-col">
          {showBudgetPanel && (
            <BudgetPanel
              rules={rules}
              onRuleCreated={handleRuleCreated}
              onRuleUpdated={handleRuleCreated}
              onRuleDeleted={handleRuleCreated}
            />
          )}
          
          {showCharts && (
            <Charts
              transactionSummary={transactionSummary}
              merchants={merchants}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

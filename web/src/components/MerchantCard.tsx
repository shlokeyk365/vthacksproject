import React, { useState } from 'react';
import { X, CreditCard, Lock, Unlock, Zap } from 'lucide-react';
import { Merchant } from '../lib/api';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';

interface MerchantCardProps {
  merchant: Merchant;
  onClose: () => void;
  onSimulateTransaction: () => void;
  onSimulateGeofence: () => void;
}

const MerchantCard: React.FC<MerchantCardProps> = ({
  merchant,
  onClose,
  onSimulateTransaction,
  onSimulateGeofence
}) => {
  const [simulateAmount, setSimulateAmount] = useState('10.00');
  const [isLocking, setIsLocking] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateTransaction = async () => {
    const amount = parseFloat(simulateAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      setIsSimulating(true);
      const result = await apiClient.simulateTransaction({
        merchant_id: merchant.merchant_id,
        amount
      });

      if (result.success) {
        toast.success(`Simulated $${amount.toFixed(2)} purchase at ${merchant.name}`);
        onSimulateTransaction();
      } else {
        toast.error(result.error || 'Transaction failed');
      }
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error('Failed to simulate transaction');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleToggleLock = async () => {
    try {
      setIsLocking(true);
      await apiClient.setCardLock(merchant.merchant_id, !merchant.locked);
      toast.success(`Card ${merchant.locked ? 'unlocked' : 'locked'} for ${merchant.name}`);
      onSimulateTransaction(); // Refresh data
    } catch (error) {
      console.error('Lock error:', error);
      toast.error('Failed to toggle card lock');
    } finally {
      setIsLocking(false);
    }
  };

  const handleOverride = async () => {
    try {
      await apiClient.setOverride(merchant.merchant_id);
      toast.success('Override enabled for next transaction');
    } catch (error) {
      console.error('Override error:', error);
      toast.error('Failed to set override');
    }
  };

  const getCapStatus = () => {
    const totalBudget = merchant.mtd_spend + merchant.monthly_budget_left;
    if (totalBudget === 0) return { percentage: 0, status: 'No cap set' };
    
    const percentage = (merchant.mtd_spend / totalBudget) * 100;
    if (percentage >= 100) return { percentage, status: 'Over cap' };
    if (percentage >= 80) return { percentage, status: 'Near cap' };
    return { percentage, status: 'Under cap' };
  };

  const capStatus = getCapStatus();

  return (
    <div className="bg-white rounded-lg shadow-lg border max-w-sm">
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{merchant.name}</h3>
            <p className="text-sm text-gray-500">{merchant.category}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cap Status */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Monthly Budget</span>
            <span className={`text-sm font-medium ${
              capStatus.status === 'Over cap' ? 'text-red-600' :
              capStatus.status === 'Near cap' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {capStatus.status}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className={`h-2 rounded-full ${
                capStatus.status === 'Over cap' ? 'bg-red-500' :
                capStatus.status === 'Near cap' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(capStatus.percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>${merchant.mtd_spend.toFixed(2)} spent</span>
            <span>${merchant.monthly_budget_left.toFixed(2)} left</span>
          </div>
        </div>

        {/* Lock Status */}
        {merchant.locked && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <Lock className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-800">CARD LOCKED</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {/* Simulate Transaction */}
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={simulateAmount}
              onChange={(e) => setSimulateAmount(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Amount"
            />
            <button
              onClick={handleSimulateTransaction}
              disabled={isSimulating || (merchant.locked && !merchant.over_cap)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSimulating ? '...' : 'Simulate'}
            </button>
          </div>

          {/* Override Button (only show if locked) */}
          {merchant.locked && (
            <button
              onClick={handleOverride}
              className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Override Once
            </button>
          )}

          {/* Lock/Unlock Button */}
          <button
            onClick={handleToggleLock}
            disabled={isLocking}
            className={`w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md ${
              merchant.locked
                ? 'text-white bg-green-600 hover:bg-green-700'
                : 'text-white bg-red-600 hover:bg-red-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLocking ? (
              '...'
            ) : (
              <>
                {merchant.locked ? (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    Unlock Card
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Lock Card
                  </>
                )}
              </>
            )}
          </button>

          {/* Geofence Simulation */}
          <button
            onClick={onSimulateGeofence}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Simulate Enter Zone
          </button>
        </div>
      </div>
    </div>
  );
};

export default MerchantCard;

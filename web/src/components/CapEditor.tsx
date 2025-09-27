import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Rule, CreateRuleRequest } from '../lib/api';
import { apiClient } from '../lib/api';
import toast from 'react-hot-toast';

interface CapEditorProps {
  rule?: Rule | null;
  onSave: () => void;
  onCancel: () => void;
}

const CapEditor: React.FC<CapEditorProps> = ({ rule, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CreateRuleRequest>({
    type: 'merchant_cap',
    target_id: undefined,
    category: undefined,
    cap_amount: 0,
    window: 'month',
    active: true
  });

  const [merchants, setMerchants] = useState<Array<{merchant_id: number, name: string, category: string}>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (rule) {
      setFormData({
        type: rule.type,
        target_id: rule.target_id,
        category: rule.category,
        cap_amount: rule.cap_amount,
        window: rule.window,
        active: rule.active
      });
    }
  }, [rule]);

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    try {
      const merchantsData = await apiClient.getNearbyMerchants(37.2296, -80.4139, 1000);
      setMerchants(merchantsData.map(m => ({
        merchant_id: m.merchant_id,
        name: m.name,
        category: m.category
      })));
    } catch (error) {
      console.error('Failed to load merchants:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.cap_amount <= 0) {
      toast.error('Cap amount must be greater than 0');
      return;
    }

    if (formData.type === 'merchant_cap' && !formData.target_id) {
      toast.error('Please select a merchant');
      return;
    }

    if (formData.type === 'category_cap' && !formData.category) {
      toast.error('Please select a category');
      return;
    }

    try {
      setLoading(true);
      
      if (rule) {
        await apiClient.updateRule(rule.rule_id, formData);
        toast.success('Spending cap updated');
      } else {
        await apiClient.createRule(formData);
        toast.success('Spending cap created');
      }
      
      onSave();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save spending cap');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Dining', 'Bars', 'Groceries', 'Electronics', 'Transportation', 'Education', 'Health'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {rule ? 'Edit' : 'Create'} Spending Cap
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Cap Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cap Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="merchant_cap"
                  checked={formData.type === 'merchant_cap'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'merchant_cap' | 'category_cap' })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Per-Merchant Cap</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="category_cap"
                  checked={formData.type === 'category_cap'}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'merchant_cap' | 'category_cap' })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Per-Category Cap</span>
              </label>
            </div>
          </div>

          {/* Merchant Selection */}
          {formData.type === 'merchant_cap' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Merchant
              </label>
              <select
                value={formData.target_id || ''}
                onChange={(e) => setFormData({ ...formData, target_id: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select a merchant</option>
                {merchants.map(merchant => (
                  <option key={merchant.merchant_id} value={merchant.merchant_id}>
                    {merchant.name} ({merchant.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category Selection */}
          {formData.type === 'category_cap' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cap Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cap Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.cap_amount}
              onChange={(e) => setFormData({ ...formData, cap_amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (rule ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CapEditor;

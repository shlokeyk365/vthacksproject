import React, { useState } from 'react';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import { Rule } from '../lib/api';
import CapEditor from './CapEditor';
import toast from 'react-hot-toast';

interface BudgetPanelProps {
  rules: Rule[];
  onRuleCreated: () => void;
  onRuleUpdated: () => void;
  onRuleDeleted: () => void;
}

const BudgetPanel: React.FC<BudgetPanelProps> = ({
  rules,
  onRuleCreated,
  onRuleUpdated,
  onRuleDeleted
}) => {
  const [showEditor, setShowEditor] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setShowEditor(true);
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (window.confirm('Are you sure you want to delete this spending cap?')) {
      try {
        const { apiClient } = await import('../lib/api');
        await apiClient.deleteRule(ruleId);
        toast.success('Spending cap deleted');
        onRuleDeleted();
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete spending cap');
      }
    }
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingRule(null);
  };

  const handleSave = () => {
    onRuleCreated();
    handleCloseEditor();
  };

  const merchantRules = rules.filter(rule => rule.type === 'merchant_cap');
  const categoryRules = rules.filter(rule => rule.type === 'category_cap');

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Spending Caps</h2>
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center px-3 py-1 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Cap
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Merchant Caps */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Per-Merchant Caps</h3>
          {merchantRules.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No merchant caps set</p>
          ) : (
            <div className="space-y-2">
              {merchantRules.map(rule => (
                <div key={rule.rule_id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Merchant ID: {rule.target_id}
                      </p>
                      <p className="text-xs text-gray-500">
                        ${rule.cap_amount.toFixed(2)} per month
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.rule_id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Caps */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Per-Category Caps</h3>
          {categoryRules.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No category caps set</p>
          ) : (
            <div className="space-y-2">
              {categoryRules.map(rule => (
                <div key={rule.rule_id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {rule.category}
                      </p>
                      <p className="text-xs text-gray-500">
                        ${rule.cap_amount.toFixed(2)} per month
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.rule_id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEditor && (
        <CapEditor
          rule={editingRule}
          onSave={handleSave}
          onCancel={handleCloseEditor}
        />
      )}
    </div>
  );
};

export default BudgetPanel;

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, MapPin, Shield } from 'lucide-react';
import { Button } from './button';

interface HighRiskAreaNotificationProps {
  isVisible: boolean;
  areaName: string;
  riskLevel: 'high' | 'critical' | 'danger';
  onDismiss: () => void;
  onEnableProtection: () => void;
}

export const HighRiskAreaNotification: React.FC<HighRiskAreaNotificationProps> = ({
  isVisible,
  areaName,
  riskLevel,
  onDismiss,
  onEnableProtection
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        onDismiss();
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'critical':
        return 'bg-red-100/40 border-red-200/60';
      case 'danger':
        return 'bg-orange-100/40 border-orange-200/60';
      case 'high':
        return 'bg-yellow-100/40 border-yellow-200/60';
      default:
        return 'bg-red-100/40 border-red-200/60';
    }
  };

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'danger':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'high':
        return <MapPin className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  const getRiskMessage = () => {
    switch (riskLevel) {
      case 'critical':
        return 'Critical spending risk detected';
      case 'danger':
        return 'High spending risk detected';
      case 'high':
        return 'High-risk spending area';
      default:
        return 'Spending risk detected';
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm mx-4"
        >
          <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
            {/* Header with risk indicator */}
            <div className="px-4 py-3 flex items-center space-x-3 border-b border-gray-700">
              {getRiskIcon()}
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">
                  {getRiskMessage()}
                </h3>
                <p className="text-white text-xs">
                  You're in a high-risk spending area
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="px-4 py-4 bg-gray-800">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm">
                    {areaName}
                  </h4>
                  <p className="text-white text-xs">
                    Enable spending protection to stay safe
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2">
                <Button
                  onClick={onEnableProtection}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Enable Protection
                </Button>
                <Button
                  onClick={onDismiss}
                  variant="outline"
                  className="px-3 py-2 border-gray-600 text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

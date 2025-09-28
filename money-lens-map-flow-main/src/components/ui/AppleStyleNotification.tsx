import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Shield, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppleStyleNotificationProps {
  isVisible: boolean;
  title: string;
  message: string;
  severity: 'critical' | 'danger' | 'high' | 'warning';
  onConfirm: () => void;
  onDismiss?: () => void;
  confirmText?: string;
  dismissText?: string;
  showDismiss?: boolean;
}

export const AppleStyleNotification: React.FC<AppleStyleNotificationProps> = ({
  isVisible,
  title,
  message,
  severity,
  onConfirm,
  onDismiss,
  confirmText = "Continue",
  dismissText = "Cancel",
  showDismiss = true
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Prevent body scroll when notification is visible
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  const getSeverityConfig = () => {
    switch (severity) {
      case 'critical':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          icon: AlertTriangle,
          buttonColor: 'bg-red-600 hover:bg-red-700',
          titleColor: 'text-red-900',
          messageColor: 'text-red-700'
        };
      case 'danger':
        return {
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-600',
          icon: AlertTriangle,
          buttonColor: 'bg-orange-600 hover:bg-orange-700',
          titleColor: 'text-orange-900',
          messageColor: 'text-orange-700'
        };
      case 'high':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          icon: Shield,
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
          titleColor: 'text-yellow-900',
          messageColor: 'text-yellow-700'
        };
      case 'warning':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          icon: Shield,
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          titleColor: 'text-blue-900',
          messageColor: 'text-blue-700'
        };
      default:
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          icon: AlertTriangle,
          buttonColor: 'bg-red-600 hover:bg-red-700',
          titleColor: 'text-red-900',
          messageColor: 'text-red-700'
        };
    }
  };

  const config = getSeverityConfig();
  const IconComponent = config.icon;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={showDismiss && onDismiss ? onDismiss : undefined}
          />
          
          {/* Notification Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              duration: 0.3 
            }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className={`w-full max-w-md ${config.bgColor} ${config.borderColor} border-2 rounded-2xl shadow-2xl overflow-hidden`}>
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200/50">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${config.bgColor} ${config.borderColor} border`}>
                    <IconComponent className={`w-6 h-6 ${config.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <h2 className={`text-lg font-semibold ${config.titleColor}`}>
                      {title}
                    </h2>
                  </div>
                  {showDismiss && onDismiss && (
                    <button
                      onClick={onDismiss}
                      className="p-1 rounded-full hover:bg-gray-200/50 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-4">
                <p className={`text-sm leading-relaxed ${config.messageColor} mb-6`}>
                  {message}
                </p>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    onClick={onConfirm}
                    className={`flex-1 ${config.buttonColor} text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg`}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {confirmText}
                  </Button>
                  
                  {showDismiss && onDismiss && (
                    <Button
                      onClick={onDismiss}
                      className="flex-1 bg-slate-700 hover:bg-slate-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 border-2 border-slate-600 hover:border-slate-500 shadow-lg ring-2 ring-slate-500/20 hover:ring-slate-400/30 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-600/20 to-slate-500/20 opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                      <X className="w-4 h-4 mr-2 relative z-10" />
                      <span className="relative z-10">{dismissText}</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-200/50">
                <p className="text-xs text-gray-500 text-center">
                  MoneyLens Financial Protection
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

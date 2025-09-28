import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FinancialBodyguard, Location, Transaction, RiskAssessment, SpendingPattern } from '../agents/FinancialBodyguard';
import { LocationTracker, Geofence } from '../agents/LocationTracker';
import { AgenticAI, AIInsight, AIPrediction, AutonomousAction } from '../agents/AgenticAI';

interface FinancialBodyguardContextType {
  // Agent state
  isActive: boolean;
  isTracking: boolean;
  currentLocation: Location | null;
  lastRiskAssessment: RiskAssessment | null;
  
  // Agent methods
  activateAgent: () => void;
  deactivateAgent: () => void;
  startLocationTracking: () => Promise<void>;
  stopLocationTracking: () => void;
  
  // Risk assessment
  assessTransactionRisk: (amount: number, merchant: string, category: string) => RiskAssessment;
  addTransaction: (transaction: Transaction) => void;
  
  // Data access
  getSpendingPatterns: () => SpendingPattern[];
  getHighRiskMerchants: () => string[];
  getLocationHistory: () => Location[];
  
  // Settings
  updatePreferences: (prefs: any) => void;
  getPreferences: () => any;
  
  // Geofencing
  addGeofence: (geofence: Geofence) => void;
  removeGeofence: (geofenceId: string) => void;
  getGeofences: () => Geofence[];
  getNearbyGeofences: (maxDistance?: number) => Geofence[];
  
  // Alerts
  showAlert: (message: string, type: 'info' | 'warning' | 'error' | 'success') => void;
  clearAlerts: () => void;
  alerts: Alert[];
  
  // AI Insights
  getAIInsights: () => AIInsight[];
  getAIPredictions: () => AIPrediction[];
  getAutonomousActions: () => AutonomousAction[];
  runAIAnalysis: () => void;
}

interface Alert {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: number;
  dismissed: boolean;
}

const FinancialBodyguardContext = createContext<FinancialBodyguardContextType | undefined>(undefined);

export const FinancialBodyguardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [lastRiskAssessment, setLastRiskAssessment] = useState<RiskAssessment | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  // Initialize agents
  const [bodyguard] = useState(() => new FinancialBodyguard());
  const [locationTracker] = useState(() => new LocationTracker());
  const [agenticAI] = useState(() => new AgenticAI(bodyguard));

  // Load initial state
  useEffect(() => {
    const savedState = localStorage.getItem('financialBodyguardActive');
    if (savedState === 'true') {
      setIsActive(true);
    }
  }, []);

  // Handle location updates
  const handleLocationUpdate = (location: Location) => {
    setCurrentLocation(location);
    console.log('Location updated:', location);
  };

  // Handle geofence events
  const handleGeofenceEnter = (geofence: Geofence) => {
    console.log('Entered geofence:', geofence);
    showAlert(`Entered ${geofence.name}`, 'info');
    
    // If it's a high-risk merchant, assess risk
    if (geofence.type === 'merchant' && geofence.merchantId) {
      const riskAssessment = assessTransactionRisk(0, geofence.name, 'merchant');
      if (riskAssessment.level !== 'safe') {
        showAlert(`High-risk area detected: ${geofence.name}`, 'warning');
      }
    }
  };

  const handleGeofenceExit = (geofence: Geofence) => {
    console.log('Exited geofence:', geofence);
    showAlert(`Exited ${geofence.name}`, 'info');
  };

  // Activate the agent
  const activateAgent = () => {
    setIsActive(true);
    localStorage.setItem('financialBodyguardActive', 'true');
    showAlert('Financial Bodyguard activated! 🛡️', 'success');
  };

  // Deactivate the agent
  const deactivateAgent = () => {
    setIsActive(false);
    stopLocationTracking();
    localStorage.setItem('financialBodyguardActive', 'false');
    showAlert('Financial Bodyguard deactivated', 'info');
  };

  // Start location tracking
  const startLocationTracking = async () => {
    try {
      await locationTracker.startTracking(
        handleLocationUpdate,
        handleGeofenceEnter,
        handleGeofenceExit
      );
      setIsTracking(true);
      showAlert('Location tracking started', 'success');
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      showAlert('Failed to start location tracking', 'error');
    }
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    locationTracker.stopTracking();
    setIsTracking(false);
    showAlert('Location tracking stopped', 'info');
  };

  // Assess transaction risk with AI enhancement
  const assessTransactionRisk = (amount: number, merchant: string, category: string): RiskAssessment => {
    const assessment = agenticAI.assessRiskWithAI(amount, merchant, category, currentLocation);
    setLastRiskAssessment(assessment);
    
    // Show alerts based on risk level
    if (assessment.level === 'critical' || assessment.level === 'danger') {
      showAlert(assessment.recommendation, 'error');
    } else if (assessment.level === 'warning') {
      showAlert(assessment.recommendation, 'warning');
    }
    
    return assessment;
  };

  // Add transaction
  const addTransaction = (transaction: Transaction) => {
    try {
      bodyguard.addTransaction(transaction);
      console.log('Transaction added:', transaction);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  // Get spending patterns
  const getSpendingPatterns = (): SpendingPattern[] => {
    return bodyguard.getSpendingPatterns();
  };

  // Get high-risk merchants
  const getHighRiskMerchants = (): string[] => {
    return bodyguard.getHighRiskMerchants();
  };

  // Get location history
  const getLocationHistory = (): Location[] => {
    return locationTracker.getLocationHistory().map(update => update.location);
  };

  // Update preferences
  const updatePreferences = (prefs: any) => {
    bodyguard.updatePreferences(prefs);
    showAlert('Preferences updated', 'success');
  };

  // Get preferences
  const getPreferences = () => {
    return bodyguard.getPreferences();
  };

  // Add geofence
  const addGeofence = (geofence: Geofence) => {
    locationTracker.addGeofence(geofence);
    showAlert(`Geofence added: ${geofence.name}`, 'success');
  };

  // Remove geofence
  const removeGeofence = (geofenceId: string) => {
    locationTracker.removeGeofence(geofenceId);
    showAlert('Geofence removed', 'info');
  };

  // Get geofences
  const getGeofences = (): Geofence[] => {
    return locationTracker.getGeofences();
  };

  // Get nearby geofences
  const getNearbyGeofences = (maxDistance: number = 1000): Geofence[] => {
    return locationTracker.getNearbyGeofences(maxDistance);
  };

  // Show alert
  const showAlert = (message: string, type: 'info' | 'warning' | 'error' | 'success') => {
    const alert: Alert = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: Date.now(),
      dismissed: false
    };
    
    setAlerts(prev => [...prev, alert]);
    
    // Auto-dismiss after 5 seconds for non-error alerts
    if (type !== 'error') {
      setTimeout(() => {
        dismissAlert(alert.id);
      }, 5000);
    }
  };

  // Dismiss alert
  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, dismissed: true } : alert
    ));
  };

  // Clear all alerts
  const clearAlerts = () => {
    setAlerts([]);
  };

  // AI Insights methods
  const getAIInsights = (): AIInsight[] => {
    return agenticAI.getInsights();
  };

  const getAIPredictions = (): AIPrediction[] => {
    return agenticAI.getPredictions();
  };

  const getAutonomousActions = (): AutonomousAction[] => {
    return agenticAI.getAutonomousActions();
  };

  const runAIAnalysis = () => {
    // Trigger manual AI analysis
    console.log('🤖 Running manual AI analysis...');
    showAlert('AI analysis started', 'info');
  };

  // Auto-start location tracking when agent is activated
  useEffect(() => {
    if (isActive && !isTracking) {
      startLocationTracking();
    }
  }, [isActive]);

  const value: FinancialBodyguardContextType = {
    isActive,
    isTracking,
    currentLocation,
    lastRiskAssessment,
    activateAgent,
    deactivateAgent,
    startLocationTracking,
    stopLocationTracking,
    assessTransactionRisk,
    addTransaction,
    getSpendingPatterns,
    getHighRiskMerchants,
    getLocationHistory,
    updatePreferences,
    getPreferences,
    addGeofence,
    removeGeofence,
    getGeofences,
    getNearbyGeofences,
    showAlert,
    clearAlerts,
    alerts,
    getAIInsights,
    getAIPredictions,
    getAutonomousActions,
    runAIAnalysis
  };

  return (
    <FinancialBodyguardContext.Provider value={value}>
      {children}
    </FinancialBodyguardContext.Provider>
  );
};

export const useFinancialBodyguard = () => {
  const context = useContext(FinancialBodyguardContext);
  if (context === undefined) {
    throw new Error('useFinancialBodyguard must be used within a FinancialBodyguardProvider');
  }
  return context;
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useFinancialBodyguard } from '@/contexts/FinancialBodyguardContext';
import { 
  Shield, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Activity,
  DollarSign,
  Clock,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';

export const FinancialBodyguardDashboard: React.FC = () => {
  const {
    isActive,
    isTracking,
    currentLocation,
    lastRiskAssessment,
    activateAgent,
    deactivateAgent,
    startLocationTracking,
    stopLocationTracking,
    getSpendingPatterns,
    getHighRiskMerchants,
    getLocationHistory,
    updatePreferences,
    getPreferences,
    getGeofences,
    getNearbyGeofences,
    alerts
  } = useFinancialBodyguard();

  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState(getPreferences());
  const [spendingPatterns, setSpendingPatterns] = useState(getSpendingPatterns());
  const [highRiskMerchants, setHighRiskMerchants] = useState(getHighRiskMerchants());
  const [geofences, setGeofences] = useState(getGeofences());
  const [nearbyGeofences, setNearbyGeofences] = useState(getNearbyGeofences());

  // Update data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSpendingPatterns(getSpendingPatterns());
      setHighRiskMerchants(getHighRiskMerchants());
      setGeofences(getGeofences());
      setNearbyGeofences(getNearbyGeofences());
    }, 5000);

    return () => clearInterval(interval);
  }, [getSpendingPatterns, getHighRiskMerchants, getGeofences, getNearbyGeofences]);

  const handlePreferenceChange = (key: string, value: any) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    updatePreferences(newPrefs);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'danger': return 'bg-orange-500';
      case 'warning': return 'bg-yellow-500';
      case 'caution': return 'bg-blue-500';
      case 'safe': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'danger': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'caution': return <Eye className="w-4 h-4" />;
      case 'safe': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">Financial Bodyguard</h2>
            <p className="text-muted-foreground">AI-powered spending protection</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={isActive ? "destructive" : "default"}
            onClick={isActive ? deactivateAgent : activateAgent}
            className="flex items-center space-x-2"
          >
            {isActive ? <XCircle className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
            <span>{isActive ? 'Deactivate' : 'Activate'}</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Agent Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm">{isActive ? 'Active' : 'Inactive'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Location Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm">{isTracking ? 'Tracking' : 'Stopped'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {currentLocation 
                  ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                  : 'Unknown'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment */}
      {lastRiskAssessment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getRiskLevelIcon(lastRiskAssessment.level)}
              <span>Latest Risk Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={`${getRiskLevelColor(lastRiskAssessment.level)} text-white`}>
                  {lastRiskAssessment.level.toUpperCase()}
                </Badge>
                <span className="text-2xl font-bold">{lastRiskAssessment.score}/100</span>
              </div>
              
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{lastRiskAssessment.recommendation}</AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">Risk Factors:</h4>
                {lastRiskAssessment.factors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{factor.message}</span>
                    <Badge variant="outline">{factor.severity}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spending Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Spending Patterns</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {spendingPatterns.length > 0 ? (
              spendingPatterns.map((pattern, index) => (
                <div key={`dashboard-pattern-${pattern.merchant}-${index}`} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{pattern.merchant}</div>
                    <div className="text-sm text-muted-foreground">
                      ${pattern.totalSpent.toFixed(2)} • {pattern.visitCount} visits
                    </div>
                  </div>
                  <Badge 
                    className={
                      pattern.riskLevel === 'high' ? 'bg-red-500' :
                      pattern.riskLevel === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }
                  >
                    {pattern.riskLevel}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No spending patterns detected yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* High-Risk Merchants */}
      {highRiskMerchants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>High-Risk Merchants</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {highRiskMerchants.map((merchant, index) => (
                <div key={`dashboard-risk-${merchant}-${index}`} className="flex items-center space-x-2 p-2 bg-red-50 border border-red-200 rounded">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">{merchant}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Geofences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Geofences</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {geofences.length > 0 ? (
              geofences.map((geofence, index) => (
                <div key={`dashboard-geofence-${geofence.id}-${index}`} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{geofence.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {geofence.type} • {geofence.radius}m radius
                    </div>
                  </div>
                  <Badge variant="outline">{geofence.type}</Badge>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No geofences configured</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyLimit">Daily Limit ($)</Label>
                <Input
                  id="dailyLimit"
                  type="number"
                  value={preferences.dailyLimit}
                  onChange={(e) => handlePreferenceChange('dailyLimit', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeklyLimit">Weekly Limit ($)</Label>
                <Input
                  id="weeklyLimit"
                  type="number"
                  value={preferences.weeklyLimit}
                  onChange={(e) => handlePreferenceChange('weeklyLimit', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthlyLimit">Monthly Limit ($)</Label>
                <Input
                  id="monthlyLimit"
                  type="number"
                  value={preferences.monthlyLimit}
                  onChange={(e) => handlePreferenceChange('monthlyLimit', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="locationTracking">Location Tracking</Label>
                <Switch
                  id="locationTracking"
                  checked={preferences.enableLocationTracking}
                  onCheckedChange={(checked) => handlePreferenceChange('enableLocationTracking', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="realTimeAlerts">Real-time Alerts</Label>
                <Switch
                  id="realTimeAlerts"
                  checked={preferences.enableRealTimeAlerts}
                  onCheckedChange={(checked) => handlePreferenceChange('enableRealTimeAlerts', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(-5).map((alert) => (
                <Alert key={`dashboard-alert-${alert.id}`} className={alert.dismissed ? 'opacity-50' : ''}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

import React, { useEffect, useState, useCallback } from 'react';
import { GeolocationNotificationAgent, GeolocationNotification } from '../../agents/GeolocationNotificationAgent';
import { useNotifications } from '../../contexts/NotificationContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Bell, Play, Square, Map, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface GeolocationNotificationManagerProps {
  className?: string;
}

export const GeolocationNotificationManager: React.FC<GeolocationNotificationManagerProps> = ({ className }) => {
  const [agent, setAgent] = useState<GeolocationNotificationAgent | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [notifications, setNotifications] = useState<GeolocationNotification[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const { addNotification } = useNotifications();

  // Initialize the agent
  useEffect(() => {
    const newAgent = new GeolocationNotificationAgent();
    setAgent(newAgent);
    return () => {
      newAgent.stop();
    };
  }, []);

  // Handle geolocation notifications
  const handleGeolocationNotification = useCallback((notification: GeolocationNotification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
    
    // Convert to app notification
    addNotification({
      type: notification.severity === 'critical' ? 'error' : 
            notification.severity === 'high' ? 'warning' : 
            notification.severity === 'medium' ? 'info' : 'info',
      title: notification.title,
      message: notification.message,
      category: 'system',
      actionUrl: notification.actionable ? '/map' : undefined
    });

    // Show toast
    const toastType = notification.severity === 'critical' ? 'error' : 
                     notification.severity === 'high' ? 'warning' : 
                     notification.severity === 'medium' ? 'info' : 'info';
    
    toast[toastType](notification.title, {
      description: notification.message,
      duration: 8000,
      style: {
        borderRadius: '0.5rem',
        padding: '0.75rem 1rem',
        margin: '0.5rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
    });
  }, [addNotification]);

  // Start location tracking
  const startTracking = useCallback(async () => {
    if (!agent) return;

    try {
      await agent.start(handleGeolocationNotification);
      setIsActive(true);
      setDemoMode(false);
      toast.success('Location tracking started!', {
        description: 'MoneyLens is now monitoring your location for smart financial insights.'
      });
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      // Fallback to demo mode
      setDemoMode(true);
      setIsActive(true);
      toast.info('Demo Mode Activated', {
        description: 'Location tracking is simulated for demo purposes.'
      });
    }
  }, [agent, handleGeolocationNotification]);

  // Stop location tracking
  const stopTracking = useCallback(() => {
    if (!agent) return;

    agent.stop();
    setIsActive(false);
    setDemoMode(false);
    toast.info('Location tracking stopped');
  }, [agent]);

  // Simulate location for demo
  const simulateLocation = useCallback((location: { lat: number; lng: number }) => {
    if (!agent || !isActive) return;

    agent.simulateLocation(location);
    setCurrentLocation(location);
  }, [agent, isActive]);

  // Test current location as high risk
  const testCurrentLocation = useCallback(() => {
    if (!agent) return;

    const currentLocation = { lat: 37.2521, lng: -80.4097 };
    agent.simulateLocation(currentLocation);
    setCurrentLocation(currentLocation);
  }, [agent]);

  // Demo location buttons
  const demoLocations = [
    {
      name: 'Owens Ballroom (Demo)',
      location: { lat: 37.22767, lng: -80.41794 },
      description: 'VT Hacks demo location'
    },
    {
      name: 'Squires Student Center',
      location: { lat: 37.2295, lng: -80.4200 },
      description: 'Popular student area'
    },
    {
      name: 'Downtown Blacksburg',
      location: { lat: 37.2290, lng: -80.4100 },
      description: 'High spending zone'
    },
    {
      name: 'Current Location (High Risk)',
      location: { lat: 37.2521, lng: -80.4097 },
      description: 'Your current location - High risk zone'
    }
  ];

  // Get severity icon
  const getSeverityIcon = (severity: GeolocationNotification['severity']) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <Info className="w-4 h-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get severity color
  const getSeverityColor = (severity: GeolocationNotification['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Geolocation Notifications
          </CardTitle>
          <CardDescription>
            Smart location-based financial insights and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm font-medium">
                {isActive ? (demoMode ? 'Demo Mode' : 'Active') : 'Inactive'}
              </span>
            </div>
            <div className="flex gap-2">
              {!isActive ? (
                <Button onClick={startTracking} size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Start Tracking
                </Button>
              ) : (
                <Button onClick={stopTracking} variant="outline" size="sm">
                  <Square className="w-4 h-4 mr-2" />
                  Stop Tracking
                </Button>
              )}
              <Button onClick={testCurrentLocation} variant="destructive" size="sm">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Test High Risk
              </Button>
            </div>
          </div>

          {/* Demo Mode Controls */}
          {demoMode && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Demo Mode: Simulate location to test notifications
              </div>
              <div className="grid grid-cols-1 gap-2">
                {demoLocations.map((location, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => simulateLocation(location.location)}
                    className="justify-start"
                  >
                    <Map className="w-4 h-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">{location.name}</div>
                      <div className="text-xs text-muted-foreground">{location.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Current Location */}
          {currentLocation && (
            <div className="text-sm text-muted-foreground">
              <strong>Current Location:</strong> {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              {currentLocation.accuracy && (
                <span> (±{Math.round(currentLocation.accuracy)}m)</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Recent Location Notifications
            </CardTitle>
            <CardDescription>
              Latest geolocation-based alerts and insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeverityIcon(notification.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <Badge className={`text-xs ${getSeverityColor(notification.severity)}`}>
                        {notification.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>{notification.location.name}</span>
                      <span>•</span>
                      <span>{new Date(notification.timestamp).toLocaleTimeString()}</span>
                    </div>
                    {notification.suggestedAction && (
                      <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                        <strong>Suggestion:</strong> {notification.suggestedAction}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { MapPin, Bell, Play, Square, Map, AlertTriangle } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useFinancialBodyguard } from '../../contexts/FinancialBodyguardContext';

export const DemoNotificationTrigger: React.FC = () => {
  const { addNotification } = useNotifications();
  const { showBlockingNotification } = useFinancialBodyguard();
  const [isActive, setIsActive] = useState(false);

  const demoNotifications = [
    {
      id: 'owens_ballroom',
      title: '🎉 Welcome to VT Hacks Demo!',
      message: 'You\'ve arrived at Owens Ballroom! This is where the MoneyLens demo is taking place. Check out the smart financial features!',
      type: 'info' as const,
      location: 'Owens Ballroom, 150 Kent St, Blacksburg, VA',
      coordinates: { lat: 37.22767, lng: -80.41794 }
    },
    {
      id: 'squires_center',
      title: '📍 Near Squires Student Center',
      message: 'You\'re near a popular student area. This location typically has high spending activity.',
      type: 'warning' as const,
      location: 'Squires Student Center, Blacksburg, VA',
      coordinates: { lat: 37.2295, lng: -80.4200 }
    },
    {
      id: 'downtown_blacksburg',
      title: '🏪 Downtown Blacksburg - High Spending Zone',
      message: 'You\'ve entered downtown Blacksburg, a high-spending area with many restaurants and shops.',
      type: 'error' as const,
      location: 'Downtown Blacksburg, VA',
      coordinates: { lat: 37.2290, lng: -80.4100 }
    },
    {
      id: 'proximity_alert',
      title: '🎯 Approaching VT Hacks Demo!',
      message: 'You\'re getting close to the MoneyLens demo at Owens Ballroom. Just a few more steps!',
      type: 'info' as const,
      location: 'Approaching Owens Ballroom',
      coordinates: { lat: 37.22767, lng: -80.41794 }
    },
    {
      id: 'current_location_high_risk',
      title: '⚠️ High Risk Location Detected!',
      message: 'You\'ve entered a high-risk spending zone! MoneyLens has detected unusual financial activity in this area.',
      type: 'error' as const,
      location: 'Current Location - High Risk Zone',
      coordinates: { lat: 37.2521, lng: -80.4097 }
    }
  ];

  const triggerNotification = (notification: typeof demoNotifications[0]) => {
    // Check if this is a high-risk notification that should trigger Apple-style blocking
    if (notification.id === 'current_location_high_risk' || 
        notification.id === 'downtown_blacksburg' ||
        (notification.type === 'error' && notification.title.includes('High Risk'))) {
      
      // Determine severity and button text based on notification
      let severity: 'critical' | 'danger' | 'high' | 'warning' = 'critical';
      let confirmText = 'Proceed with Caution';
      let dismissText = 'Turn Back';
      
      if (notification.id === 'downtown_blacksburg') {
        severity = 'high';
        confirmText = 'Set Spending Limit';
        dismissText = 'Avoid Area';
      }
      
      // Show Apple-style blocking notification
      showBlockingNotification({
        title: notification.title,
        message: notification.message + `\n\nLocation: ${notification.location}`,
        severity,
        onConfirm: () => {
          console.log('User confirmed to proceed in high-risk area');
          addNotification({
            type: 'success',
            title: 'Proceeding with Enhanced Monitoring',
            message: 'MoneyLens will closely monitor your spending in this area.',
            category: 'system'
          });
        },
        onDismiss: () => {
          console.log('User chose to avoid the high-risk area');
          addNotification({
            type: 'info',
            title: 'Smart Choice!',
            message: 'Avoiding high-risk spending area.',
            category: 'system'
          });
        },
        confirmText,
        dismissText,
        showDismiss: true
      });
    } else {
      // Regular notification for non-critical scenarios
      addNotification({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        category: 'system',
        actionUrl: '/bodyguard'
      });
    }
  };

  const startDemo = () => {
    setIsActive(true);
    
    // Trigger the main demo notification immediately
    triggerNotification(demoNotifications[0]);
    
    // Trigger additional notifications with delays for a more realistic demo
    setTimeout(() => {
      triggerNotification(demoNotifications[3]); // Proximity alert
    }, 2000);
    
    setTimeout(() => {
      triggerNotification(demoNotifications[1]); // Squires center
    }, 5000);
    
    setTimeout(() => {
      triggerNotification(demoNotifications[2]); // Downtown Blacksburg
    }, 8000);
  };

  const stopDemo = () => {
    setIsActive(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          VT Hacks Demo - Geolocation Notifications
        </CardTitle>
        <CardDescription>
          Simulate location-based financial notifications for the MoneyLens demo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Demo Status */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="font-medium">
              {isActive ? 'Demo Active' : 'Demo Inactive'}
            </span>
          </div>
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Running' : 'Stopped'}
          </Badge>
        </div>

        {/* Demo Controls */}
        <div className="flex gap-2">
          {!isActive ? (
            <Button onClick={startDemo} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Start Demo Sequence
            </Button>
          ) : (
            <Button onClick={stopDemo} variant="outline" className="flex-1">
              <Square className="w-4 h-4 mr-2" />
              Stop Demo
            </Button>
          )}
        </div>

        {/* Individual Notification Triggers */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">Individual Notifications:</h4>
          <div className="grid grid-cols-1 gap-2">
            {demoNotifications.map((notification) => (
              <Button
                key={notification.id}
                variant="outline"
                size="sm"
                onClick={() => triggerNotification(notification)}
                className="justify-start h-auto p-3"
              >
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                <div className="text-left flex-1">
                  <div className="font-medium text-sm">{notification.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {notification.location}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Demo Instructions */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-sm text-blue-900 mb-2">Demo Instructions:</h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Click "Start Demo Sequence" to trigger a realistic notification flow</li>
            <li>2. Or click individual notification buttons to test specific scenarios</li>
            <li>3. <strong>High-risk notifications</strong> (like "High Risk Location" or "Downtown Blacksburg") will show <strong>blocking spending alerts</strong></li>
            <li>4. Regular notifications appear as toast messages and in the notification dropdown</li>
            <li>5. The main demo notification simulates arriving at Owens Ballroom</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

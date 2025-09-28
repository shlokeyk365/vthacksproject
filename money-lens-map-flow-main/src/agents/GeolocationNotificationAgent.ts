import { LocationTracker, Geofence } from './LocationTracker';
import { useNotifications } from '../contexts/NotificationContext';

export interface GeolocationNotification {
  id: string;
  type: 'geofence_enter' | 'geofence_exit' | 'proximity_alert' | 'location_based_insight';
  title: string;
  message: string;
  location: {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
  };
  geofenceId: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  suggestedAction?: string;
}

export class GeolocationNotificationAgent {
  private locationTracker: LocationTracker;
  private notifications: GeolocationNotification[] = [];
  private demoGeofences: Geofence[] = [];
  private isActive = false;
  private onNotification?: (notification: GeolocationNotification) => void;

  constructor() {
    this.locationTracker = new LocationTracker();
    this.setupDemoGeofences();
  }

  // Setup demo geofences including Owens Ballroom
  private setupDemoGeofences(): void {
    // Owens Ballroom in Blacksburg - Demo Location
    const owensBallroom: Geofence = {
      id: 'owens_ballroom_demo',
      name: 'Owens Ballroom - VT Hacks Demo',
      center: {
        lat: 37.22767,
        lng: -80.41794,
        accuracy: 10,
        timestamp: Date.now()
      },
      radius: 100, // 100 meters radius
      type: 'merchant',
      merchantId: 'owens_ballroom'
    };

    // Add some additional demo locations for a more realistic experience
    const squiresStudentCenter: Geofence = {
      id: 'squires_student_center',
      name: 'Squires Student Center',
      center: {
        lat: 37.2295,
        lng: -80.4200,
        accuracy: 10,
        timestamp: Date.now()
      },
      radius: 80,
      type: 'merchant',
      merchantId: 'squires_student_center'
    };

    const downtownBlacksburg: Geofence = {
      id: 'downtown_blacksburg',
      name: 'Downtown Blacksburg',
      center: {
        lat: 37.2290,
        lng: -80.4100,
        accuracy: 10,
        timestamp: Date.now()
      },
      radius: 200,
      type: 'high_risk',
      merchantId: 'downtown_blacksburg'
    };

    // Current Location - High Risk Zone for Testing
    const currentLocation: Geofence = {
      id: 'current_location_high_risk',
      name: 'Current Location - High Risk Zone',
      center: {
        lat: 37.2521,
        lng: -80.4097,
        accuracy: 10,
        timestamp: Date.now()
      },
      radius: 50, // 50 meters radius for precise testing
      type: 'high_risk',
      merchantId: 'current_location'
    };

    this.demoGeofences = [owensBallroom, squiresStudentCenter, downtownBlacksburg, currentLocation];
    
    // Add geofences to location tracker
    this.demoGeofences.forEach(geofence => {
      this.locationTracker.addGeofence(geofence);
    });
  }

  // Start the geolocation notification system
  start(onNotification?: (notification: GeolocationNotification) => void): Promise<void> {
    this.onNotification = onNotification;
    this.isActive = true;

    return this.locationTracker.startTracking(
      (location) => this.handleLocationUpdate(location),
      (geofence) => this.handleGeofenceEnter(geofence),
      (geofence) => this.handleGeofenceExit(geofence)
    ).then(() => {
      console.log('🎯 GeolocationNotificationAgent: Started successfully');
      this.addDemoNotification({
        type: 'location_based_insight',
        title: 'Location Tracking Active',
        message: 'MoneyLens is now tracking your location for smart financial insights.',
        location: {
          name: 'Current Location',
          address: 'Location tracking enabled',
          coordinates: { lat: 0, lng: 0 }
        },
        geofenceId: 'system',
        severity: 'low',
        actionable: false
      });
    }).catch((error) => {
      console.error('❌ GeolocationNotificationAgent: Failed to start:', error);
      // Add fallback notification for demo purposes
      this.addDemoNotification({
        type: 'location_based_insight',
        title: 'Demo Mode - Location Simulation',
        message: 'Running in demo mode. Location-based notifications are simulated.',
        location: {
          name: 'Demo Mode',
          address: 'Simulated location tracking',
          coordinates: { lat: 37.22767, lng: -80.41794 }
        },
        geofenceId: 'demo_mode',
        severity: 'low',
        actionable: false
      });
    });
  }

  // Stop the geolocation notification system
  stop(): void {
    this.isActive = false;
    this.locationTracker.stopTracking();
    console.log('🛑 GeolocationNotificationAgent: Stopped');
  }

  // Handle location updates
  private handleLocationUpdate(location: { lat: number; lng: number; accuracy?: number; timestamp?: number }): void {
    if (!this.isActive) return;

    // Check for proximity to demo locations
    this.checkProximityAlerts(location);
  }

  // Handle geofence entry
  private handleGeofenceEnter(geofence: Geofence): void {
    if (!this.isActive) return;

    console.log(`🎯 Entered geofence: ${geofence.name}`);

    let notification: GeolocationNotification;

    switch (geofence.id) {
      case 'owens_ballroom_demo':
        notification = {
          type: 'geofence_enter',
          title: '🎉 Welcome to VT Hacks Demo!',
          message: 'You\'ve arrived at Owens Ballroom! This is where the MoneyLens demo is taking place. Check out the smart financial features!',
          location: {
            name: geofence.name,
            address: '150 Kent St, Blacksburg, VA',
            coordinates: { lat: geofence.center.lat, lng: geofence.center.lng }
          },
          geofenceId: geofence.id,
          timestamp: Date.now(),
          severity: 'high',
          actionable: true,
          suggestedAction: 'Explore the MoneyLens features and try the interactive demo!'
        };
        break;

      case 'squires_student_center':
        notification = {
          type: 'geofence_enter',
          title: '📍 Near Squires Student Center',
          message: 'You\'re near a popular student area. This location typically has high spending activity.',
          location: {
            name: geofence.name,
            address: 'Squires Student Center, Blacksburg, VA',
            coordinates: { lat: geofence.center.lat, lng: geofence.center.lng }
          },
          geofenceId: geofence.id,
          timestamp: Date.now(),
          severity: 'medium',
          actionable: true,
          suggestedAction: 'Consider setting a spending cap for this area.'
        };
        break;

      case 'downtown_blacksburg':
        notification = {
          type: 'geofence_enter',
          title: '🏪 Downtown Blacksburg - High Spending Zone',
          message: 'You\'ve entered downtown Blacksburg, a high-spending area with many restaurants and shops.',
          location: {
            name: geofence.name,
            address: 'Downtown Blacksburg, VA',
            coordinates: { lat: geofence.center.lat, lng: geofence.center.lng }
          },
          geofenceId: geofence.id,
          timestamp: Date.now(),
          severity: 'high',
          actionable: true,
          suggestedAction: 'Set a daily spending limit for downtown visits.'
        };
        break;

      case 'current_location_high_risk':
        notification = {
          type: 'geofence_enter',
          title: '⚠️ High Risk Location Detected!',
          message: 'You\'ve entered a high-risk spending zone! MoneyLens has detected unusual financial activity in this area.',
          location: {
            name: geofence.name,
            address: 'Current Location - High Risk Zone',
            coordinates: { lat: geofence.center.lat, lng: geofence.center.lng }
          },
          geofenceId: geofence.id,
          timestamp: Date.now(),
          severity: 'critical',
          actionable: true,
          suggestedAction: 'Enable enhanced monitoring and consider setting strict spending limits for this location.'
        };
        break;

      default:
        notification = {
          type: 'geofence_enter',
          title: `📍 Entered ${geofence.name}`,
          message: `You've entered the ${geofence.name} area.`,
          location: {
            name: geofence.name,
            address: 'Unknown address',
            coordinates: { lat: geofence.center.lat, lng: geofence.center.lng }
          },
          geofenceId: geofence.id,
          timestamp: Date.now(),
          severity: 'low',
          actionable: false
        };
    }

    this.addNotification(notification);
  }

  // Handle geofence exit
  private handleGeofenceExit(geofence: Geofence): void {
    if (!this.isActive) return;

    console.log(`🎯 Exited geofence: ${geofence.name}`);

    const notification: GeolocationNotification = {
      type: 'geofence_exit',
      title: `📍 Left ${geofence.name}`,
      message: `You've left the ${geofence.name} area.`,
      location: {
        name: geofence.name,
        address: 'Unknown address',
        coordinates: { lat: geofence.center.lat, lng: geofence.center.lng }
      },
      geofenceId: geofence.id,
      timestamp: Date.now(),
      severity: 'low',
      actionable: false
    };

    this.addNotification(notification);
  }

  // Check for proximity alerts
  private checkProximityAlerts(location: { lat: number; lng: number; accuracy?: number; timestamp?: number }): void {
    // Check if we're approaching any geofences
    const nearbyGeofences = this.locationTracker.getNearbyGeofences(500); // 500 meters

    nearbyGeofences.forEach(geofence => {
      if (geofence.id === 'owens_ballroom_demo') {
        const distance = this.calculateDistance(location, geofence.center);
        if (distance <= 200 && distance > 100) { // Within 200m but outside geofence
          this.addNotification({
            type: 'proximity_alert',
            title: '🎯 Approaching VT Hacks Demo!',
            message: 'You\'re getting close to the MoneyLens demo at Owens Ballroom. Just a few more steps!',
            location: {
              name: geofence.name,
              address: '150 Kent St, Blacksburg, VA',
              coordinates: { lat: geofence.center.lat, lng: geofence.center.lng }
            },
            geofenceId: geofence.id,
            timestamp: Date.now(),
            severity: 'medium',
            actionable: true,
            suggestedAction: 'Continue towards Owens Ballroom to see the full demo!'
          });
        }
      }
    });
  }

  // Add a notification
  private addNotification(notification: GeolocationNotification): void {
    this.notifications.push(notification);
    
    // Keep only last 50 notifications
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(-50);
    }

    // Notify listeners
    if (this.onNotification) {
      this.onNotification(notification);
    }

    console.log(`🔔 Geolocation Notification: ${notification.title}`);
  }

  // Add demo notification (for when location tracking fails)
  private addDemoNotification(notification: Omit<GeolocationNotification, 'id'>): void {
    const fullNotification: GeolocationNotification = {
      ...notification,
      id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    this.addNotification(fullNotification);
  }

  // Calculate distance between two points using Haversine formula
  private calculateDistance(
    loc1: { lat: number; lng: number },
    loc2: { lat: number; lng: number }
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (loc1.lat * Math.PI) / 180;
    const φ2 = (loc2.lat * Math.PI) / 180;
    const Δφ = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const Δλ = ((loc2.lng - loc1.lng) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Simulate location for demo purposes
  simulateLocation(location: { lat: number; lng: number }): void {
    if (!this.isActive) return;

    console.log(`🎭 Simulating location: ${location.lat}, ${location.lng}`);
    
    // Check if this simulated location triggers any geofences
    this.demoGeofences.forEach(geofence => {
      const distance = this.calculateDistance(location, geofence.center);
      const isInside = distance <= geofence.radius;
      
      // For demo purposes, we'll simulate entering the geofence
      if (isInside) {
        this.handleGeofenceEnter(geofence);
      }
    });
  }

  // Get all notifications
  getNotifications(): GeolocationNotification[] {
    return [...this.notifications];
  }

  // Get notifications by type
  getNotificationsByType(type: GeolocationNotification['type']): GeolocationNotification[] {
    return this.notifications.filter(n => n.type === type);
  }

  // Get recent notifications (last 10)
  getRecentNotifications(): GeolocationNotification[] {
    return this.notifications
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }

  // Check if agent is active
  getIsActive(): boolean {
    return this.isActive;
  }

  // Get current location
  getCurrentLocation(): { lat: number; lng: number; accuracy?: number } | null {
    const location = this.locationTracker.getCurrentLocation();
    return location ? { lat: location.lat, lng: location.lng, accuracy: location.accuracy } : null;
  }

  // Get demo geofences
  getDemoGeofences(): Geofence[] {
    return [...this.demoGeofences];
  }
}

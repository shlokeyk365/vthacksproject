import { Location } from './FinancialBodyguard';

export interface LocationUpdate {
  location: Location;
  timestamp: number;
  accuracy: number;
}

export interface Geofence {
  id: string;
  name: string;
  center: Location;
  radius: number; // in meters
  type: 'merchant' | 'high_risk' | 'safe_zone';
  merchantId?: string;
}

export class LocationTracker {
  private currentLocation: Location | null = null;
  private locationHistory: LocationUpdate[] = [];
  private geofences: Geofence[] = [];
  private watchId: number | null = null;
  private isTracking = false;
  private onLocationUpdate?: (location: Location) => void;
  private onGeofenceEnter?: (geofence: Geofence) => void;
  private onGeofenceExit?: (geofence: Geofence) => void;

  constructor() {
    this.loadGeofences();
  }

  // Start location tracking
  startTracking(
    onLocationUpdate?: (location: Location) => void,
    onGeofenceEnter?: (geofence: Geofence) => void,
    onGeofenceExit?: (geofence: Geofence) => void
  ): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      this.onLocationUpdate = onLocationUpdate;
      this.onGeofenceEnter = onGeofenceEnter;
      this.onGeofenceExit = onGeofenceExit;

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000 // 30 seconds
      };

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };

          this.updateLocation(location);
          resolve(location);
        },
        (error) => {
          console.error('Location tracking error:', error);
          reject(error);
        },
        options
      );

      this.isTracking = true;
    });
  }

  // Stop location tracking
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
  }

  // Update current location
  private updateLocation(location: Location): void {
    this.currentLocation = location;
    this.locationHistory.push({
      location,
      timestamp: Date.now(),
      accuracy: location.accuracy || 0
    });

    // Keep only last 100 location updates
    if (this.locationHistory.length > 100) {
      this.locationHistory = this.locationHistory.slice(-100);
    }

    // Check geofences
    this.checkGeofences(location);

    // Notify listeners
    if (this.onLocationUpdate) {
      this.onLocationUpdate(location);
    }
  }

  // Check if location is within any geofences
  private checkGeofences(location: Location): void {
    for (const geofence of this.geofences) {
      const distance = this.calculateDistance(location, geofence.center);
      const isInside = distance <= geofence.radius;

      // Check if we just entered or exited this geofence
      const wasInside = this.wasInsideGeofence(geofence.id);
      
      if (isInside && !wasInside) {
        // Entered geofence
        if (this.onGeofenceEnter) {
          this.onGeofenceEnter(geofence);
        }
      } else if (!isInside && wasInside) {
        // Exited geofence
        if (this.onGeofenceExit) {
          this.onGeofenceExit(geofence);
        }
      }
    }
  }

  // Check if we were inside a geofence in the previous location update
  private wasInsideGeofence(geofenceId: string): boolean {
    if (!this.currentLocation) return false;
    
    const geofence = this.geofences.find(g => g.id === geofenceId);
    if (!geofence) return false;

    const distance = this.calculateDistance(this.currentLocation, geofence.center);
    return distance <= geofence.radius;
  }

  // Calculate distance between two locations using Haversine formula
  private calculateDistance(loc1: Location, loc2: Location): number {
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

  // Add a geofence
  addGeofence(geofence: Geofence): void {
    this.geofences.push(geofence);
    this.saveGeofences();
  }

  // Remove a geofence
  removeGeofence(geofenceId: string): void {
    this.geofences = this.geofences.filter(g => g.id !== geofenceId);
    this.saveGeofences();
  }

  // Get current location
  getCurrentLocation(): Location | null {
    return this.currentLocation;
  }

  // Get location history
  getLocationHistory(): LocationUpdate[] {
    return [...this.locationHistory];
  }

  // Get geofences
  getGeofences(): Geofence[] {
    return [...this.geofences];
  }

  // Check if currently inside a specific geofence
  isInsideGeofence(geofenceId: string): boolean {
    if (!this.currentLocation) return false;
    
    const geofence = this.geofences.find(g => g.id === geofenceId);
    if (!geofence) return false;

    const distance = this.calculateDistance(this.currentLocation, geofence.center);
    return distance <= geofence.radius;
  }

  // Get nearby geofences within a certain distance
  getNearbyGeofences(maxDistance: number = 1000): Geofence[] {
    if (!this.currentLocation) return [];

    return this.geofences.filter(geofence => {
      const distance = this.calculateDistance(this.currentLocation!, geofence.center);
      return distance <= maxDistance;
    });
  }

  // Save geofences to localStorage
  private saveGeofences(): void {
    try {
      localStorage.setItem('locationTrackerGeofences', JSON.stringify(this.geofences));
    } catch (error) {
      console.warn('Failed to save geofences:', error);
    }
  }

  // Load geofences from localStorage
  private loadGeofences(): void {
    try {
      const saved = localStorage.getItem('locationTrackerGeofences');
      if (saved) {
        this.geofences = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load geofences:', error);
    }
  }

  // Check if tracking is active
  isTrackingActive(): boolean {
    return this.isTracking;
  }

  // Get location accuracy
  getLocationAccuracy(): number | null {
    if (!this.currentLocation) return null;
    return this.currentLocation.accuracy || null;
  }

  // Check if location is accurate enough for financial decisions
  isLocationAccurate(): boolean {
    const accuracy = this.getLocationAccuracy();
    return accuracy !== null && accuracy <= 100; // Within 100 meters
  }
}

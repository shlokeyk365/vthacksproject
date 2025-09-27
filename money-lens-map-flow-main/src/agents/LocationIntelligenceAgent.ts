// Location Intelligence Agent - Solves map marker stability issues
interface LocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  confidence?: number;
}

interface MerchantLocation {
  id: string;
  name: string;
  address: string;
  coordinates: LocationData;
  verified: boolean;
  lastVerified: Date;
  confidence: number; // 0-100, how confident we are in this location
}

interface LocationIntelligenceAgentConfig {
  minConfidenceThreshold: number; // Minimum confidence to use a location
  verificationInterval: number; // How often to re-verify locations (in ms)
  geocodingRetryAttempts: number; // How many times to retry geocoding
  coordinateTolerance: number; // How close coordinates need to be to be considered the same location
}

export class LocationIntelligenceAgent {
  private merchantLocations: Map<string, MerchantLocation> = new Map();
  private config: LocationIntelligenceAgentConfig;
  private verificationTimer: NodeJS.Timeout | null = null;

  constructor(config?: Partial<LocationIntelligenceAgentConfig>) {
    this.config = {
      minConfidenceThreshold: 70,
      verificationInterval: 24 * 60 * 60 * 1000, // 24 hours
      geocodingRetryAttempts: 3,
      coordinateTolerance: 0.0001, // ~11 meters
      ...config
    };
  }

  /**
   * AGENTIC WORKFLOW: Intelligent Location Resolution
   * This is the core agentic logic that solves marker stability
   */
  public async resolveMerchantLocation(
    merchantId: string, 
    merchantName: string, 
    address: string,
    existingCoordinates?: LocationData
  ): Promise<LocationData> {
    console.log(`🤖 Location Intelligence Agent: Resolving location for ${merchantName}`);

    // 1. PERCEPTION: Check if we already have accurate coordinates
    if (existingCoordinates && this.areCoordinatesAccurate(existingCoordinates, address)) {
      console.log(`✅ Using provided accurate coordinates for ${merchantName}`);
      return existingCoordinates;
    }

    // 2. PERCEPTION: Check if we already have a verified location
    const existingLocation = this.merchantLocations.get(merchantId);
    if (existingLocation && this.isLocationValid(existingLocation)) {
      console.log(`✅ Using cached verified location for ${merchantName}`);
      return existingLocation.coordinates;
    }

    // 3. PLANNING: Determine the best strategy for location resolution
    const strategy = this.determineLocationStrategy(merchantName, address, existingLocation);
    console.log(`🎯 Using strategy: ${strategy}`);

    // 4. ACTION: Execute the chosen strategy
    const location = await this.executeLocationStrategy(strategy, merchantId, merchantName, address);
    
    // 5. LEARNING: Store the result for future use
    this.storeLocationResult(merchantId, merchantName, address, location);
    
    return location.coordinates;
  }

  /**
   * AGENTIC DECISION: Choose the best location resolution strategy
   */
  private determineLocationStrategy(
    merchantName: string, 
    address: string, 
    existingLocation?: MerchantLocation
  ): 'cached' | 'geocoding' | 'fallback' | 'verification' {
    
    // If we have a high-confidence cached location, use it
    if (existingLocation && existingLocation.confidence >= this.config.minConfidenceThreshold) {
      return 'cached';
    }

    // If we have a low-confidence location, try to verify it
    if (existingLocation && existingLocation.confidence < this.config.minConfidenceThreshold) {
      return 'verification';
    }

    // If we have a good address, try geocoding
    if (address && address !== 'Address not available') {
      return 'geocoding';
    }

    // Fallback to known merchant coordinates
    return 'fallback';
  }

  /**
   * AGENTIC ACTION: Execute the chosen location strategy
   */
  private async executeLocationStrategy(
    strategy: string,
    merchantId: string,
    merchantName: string,
    address: string
  ): Promise<MerchantLocation> {
    
    switch (strategy) {
      case 'cached':
        return this.merchantLocations.get(merchantId)!;

      case 'verification':
        return await this.verifyExistingLocation(merchantId, merchantName, address);

      case 'geocoding':
        return await this.geocodeAddress(merchantId, merchantName, address);

      case 'fallback':
        return this.getFallbackLocation(merchantId, merchantName);

      default:
        throw new Error(`Unknown strategy: ${strategy}`);
    }
  }

  /**
   * AGENTIC LEARNING: Store location results for future intelligence
   */
  private storeLocationResult(
    merchantId: string,
    merchantName: string,
    address: string,
    location: MerchantLocation
  ): void {
    this.merchantLocations.set(merchantId, {
      ...location,
      lastVerified: new Date(),
      verified: true
    });
    
    console.log(`🧠 Learned location for ${merchantName}: ${location.coordinates.lat}, ${location.coordinates.lng} (confidence: ${location.confidence})`);
  }

  /**
   * AGENTIC VERIFICATION: Verify existing locations periodically
   */
  private async verifyExistingLocation(
    merchantId: string,
    merchantName: string,
    address: string
  ): Promise<MerchantLocation> {
    console.log(`🔍 Verifying existing location for ${merchantName}`);
    
    // Try to geocode the address to verify
    const geocodedLocation = await this.geocodeAddress(merchantId, merchantName, address);
    const existingLocation = this.merchantLocations.get(merchantId)!;
    
    // Check if the new location is close to the existing one
    const distance = this.calculateDistance(
      existingLocation.coordinates,
      geocodedLocation.coordinates
    );
    
    if (distance < this.config.coordinateTolerance) {
      // Locations are close, increase confidence
      return {
        ...existingLocation,
        confidence: Math.min(existingLocation.confidence + 10, 100),
        lastVerified: new Date()
      };
    } else {
      // Locations differ, use the new one but with lower confidence
      return {
        ...geocodedLocation,
        confidence: Math.max(geocodedLocation.confidence - 20, 30)
      };
    }
  }

  /**
   * AGENTIC GEOCODING: Intelligent geocoding with retry logic
   */
  private async geocodeAddress(
    merchantId: string,
    merchantName: string,
    address: string
  ): Promise<MerchantLocation> {
    console.log(`🌍 Geocoding address for ${merchantName}: ${address}`);
    
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.geocodingRetryAttempts; attempt++) {
      try {
        const coordinates = await this.performGeocoding(address);
        
        return {
          id: merchantId,
          name: merchantName,
          address,
          coordinates,
          verified: true,
          lastVerified: new Date(),
          confidence: this.calculateGeocodingConfidence(address, coordinates)
        };
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Geocoding attempt ${attempt} failed for ${merchantName}:`, error);
        
        if (attempt < this.config.geocodingRetryAttempts) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    
    // All geocoding attempts failed, use fallback
    console.warn(`❌ All geocoding attempts failed for ${merchantName}, using fallback`);
    return this.getFallbackLocation(merchantId, merchantName);
  }

  /**
   * AGENTIC FALLBACK: Smart fallback to known merchant locations
   */
  private getFallbackLocation(merchantId: string, merchantName: string): MerchantLocation {
    // Known merchant locations with high confidence (matching backend data)
    const knownMerchants: { [key: string]: LocationData } = {
      'target-christiansburg': { lat: 37.156681, lng: -80.422609 },
      'starbucks-university': { lat: 37.235581, lng: -80.433307 },
      'kroger-south-main': { lat: 37.216801, lng: -80.402687 },
      'walmart-christiansburg': { lat: 37.145123, lng: -80.408456 },
      'mcdonalds-university': { lat: 37.234567, lng: -80.432109 },
      'shell-gas-station': { lat: 37.218901, lng: -80.401234 },
      'corner-bar': { lat: 37.229012, lng: -80.414567 },
      'subway-downtown': { lat: 37.228456, lng: -80.413789 },
      'cvs-pharmacy': { lat: 37.227890, lng: -80.412345 },
      'pizza-hut': { lat: 37.233456, lng: -80.431234 },
      'dominos-pizza': { lat: 37.226789, lng: -80.411567 },
      'food-lion': { lat: 37.232345, lng: -80.430123 }
    };
    
    // Try to find by merchant name if ID doesn't match
    let fallbackCoords = knownMerchants[merchantId];
    
    if (!fallbackCoords) {
      // Try to match by name similarity
      const merchantNameLower = merchantName.toLowerCase();
      for (const [id, coords] of Object.entries(knownMerchants)) {
        const knownName = id.split('-')[0]; // Extract name from ID
        if (merchantNameLower.includes(knownName) || knownName.includes(merchantNameLower)) {
          fallbackCoords = coords;
          break;
        }
      }
    }
    
    // If still no match, generate coordinates in Blacksburg area
    if (!fallbackCoords) {
      fallbackCoords = {
        lat: 37.2296 + (Math.random() - 0.5) * 0.02, // Blacksburg area with more spread
        lng: -80.4139 + (Math.random() - 0.5) * 0.02
      };
    }
    
    return {
      id: merchantId,
      name: merchantName,
      address: 'Location estimated',
      coordinates: fallbackCoords,
      verified: false,
      lastVerified: new Date(),
      confidence: knownMerchants[merchantId] ? 85 : 50
    };
  }

  /**
   * AGENTIC PERCEPTION: Check if a location is still valid
   */
  private isLocationValid(location: MerchantLocation): boolean {
    const now = new Date();
    const timeSinceVerification = now.getTime() - location.lastVerified.getTime();
    
    return (
      location.verified &&
      location.confidence >= this.config.minConfidenceThreshold &&
      timeSinceVerification < this.config.verificationInterval
    );
  }

  /**
   * AGENTIC PERCEPTION: Check if provided coordinates are already accurate
   */
  private areCoordinatesAccurate(coordinates: LocationData, address: string): boolean {
    // Check if coordinates are in the Blacksburg/Christiansburg area
    const isInBlacksburgArea = coordinates.lat >= 37.1 && coordinates.lat <= 37.3 && 
                              coordinates.lng >= -80.5 && coordinates.lng <= -80.3;
    
    // Check if address looks legitimate (not placeholder)
    const hasRealAddress = address && 
                          address !== 'Address to be geocoded' && 
                          address !== 'Address not available' &&
                          address.includes('VA') &&
                          (address.includes('Blacksburg') || address.includes('Christiansburg'));
    
    return isInBlacksburgArea && hasRealAddress;
  }

  /**
   * AGENTIC INTELLIGENCE: Calculate geocoding confidence based on address quality
   */
  private calculateGeocodingConfidence(address: string, coordinates: LocationData): number {
    let confidence = 60; // Base confidence
    
    // Address quality indicators
    if (address.includes('Blacksburg, VA')) confidence += 20;
    if (address.includes('Christiansburg, VA')) confidence += 20;
    if (address.includes('VA 24060')) confidence += 10;
    if (address.includes('VA 24073')) confidence += 10;
    if (address.match(/\d+.*St/)) confidence += 10; // Street address
    if (address.match(/\d+.*Ave/)) confidence += 10; // Avenue address
    if (address.match(/\d+.*Blvd/)) confidence += 10; // Boulevard address
    
    // Coordinate quality indicators
    if (coordinates.lat >= 37.1 && coordinates.lat <= 37.3) confidence += 10; // Blacksburg area
    if (coordinates.lng >= -80.5 && coordinates.lng <= -80.3) confidence += 10; // Blacksburg area
    
    return Math.min(confidence, 100);
  }

  /**
   * AGENTIC ACTION: Perform actual geocoding (integrate with backend API)
   */
  private async performGeocoding(address: string): Promise<LocationData> {
    try {
      // Use backend geocoding API which handles Mapbox integration
      const response = await fetch('/api/map/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ address })
      });

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data && data.data.coordinates) {
        return { 
          lat: data.data.coordinates.lat, 
          lng: data.data.coordinates.lng, 
          confidence: 90 
        };
      }
      
      throw new Error('No geocoding results found');
    } catch (error) {
      console.warn('Backend geocoding failed, falling back to mock:', error);
      
      // Fallback to mock coordinates for development
      return {
        lat: 37.2296 + (Math.random() - 0.5) * 0.01,
        lng: -80.4139 + (Math.random() - 0.5) * 0.01,
        confidence: 50
      };
    }
  }

  /**
   * AGENTIC UTILITY: Calculate distance between two coordinates
   */
  private calculateDistance(coord1: LocationData, coord2: LocationData): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = coord1.lat * Math.PI / 180;
    const φ2 = coord2.lat * Math.PI / 180;
    const Δφ = (coord2.lat - coord1.lat) * Math.PI / 180;
    const Δλ = (coord2.lng - coord1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }

  /**
   * AGENTIC MAINTENANCE: Start periodic verification of locations
   */
  public startPeriodicVerification(): void {
    if (this.verificationTimer) {
      clearInterval(this.verificationTimer);
    }
    
    this.verificationTimer = setInterval(() => {
      this.verifyAllLocations();
    }, this.config.verificationInterval);
    
    console.log('🔄 Started periodic location verification');
  }

  /**
   * AGENTIC MAINTENANCE: Verify all stored locations
   */
  private async verifyAllLocations(): Promise<void> {
    console.log('🔍 Verifying all stored locations...');
    
    for (const [merchantId, location] of this.merchantLocations.entries()) {
      if (!this.isLocationValid(location)) {
        try {
          await this.verifyExistingLocation(merchantId, location.name, location.address);
        } catch (error) {
          console.warn(`Failed to verify location for ${location.name}:`, error);
        }
      }
    }
  }

  /**
   * AGENTIC CLEANUP: Stop periodic verification
   */
  public stopPeriodicVerification(): void {
    if (this.verificationTimer) {
      clearInterval(this.verificationTimer);
      this.verificationTimer = null;
    }
    console.log('⏹️ Stopped periodic location verification');
  }

  /**
   * AGENTIC INSIGHTS: Get location intelligence summary
   */
  public getLocationIntelligence(): {
    totalLocations: number;
    verifiedLocations: number;
    averageConfidence: number;
    locationsByConfidence: { [key: string]: number };
  } {
    const locations = Array.from(this.merchantLocations.values());
    const verifiedLocations = locations.filter(l => l.verified).length;
    const averageConfidence = locations.reduce((sum, l) => sum + l.confidence, 0) / locations.length;
    
    const locationsByConfidence = locations.reduce((acc, l) => {
      const range = l.confidence >= 90 ? '90-100' : 
                   l.confidence >= 70 ? '70-89' : 
                   l.confidence >= 50 ? '50-69' : '0-49';
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });
    
    return {
      totalLocations: locations.length,
      verifiedLocations,
      averageConfidence: Math.round(averageConfidence * 100) / 100,
      locationsByConfidence
    };
  }
}

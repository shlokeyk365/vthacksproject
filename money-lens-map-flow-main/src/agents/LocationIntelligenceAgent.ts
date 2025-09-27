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
    address: string
  ): Promise<LocationData> {
    console.log(`🤖 Location Intelligence Agent: Resolving location for ${merchantName}`);

    // 1. PERCEPTION: Check if we already have a verified location
    const existingLocation = this.merchantLocations.get(merchantId);
    if (existingLocation && this.isLocationValid(existingLocation)) {
      console.log(`✅ Using cached verified location for ${merchantName}`);
      return existingLocation.coordinates;
    }

    // 2. PLANNING: Determine the best strategy for location resolution
    const strategy = this.determineLocationStrategy(merchantName, address, existingLocation);
    console.log(`🎯 Using strategy: ${strategy}`);

    // 3. ACTION: Execute the chosen strategy
    const location = await this.executeLocationStrategy(strategy, merchantId, merchantName, address);
    
    // 4. LEARNING: Store the result for future use
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
    // Known merchant locations with high confidence
    const knownMerchants: { [key: string]: LocationData } = {
      'starbucks-university': { lat: 37.2280, lng: -80.4230 },
      'target-christiansburg': { lat: 37.1250, lng: -80.4050 },
      'kroger-south-main': { lat: 37.2150, lng: -80.4150 },
      'corner-bar': { lat: 37.2290, lng: -80.4140 },
      'shell-gas': { lat: 37.2350, lng: -80.4000 }
    };
    
    const fallbackCoords = knownMerchants[merchantId] || {
      lat: 37.2296 + (Math.random() - 0.5) * 0.01, // Blacksburg area
      lng: -80.4139 + (Math.random() - 0.5) * 0.01
    };
    
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
   * AGENTIC ACTION: Perform actual geocoding (integrate with Mapbox)
   */
  private async performGeocoding(address: string): Promise<LocationData> {
    // This would integrate with Mapbox Geocoding API
    // For now, return a mock implementation
    const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    
    if (!mapboxToken) {
      throw new Error('Mapbox token not available');
    }
    
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng, confidence: 90 };
    }
    
    throw new Error('No geocoding results found');
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

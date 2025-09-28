import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Search, 
  DollarSign,
  Coffee,
  ShoppingBag,
  Car,
  Calendar,
  RefreshCw,
  Brain,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { useMapbox } from "@/contexts/MapboxContext";
import { LocationIntelligenceAgent } from "@/agents/LocationIntelligenceAgent";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapMerchant {
  id: string;
  name: string;
  address: string;
  totalSpent: number;
  visits: number;
  category: string;
  coordinates: { lat: number; lng: number };
  averageSpent: number;
  pricingLevel: 'low' | 'medium' | 'high';
}

const categoryIcons: { [key: string]: any } = {
  'Food & Dining': Coffee,
  'Shopping': ShoppingBag,
  'Transportation': Car,
  'Grocery': DollarSign,
  'Other': DollarSign,
  'Entertainment': DollarSign,
  'Healthcare': MapPin,
};

// Pricing level colors and glow effects
const pricingLevelColors = {
  low: {
    background: 'linear-gradient(135deg, #10b981, #059669)', // Green
    glow: '0 0 20px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.4), 0 0 60px rgba(16, 185, 129, 0.2)',
    border: '#10b981'
  },
  medium: {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)', // Yellow/Orange
    glow: '0 0 20px rgba(245, 158, 11, 0.6), 0 0 40px rgba(245, 158, 11, 0.4), 0 0 60px rgba(245, 158, 11, 0.2)',
    border: '#f59e0b'
  },
  high: {
    background: 'linear-gradient(135deg, #ef4444, #dc2626)', // Red
    glow: '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.4), 0 0 60px rgba(239, 68, 68, 0.2)',
    border: '#ef4444'
  }
};

export default function MapView() {
  const { mapboxToken, isMapboxConfigured, isLoading: mapboxLoading } = useMapbox();
  
  const [merchants, setMerchants] = useState<MapMerchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<MapMerchant | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState("30");
  const [isLoading, setIsLoading] = useState(true);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [locationIntelligence, setLocationIntelligence] = useState<any>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentPopup, setCurrentPopup] = useState<mapboxgl.Popup | null>(null);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const locationAgentRef = useRef<LocationIntelligenceAgent | null>(null);

  // Initialize Location Intelligence Agent
  useEffect(() => {
    locationAgentRef.current = new LocationIntelligenceAgent({
      minConfidenceThreshold: 70,
      verificationInterval: 24 * 60 * 60 * 1000, // 24 hours
      geocodingRetryAttempts: 3,
      coordinateTolerance: 0.0001
    });

    // Start periodic verification
    locationAgentRef.current.startPeriodicVerification();

    return () => {
      if (locationAgentRef.current) {
        locationAgentRef.current.stopPeriodicVerification();
      }
    };
  }, []);

  // Load map data
  useEffect(() => {
    loadMapData();
  }, [period]);

  // Initialize map when Mapbox is configured
  useEffect(() => {
    if (isMapboxConfigured && mapboxToken && mapContainer.current && !map) {
      initializeMap();
    }
  }, [isMapboxConfigured, mapboxToken]);

  // Update map when merchants change
  useEffect(() => {
    if (map && merchants.length > 0) {
      updateMapMarkers();
    }
  }, [map, merchants]);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-80.4139, 37.2296], // Blacksburg, VA
      zoom: 12,
      attributionControl: false
    });

    // Add navigation controls
    newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geolocate control
    newMap.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    }), 'top-right');

    newMap.on('load', () => {
      setMap(newMap);
      console.log('Map initialized successfully');
      console.log('Map center:', newMap.getCenter());
      console.log('Map zoom:', newMap.getZoom());
    });

    newMap.on('error', (e) => {
      console.error('Map error:', e);
      toast.error('Map failed to load', {
        description: 'Please check your Mapbox token',
        duration: 5000,
      });
    });
  };

  const updateMapMarkers = async () => {
    if (!map || !locationAgentRef.current) return;

    // Clear existing markers
    markers.forEach(marker => marker.remove());
    setMarkers([]);

    const newMarkers: mapboxgl.Marker[] = [];

    // Filter out merchants with placeholder addresses first
    const validMerchants = merchants.filter(merchant => 
      merchant.address !== 'Address to be geocoded' &&
      merchant.address !== 'Address not available'
    );

    // Process merchants - use backend coordinates directly for known merchants
    const processedMerchants = await Promise.all(
      validMerchants.map(async (merchant) => {
        // Check if this is a known merchant with accurate coordinates
        const isKnownMerchant = merchant.id.includes('-') && 
          !merchant.id.includes('-similar-') && 
          !merchant.id.includes('-mock');

        if (isKnownMerchant) {
          // Use backend coordinates directly for known merchants
          console.log(`Using backend coordinates for known merchant: ${merchant.name}`, merchant.coordinates);
          return merchant;
        } else {
          // Use Location Intelligence Agent for unknown merchants
          try {
            const stableCoordinates = await locationAgentRef.current!.resolveMerchantLocation(
              merchant.id,
              merchant.name,
              merchant.address,
              merchant.coordinates // Pass existing coordinates for accuracy check
            );
            
            return {
              ...merchant,
              coordinates: stableCoordinates
            };
          } catch (error) {
            console.warn(`Failed to resolve location for ${merchant.name}:`, error);
            return merchant; // Use original coordinates as fallback
          }
        }
      })
    );

    // Create markers for each merchant
    processedMerchants.forEach((merchant) => {
      if (merchant.coordinates.lat && merchant.coordinates.lng) {
        console.log(`Creating marker for ${merchant.name} at:`, merchant.coordinates, `Pricing: ${merchant.pricingLevel}`);
        const el = document.createElement('div');
        el.className = 'merchant-marker';
        
        // Get pricing level colors
        const colors = pricingLevelColors[merchant.pricingLevel];
        
        el.style.cssText = `
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${colors.background};
          border: 3px solid white;
          box-shadow: ${colors.glow}, 0 4px 12px rgba(0,0,0,0.15);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: box-shadow 0.3s ease, border 0.3s ease;
          position: relative;
          transform: translate(-50%, -50%);
          transform-origin: center;
        `;

        // Add category icon (using Lucide React icon)
        const IconComponent = getCategoryIcon(merchant.category);
        const iconElement = document.createElement('div');
        iconElement.style.cssText = `
          color: white;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        
        // Create a simple SVG icon based on category
        const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        iconSvg.setAttribute('width', '12');
        iconSvg.setAttribute('height', '12');
        iconSvg.setAttribute('viewBox', '0 0 24 24');
        iconSvg.setAttribute('fill', 'none');
        iconSvg.setAttribute('stroke', 'currentColor');
        iconSvg.setAttribute('stroke-width', '2');
        iconSvg.setAttribute('stroke-linecap', 'round');
        iconSvg.setAttribute('stroke-linejoin', 'round');
        
        // Add appropriate path based on category
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        if (merchant.category === 'Food & Dining') {
          path.setAttribute('d', 'M3 2v7c0 1.1.9 2 2 2h4v2H5c-1.1 0-2 .9-2 2v3h18v-3c0-1.1-.9-2-2-2h-4v-2h4c1.1 0 2-.9 2-2V2H3z');
        } else if (merchant.category === 'Shopping') {
          path.setAttribute('d', 'M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01');
        } else if (merchant.category === 'Transportation') {
          path.setAttribute('d', 'M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16.5 10 14 10s-4.7.6-6.5 1.1C6.7 11.3 6 12.1 6 13v3c0 .6.4 1 1 1h2m-3-4h.01M9 17h.01M15 17h.01M21 17h.01');
        } else {
          // Default dollar sign icon
          path.setAttribute('d', 'M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6');
        }
        
        iconSvg.appendChild(path);
        iconElement.appendChild(iconSvg);
        el.appendChild(iconElement);

        // Add hover effect with enhanced glow (without scaling to prevent darting)
        el.addEventListener('mouseenter', () => {
          // Don't scale the marker to prevent darting
          el.style.zIndex = '1000';
          // Enhance glow on hover
          const enhancedGlow = colors.glow.replace(/0\.6/g, '0.8').replace(/0\.4/g, '0.6').replace(/0\.2/g, '0.4');
          el.style.boxShadow = `${enhancedGlow}, 0 6px 20px rgba(0,0,0,0.25)`;
          // Add a subtle border effect instead of scaling
          el.style.border = `4px solid ${colors.border}`;
          el.style.borderWidth = '4px';
        });

        el.addEventListener('mouseleave', () => {
          el.style.zIndex = '1';
          // Restore original glow
          el.style.boxShadow = `${colors.glow}, 0 4px 12px rgba(0,0,0,0.15)`;
          // Restore original border
          el.style.border = '3px solid white';
          el.style.borderWidth = '3px';
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat([merchant.coordinates.lng, merchant.coordinates.lat])
          .addTo(map);
        
        console.log(`Marker added for ${merchant.name} at [${merchant.coordinates.lng}, ${merchant.coordinates.lat}]`);

        // Add click handler
        el.addEventListener('click', () => {
          handleMerchantClick(merchant);
          
          // Close ALL existing popups on the map first
          const existingPopups = document.querySelectorAll('.mapboxgl-popup');
          existingPopups.forEach(popup => {
            popup.remove();
          });
          
          // Also close any tracked popup
          if (currentPopup) {
            currentPopup.remove();
            setCurrentPopup(null);
          }
          
          // Create new popup
          const pricingColor = colors.border;
          const pricingText = merchant.pricingLevel.charAt(0).toUpperCase() + merchant.pricingLevel.slice(1);
          
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: true,
            closeOnClick: false,
            className: 'merchant-popup'
          }).setHTML(`
            <div class="p-3">
              <h3 class="font-semibold text-lg">${merchant.name}</h3>
              <p class="text-sm text-gray-600 mb-2">${merchant.address}</p>
              <div class="flex items-center gap-2 mb-2">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${merchant.category}</span>
                <span class="px-2 py-1 text-xs rounded-full" style="background-color: ${pricingColor}20; color: ${pricingColor}; border: 1px solid ${pricingColor}40;">
                  ${pricingText} Pricing
                </span>
              </div>
              <div class="text-sm space-y-1">
                <div class="flex justify-between">
                  <span>Total Spent:</span>
                  <span class="font-medium">$${merchant.totalSpent.toFixed(2)}</span>
                </div>
                <div class="flex justify-between">
                  <span>Average per Visit:</span>
                  <span class="font-medium">$${merchant.averageSpent.toFixed(2)}</span>
                </div>
                <div class="flex justify-between">
                  <span>Visits:</span>
                  <span class="font-medium">${merchant.visits}</span>
                </div>
              </div>
            </div>
          `);

          marker.setPopup(popup);
          setCurrentPopup(popup);
        });

        newMarkers.push(marker);
      }
    });

    setMarkers(newMarkers);

    // Update location intelligence stats
    if (locationAgentRef.current) {
      const intelligence = locationAgentRef.current.getLocationIntelligence();
      setLocationIntelligence(intelligence);
    }
  };

  const loadMapData = async () => {
    try {
      setIsLoading(true);
      
      const merchantsResponse = await apiClient.getMapMerchants(period);

      if (merchantsResponse.success) {
        const merchantsData = merchantsResponse.data as MapMerchant[];
        console.log('Loaded merchants from backend:', merchantsData);
        setMerchants(merchantsData);
        if (merchantsData.length > 0 && !selectedMerchant) {
          setSelectedMerchant(merchantsData[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load map data:', error);
      toast.error('Failed to load map data', {
        description: 'Please try again later',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadMapData();
    toast.success('Map data refreshed!', {
      description: 'Updated with latest spending information',
      duration: 3000,
    });
  };

  const handleZoomIn = () => {
    if (map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.zoomOut();
    }
  };

  const handleResetNorth = () => {
    if (map) {
      map.easeTo({ bearing: 0, pitch: 0 });
    }
  };

  const handleMerchantClick = (merchant: MapMerchant) => {
    setSelectedMerchant(merchant);
    setIsNavigating(true);
    
    // Navigate to merchant location on map
    if (map && merchant.coordinates.lat && merchant.coordinates.lng) {
      map.easeTo({
        center: [merchant.coordinates.lng, merchant.coordinates.lat],
        zoom: 15, // Zoom in closer to show the merchant location
        duration: 1000 // Smooth animation over 1 second
      });

      // Reset navigation state after animation completes
      setTimeout(() => {
        setIsNavigating(false);
      }, 1100);
    } else {
      setIsNavigating(false);
    }

    // Scroll to the selected merchant in the sidebar
    setTimeout(() => {
      const selectedElement = document.querySelector(`[data-merchant-id="${merchant.id}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  };

  const filteredMerchants = merchants.filter(merchant =>
    // Filter out merchants with placeholder addresses
    merchant.address !== 'Address to be geocoded' &&
    merchant.address !== 'Address not available' &&
    // Apply search filter
    (merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    merchant.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || DollarSign;
  };

  return (
    <div className="h-full min-h-screen space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Geographic Spending
          </h1>
          <p className="text-muted-foreground text-sm">
            Visualize your spending patterns across locations and discover insights
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search merchants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-48 lg:w-64 h-9"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-9"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 h-[calc(100vh-200px)]">
        {/* Map Container */}
        <div className="lg:col-span-3 order-1 lg:order-1">
          <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-0 h-full relative">
              {/* Map Controls */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetNorth}
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>

              {/* Map Visualization */}
              {!isMapboxConfigured ? (
                <div className="h-full w-full rounded-xl bg-muted/20 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <MapPin className="w-16 h-16 text-muted-foreground mx-auto" />
                    <h3 className="text-lg font-semibold">Mapbox Not Configured</h3>
                    <p className="text-muted-foreground text-sm">
                      Please configure your Mapbox token in Settings to view the map
                    </p>
                    <Button asChild>
                      <a href="/settings">Go to Settings</a>
                    </Button>
                  </div>
                </div>
              ) : mapboxLoading ? (
                <div className="h-full w-full rounded-xl bg-muted/20 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto animate-spin" />
                    <h3 className="text-lg font-semibold">Loading Map...</h3>
                    <p className="text-muted-foreground text-sm">
                      Initializing Mapbox integration
                    </p>
                  </div>
                </div>
              ) : (
                <div 
                  ref={mapContainer} 
                  className="h-full w-full rounded-xl"
                  style={{ minHeight: '400px' }}
                />
              )}

              {/* Location Intelligence Status */}
              {locationIntelligence && (
                <div className="absolute bottom-4 left-4 z-10">
                  <Card className="border-l-4 border-l-purple-500 bg-purple-50/90 backdrop-blur-sm">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <div className="text-sm">
                          <div className="font-medium">Location Intelligence Active</div>
                          <div className="text-xs text-muted-foreground">
                            {locationIntelligence.verifiedLocations}/{locationIntelligence.totalLocations} verified
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Navigation Indicator */}
              {isNavigating && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                  <Card className="bg-blue-50/90 backdrop-blur-sm border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                        <span className="text-sm font-medium text-blue-800">Navigating to location...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Panel */}
        <div className="overflow-y-auto h-full order-2 lg:order-2">
          {selectedMerchant ? (
            /* Selected Merchant Details - Full View */
            <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {React.createElement(getCategoryIcon(selectedMerchant.category), { className: "w-5 h-5 text-primary" })}
                    </div>
                    <div>
                      <div className="text-lg font-semibold">Merchant Details</div>
                      <div className="text-sm text-muted-foreground">Selected location</div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedMerchant(null);
                      // Close ALL popups on the map
                      const existingPopups = document.querySelectorAll('.mapboxgl-popup');
                      existingPopups.forEach(popup => {
                        popup.remove();
                      });
                      // Also close tracked popup
                      if (currentPopup) {
                        currentPopup.remove();
                        setCurrentPopup(null);
                      }
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pb-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedMerchant.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {selectedMerchant.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {React.createElement(getCategoryIcon(selectedMerchant.category), { className: "w-3 h-3" })}
                      {selectedMerchant.category}
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className="flex items-center gap-1"
                      style={{
                        backgroundColor: `${pricingLevelColors[selectedMerchant.pricingLevel].border}20`,
                        color: pricingLevelColors[selectedMerchant.pricingLevel].border,
                        borderColor: pricingLevelColors[selectedMerchant.pricingLevel].border
                      }}
                    >
                      {selectedMerchant.pricingLevel.charAt(0).toUpperCase() + selectedMerchant.pricingLevel.slice(1)} Pricing
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Total Spent:</span>
                  </div>
                  <span className="font-medium text-right">${selectedMerchant.totalSpent.toFixed(2)}</span>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Avg per Visit:</span>
                  </div>
                  <span className="font-medium text-right">${selectedMerchant.averageSpent.toFixed(2)}</span>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Visits:</span>
                  </div>
                  <span className="font-medium text-right">{selectedMerchant.visits}</span>
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleMerchantClick(selectedMerchant)}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Center on Map
                  </Button>
                  <Button variant="outline" className="w-full">View Transactions</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* All Merchants List - Default View */
            <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">All Merchants</div>
                    <div className="text-sm text-muted-foreground">Browse all spending locations</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-120px)] overflow-y-auto pr-2">
                {isLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : filteredMerchants.length > 0 ? (
                  <div className="space-y-3">
                    {filteredMerchants.map((merchant) => (
                      <div
                        key={merchant.id}
                        data-merchant-id={merchant.id}
                        className="p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md bg-muted/20 hover:bg-muted/50 border border-transparent"
                        onClick={() => handleMerchantClick(merchant)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {React.createElement(getCategoryIcon(merchant.category), { className: "w-5 h-5 text-muted-foreground" })}
                            <div>
                              <h4 className="font-semibold text-base">{merchant.name}</h4>
                              <p className="text-xs text-muted-foreground">{merchant.address}</p>
                            </div>
                          </div>
                          <span className="font-medium text-sm">${merchant.totalSpent.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm text-center p-4">No merchants found for the selected period or search query.</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
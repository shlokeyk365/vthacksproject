import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Search, 
  DollarSign,
  Coffee,
  ShoppingBag,
  Car,
  TrendingUp,
  Calendar,
  RefreshCw
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { LocationIntelligenceAgent } from "@/agents/LocationIntelligenceAgent";

interface MapMerchant {
  id: string;
  name: string;
  address: string;
  totalSpent: number;
  visits: number;
  category: string;
  coordinates: { lat: number; lng: number };
}

interface HeatmapData {
  lat: number;
  lng: number;
  intensity: number;
  amount: number;
}

const categoryIcons: { [key: string]: any } = {
  'Food & Dining': Coffee,
  'Shopping': ShoppingBag,
  'Transportation': Car,
  'Grocery': DollarSign,
  'Other': DollarSign,
  'Entertainment': TrendingUp,
  'Healthcare': MapPin,
};

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const locationAgentRef = useRef<LocationIntelligenceAgent | null>(null);
  
  const [merchants, setMerchants] = useState<MapMerchant[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<MapMerchant | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [period, setPeriod] = useState("30");
  const [isLoading, setIsLoading] = useState(true);
  const [locationIntelligence, setLocationIntelligence] = useState<any>(null);

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

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1Ijoic2hsb2tleWsiLCJhIjoiY21nMXV0dzMzMHNnNjJscHRjeWtramV0dSJ9.G_oGQ6qXclMTJz3T-BacPg';

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-80.4139, 37.2296], // Centered around Blacksburg, VA
      zoom: 12,
      attributionControl: false,
    });

    map.current.on('load', () => {
      // Add navigation control
      map.current!.addControl(new mapboxgl.NavigationControl(), 'top-right');
      // Initial load of data
      loadMapData();
    });

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Load map data
  useEffect(() => {
    loadMapData();
  }, [period]);

  // Render merchant markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    merchants.forEach(merchant => {
      if (merchant.coordinates && merchant.coordinates.lat && merchant.coordinates.lng) {
        const el = document.createElement('div');
        el.className = 'merchant-marker';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#3b82f6';
        el.style.border = '3px solid white';
        el.style.cursor = 'pointer';
        el.style.transition = 'all 0.2s ease-in-out';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
        el.style.position = 'relative';

        // Add confidence indicator (small dot)
        const confidenceDot = document.createElement('div');
        confidenceDot.style.position = 'absolute';
        confidenceDot.style.top = '-2px';
        confidenceDot.style.right = '-2px';
        confidenceDot.style.width = '12px';
        confidenceDot.style.height = '12px';
        confidenceDot.style.borderRadius = '50%';
        confidenceDot.style.backgroundColor = '#10b981'; // Green for verified
        confidenceDot.style.border = '2px solid white';
        confidenceDot.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
        el.appendChild(confidenceDot);

        // Add hover effect
        el.onmouseenter = () => {
          el.style.transform = 'scale(1.1)';
          el.style.opacity = '0.9';
        };
        el.onmouseleave = () => {
          el.style.transform = 'scale(1)';
          el.style.opacity = '1';
        };

        const marker = new mapboxgl.Marker(el)
          .setLngLat([merchant.coordinates.lng, merchant.coordinates.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-semibold text-base">${merchant.name}</h3>
                <p class="text-sm text-muted-foreground">${merchant.address}</p>
                <div class="mt-2 space-y-1">
                  <p class="text-xs text-muted-foreground">💰 Spent: $${merchant.totalSpent.toFixed(2)}</p>
                  <p class="text-xs text-muted-foreground">📍 Visits: ${merchant.visits}</p>
                  <p class="text-xs text-green-600">🤖 AI-Verified Location</p>
                </div>
              </div>
            `))
          .addTo(map.current!);

        el.addEventListener('click', () => {
          setSelectedMerchant(merchant);
          map.current!.flyTo({ center: [merchant.coordinates.lng, merchant.coordinates.lat], zoom: 14 });
        });

        markers.current.push(marker);
      }
    });
  }, [merchants]);

  const loadMapData = async () => {
    try {
      setIsLoading(true);
      
      const [merchantsResponse, heatmapResponse] = await Promise.all([
        apiClient.getMapMerchants(period),
        apiClient.getHeatmapData(period)
      ]);

      if (merchantsResponse.success) {
        const merchantsData = merchantsResponse.data as MapMerchant[];
        
        // 🤖 AGENTIC AI WORKFLOW: Use Location Intelligence Agent to geocode addresses
        const merchantsWithAccurateLocations = await Promise.all(
          merchantsData.map(async (merchant) => {
            try {
              if (locationAgentRef.current) {
                const accurateCoordinates = await locationAgentRef.current.resolveMerchantLocation(
                  merchant.id,
                  merchant.name,
                  merchant.address
                );
                
                return {
                  ...merchant,
                  coordinates: accurateCoordinates
                };
              }
              return merchant;
            } catch (error) {
              console.warn(`Failed to geocode ${merchant.name}:`, error);
              return merchant; // Fallback to original coordinates
            }
          })
        );

        setMerchants(merchantsWithAccurateLocations);
        if (merchantsWithAccurateLocations.length > 0 && !selectedMerchant) {
          setSelectedMerchant(merchantsWithAccurateLocations[0]);
        }

        // Update location intelligence stats
        if (locationAgentRef.current) {
          const intelligence = locationAgentRef.current.getLocationIntelligence();
          setLocationIntelligence(intelligence);
        }
      }

      if (heatmapResponse.success) {
        const heatmapData = heatmapResponse.data as HeatmapData[];
        setHeatmapData(heatmapData);
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

  const filteredMerchants = merchants.filter(merchant =>
    merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    merchant.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || DollarSign;
  };

  return (
    <motion.div
      className="h-full min-h-screen space-y-6 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 min-h-[600px]">
        {/* Map Container */}
        <div className="lg:col-span-3 order-1 lg:order-1">
          <Card className="h-full min-h-[400px] lg:min-h-[500px] border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-0 h-full">
              {/* Map Visualization */}
              <div ref={mapContainer} className="h-full w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-4 lg:space-y-6 overflow-y-auto max-h-[400px] lg:max-h-[600px] order-2 lg:order-2">
          {/* Location Intelligence Agent Status Widget */}
          {locationIntelligence && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">Location Intelligence Agent</div>
                      <div className="text-sm text-muted-foreground">AI-powered geocoding active</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-muted-foreground">Verified:</span>
                    </div>
                    <span className="font-medium text-right">{locationIntelligence.verifiedLocations}/{locationIntelligence.totalLocations}</span>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-muted-foreground">Confidence:</span>
                    </div>
                    <span className="font-medium text-right">{locationIntelligence.averageConfidence}%</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    🤖 Agentic AI is continuously learning and verifying merchant locations for accuracy
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Selected Merchant Details */}
          {selectedMerchant && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      {React.createElement(getCategoryIcon(selectedMerchant.category), { className: "w-5 h-5 text-primary" })}
                    </div>
                    <div>
                      <div className="text-lg font-semibold">Merchant Details</div>
                      <div className="text-sm text-muted-foreground">Selected location</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedMerchant.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {selectedMerchant.address}
                      </p>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      {React.createElement(getCategoryIcon(selectedMerchant.category), { className: "w-3 h-3" })}
                      {selectedMerchant.category}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Total Spent:</span>
                    </div>
                    <span className="font-medium text-right">${selectedMerchant.totalSpent.toFixed(2)}</span>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Visits:</span>
                    </div>
                    <span className="font-medium text-right">{selectedMerchant.visits}</span>
                  </div>
                  <Button variant="outline" className="w-full">View Transactions</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* All Merchants List */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
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
            <CardContent className="max-h-96 overflow-y-auto pr-2">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredMerchants.length > 0 ? (
                <div className="space-y-3">
                  {filteredMerchants.map((merchant) => (
                    <motion.div
                      key={merchant.id}
                      className={`p-3 lg:p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedMerchant?.id === merchant.id
                          ? 'bg-primary/10 border border-primary/20 shadow-md'
                          : 'bg-muted/20 hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setSelectedMerchant(merchant);
                        if (map.current) {
                          map.current.flyTo({ center: [merchant.coordinates.lng, merchant.coordinates.lat], zoom: 14 });
                        }
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
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
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center p-4">No merchants found for the selected period or search query.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
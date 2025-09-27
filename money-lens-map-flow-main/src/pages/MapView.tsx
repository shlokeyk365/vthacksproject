import { useState, useEffect } from "react";
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
  Layers, 
  ZoomIn, 
  ZoomOut,
  Navigation,
  DollarSign,
  Coffee,
  ShoppingBag,
  Car,
  TrendingUp,
  Calendar,
  Filter,
  RefreshCw
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";

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
  'Entertainment': TrendingUp,
  'Healthcare': MapPin,
  'Other': DollarSign
};

export default function MapView() {
  const [merchants, setMerchants] = useState<MapMerchant[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<MapMerchant | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showMerchantPins, setShowMerchantPins] = useState(true);
  const [period, setPeriod] = useState("30");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load map data
  useEffect(() => {
    loadMapData();
  }, [period]);

  const loadMapData = async () => {
    try {
      setIsLoading(true);
      
      const [merchantsResponse, heatmapResponse] = await Promise.all([
        apiClient.getMapMerchants(period),
        apiClient.getHeatmapData(period)
      ]);

      if (merchantsResponse.success) {
        const merchantsData = merchantsResponse.data as MapMerchant[];
        setMerchants(merchantsData);
        if (merchantsData.length > 0 && !selectedMerchant) {
          setSelectedMerchant(merchantsData[0]);
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
    setIsRefreshing(true);
    await loadMapData();
    setIsRefreshing(false);
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
      className="h-full space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Geographic Spending</h1>
          <p className="text-muted-foreground">
            Visualize your spending patterns across locations
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search merchants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        {/* Map Container */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              {/* Map Visualization */}
              <div className="h-full bg-gradient-to-br from-primary/5 to-success/5 rounded-lg relative overflow-hidden">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
                      <h3 className="text-lg font-semibold mb-2">Loading Map Data</h3>
                      <p className="text-muted-foreground">
                        Fetching your spending locations...
                      </p>
                    </div>
                  </div>
                ) : merchants.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Location Data</h3>
                      <p className="text-muted-foreground mb-4">
                        No transactions with location data found for the selected period.
                      </p>
                      <Button onClick={handleRefresh}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Data
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Map Grid Visualization */}
                    <div className="absolute inset-0 p-4">
                      <div className="grid grid-cols-8 grid-rows-6 gap-2 h-full">
                        {Array.from({ length: 48 }).map((_, index) => {
                          const merchant = merchants[index % merchants.length];
                          const heatmapPoint = heatmapData[index % heatmapData.length];
                          const intensity = heatmapPoint ? heatmapPoint.intensity : 0;
                          const isSelected = selectedMerchant?.id === merchant.id;
                          
                          return (
                            <div
                              key={index}
                              className={`relative rounded-lg cursor-pointer transition-all hover:scale-105 ${
                                showHeatmap 
                                  ? `bg-gradient-to-br from-success/20 via-warning/30 to-danger/40 opacity-${Math.floor(intensity * 100)}`
                                  : 'bg-muted/20 hover:bg-muted/30'
                              } ${isSelected ? 'ring-2 ring-primary ring-opacity-50' : ''}`}
                              onClick={() => setSelectedMerchant(merchant)}
                              title={`${merchant.name} - $${merchant.totalSpent.toFixed(2)}`}
                            >
                              {showMerchantPins && (
                                <div className="absolute top-1 left-1">
                                  <div className={`w-3 h-3 rounded-full ${
                                    merchant.category === 'Food & Dining' ? 'bg-orange-500' :
                                    merchant.category === 'Shopping' ? 'bg-blue-500' :
                                    merchant.category === 'Transportation' ? 'bg-green-500' :
                                    'bg-purple-500'
                                  }`} />
                                </div>
                              )}
                              
                              {isSelected && (
                                <div className="absolute inset-0 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <div className="text-xs font-semibold text-primary">
                                    ${merchant.totalSpent.toFixed(0)}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Map Controls */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Navigation className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
                      <h4 className="font-semibold mb-2">Spending Intensity</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex gap-1">
                          <div className="w-4 h-4 bg-success/30 rounded"></div>
                          <div className="w-4 h-4 bg-warning/50 rounded"></div>
                          <div className="w-4 h-4 bg-danger/70 rounded"></div>
                        </div>
                        <span className="text-muted-foreground">Low → High</span>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {merchants.length} merchants • {heatmapData.length} locations
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-4 overflow-y-auto">
          {/* Selected Merchant Details */}
          {selectedMerchant && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const IconComponent = getCategoryIcon(selectedMerchant.category);
                    return <IconComponent className="w-5 h-5" />;
                  })()}
                  Merchant Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold">{selectedMerchant.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedMerchant.address}
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Spent</span>
                    <span className="font-semibold text-primary">
                      ${selectedMerchant.totalSpent.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Visits</span>
                    <Badge variant="secondary">{selectedMerchant.visits}</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Category</span>
                    <Badge variant="outline">{selectedMerchant.category}</Badge>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm">Avg per Visit</span>
                    <span className="font-medium">
                      ${(selectedMerchant.totalSpent / selectedMerchant.visits).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <Button className="w-full" variant="outline">
                  Set Spending Cap
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Merchant List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Top Merchants
                <Badge variant="outline">{filteredMerchants.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredMerchants.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'No merchants match your search' : 'No merchants found'}
                    </p>
                  </div>
                ) : (
                  filteredMerchants.map((merchant) => {
                    const IconComponent = getCategoryIcon(merchant.category);
                    return (
                      <div
                        key={merchant.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedMerchant?.id === merchant.id
                            ? 'bg-primary/10 border border-primary/20'
                            : 'bg-muted/20 hover:bg-muted/30'
                        }`}
                        onClick={() => setSelectedMerchant(merchant)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {merchant.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ${merchant.totalSpent.toFixed(2)} • {merchant.visits} visits
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Map Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Map Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Spending Heatmap</span>
                <Button
                  variant={showHeatmap ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowHeatmap(!showHeatmap)}
                >
                  {showHeatmap ? "On" : "Off"}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Merchant Pins</span>
                <Button 
                  variant={showMerchantPins ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowMerchantPins(!showMerchantPins)}
                >
                  {showMerchantPins ? "On" : "Off"}
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Category Legend</div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span>Food & Dining</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Shopping</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Transportation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>Other</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
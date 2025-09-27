import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
  RefreshCw,
  Plus
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
  
  // Transaction simulator state
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatorForm, setSimulatorForm] = useState({
    merchant: '',
    amount: '',
    category: 'Food & Dining',
    location: '',
    latitude: '',
    longitude: ''
  });

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

  // Handle transaction simulation
  const handleSimulateTransaction = async () => {
    if (!simulatorForm.merchant || !simulatorForm.amount) {
      toast.error('Please fill in merchant and amount', {
        description: 'These fields are required',
        duration: 4000,
      });
      return;
    }

    setIsSimulating(true);

    try {
      const transactionData = {
        merchant: simulatorForm.merchant,
        amount: parseFloat(simulatorForm.amount),
        category: simulatorForm.category,
        location: simulatorForm.location || undefined,
        latitude: simulatorForm.latitude ? parseFloat(simulatorForm.latitude) : undefined,
        longitude: simulatorForm.longitude ? parseFloat(simulatorForm.longitude) : undefined
      };

      const response = await apiClient.simulateTransaction(transactionData);

      if (response.success) {
        const responseData = response.data as any;
        toast.success('Transaction simulated successfully!', {
          description: responseData.wouldBeApproved ? 'This transaction would be approved' : 'This transaction would violate spending caps',
          duration: 5000,
        });

        // Reset form
        setSimulatorForm({
          merchant: '',
          amount: '',
          category: 'Food & Dining',
          location: '',
          latitude: '',
          longitude: ''
        });
        setIsSimulatorOpen(false);

        // Refresh map data to show new transaction
        await loadMapData();
      } else {
        toast.error('Failed to simulate transaction', {
          description: response.message || 'Please try again',
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error('Transaction simulation error:', error);
      toast.error('Failed to simulate transaction', {
        description: error.message || 'Please try again',
        duration: 5000,
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <motion.div
      className="h-full space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Geographic Spending
          </h1>
          <p className="text-muted-foreground text-sm">
            Visualize your spending patterns across locations and discover insights
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-36 h-9">
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
              className="pl-10 w-64 h-9"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-9"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Dialog open={isSimulatorOpen} onOpenChange={setIsSimulatorOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg">Add New Transaction</DialogTitle>
                    <p className="text-sm text-muted-foreground">Simulate a transaction with location data</p>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="merchant" className="text-sm font-medium flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Merchant *
                    </Label>
                    <Input
                      id="merchant"
                      placeholder="e.g., Starbucks Coffee"
                      value={simulatorForm.merchant}
                      onChange={(e) => setSimulatorForm(prev => ({ ...prev, merchant: e.target.value }))}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Amount *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={simulatorForm.amount}
                      onChange={(e) => setSimulatorForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Category
                  </Label>
                  <Select value={simulatorForm.category} onValueChange={(value) => setSimulatorForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food & Dining">
                        <div className="flex items-center gap-2">
                          <Coffee className="w-4 h-4" />
                          Food & Dining
                        </div>
                      </SelectItem>
                      <SelectItem value="Shopping">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4" />
                          Shopping
                        </div>
                      </SelectItem>
                      <SelectItem value="Transportation">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4" />
                          Transportation
                        </div>
                      </SelectItem>
                      <SelectItem value="Entertainment">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Entertainment
                        </div>
                      </SelectItem>
                      <SelectItem value="Healthcare">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Healthcare
                        </div>
                      </SelectItem>
                      <SelectItem value="Other">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          Other
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location (optional)
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Main St, Blacksburg"
                    value={simulatorForm.location}
                    onChange={(e) => setSimulatorForm(prev => ({ ...prev, location: e.target.value }))}
                    className="h-10"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Coordinates (optional)
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="latitude" className="text-xs text-muted-foreground">
                        Latitude
                      </Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.0001"
                        placeholder="37.2296"
                        value={simulatorForm.latitude}
                        onChange={(e) => setSimulatorForm(prev => ({ ...prev, latitude: e.target.value }))}
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude" className="text-xs text-muted-foreground">
                        Longitude
                      </Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.0001"
                        placeholder="-80.4139"
                        value={simulatorForm.longitude}
                        onChange={(e) => setSimulatorForm(prev => ({ ...prev, longitude: e.target.value }))}
                        className="h-9"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Include coordinates to see this transaction on the map visualization
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleSimulateTransaction}
                    disabled={isSimulating}
                    className="flex-1 h-10 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                  >
                    {isSimulating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Simulating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Transaction
                      </div>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsSimulatorOpen(false)}
                    disabled={isSimulating}
                    className="h-10"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        {/* Map Container */}
        <div className="lg:col-span-3">
          <Card className="h-full border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-0 h-full">
              {/* Map Visualization */}
              <div className="h-full bg-gradient-to-br from-primary/5 via-background to-success/5 rounded-lg relative overflow-hidden">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
                        <MapPin className="w-6 h-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">Loading Map Data</h3>
                        <p className="text-muted-foreground text-sm">
                          Fetching your spending locations...
                        </p>
                      </div>
                    </div>
                  </div>
                ) : merchants.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-6 max-w-md mx-auto px-6">
                      <div className="relative">
                        <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto">
                          <MapPin className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-warning/20 rounded-full flex items-center justify-center">
                          <span className="text-xs text-warning">!</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-xl font-semibold text-foreground">No Location Data Found</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          No transactions with location data found for the selected period. 
                          Try adding a transaction with location information or adjust your time range.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Refresh Data
                        </Button>
                        <Button onClick={() => setIsSimulatorOpen(true)} className="flex items-center gap-2">
                          <Plus className="w-4 h-4" />
                          Add Transaction
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Map Grid Visualization */}
                    <div className="absolute inset-0 p-6">
                      <div className="grid grid-cols-8 grid-rows-6 gap-3 h-full">
                        {Array.from({ length: 48 }).map((_, index) => {
                          const merchant = merchants[index % merchants.length];
                          const heatmapPoint = heatmapData[index % heatmapData.length];
                          const intensity = heatmapPoint ? heatmapPoint.intensity : 0;
                          const isSelected = selectedMerchant?.id === merchant.id;
                          
                          return (
                            <motion.div
                              key={index}
                              className={`relative rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                                showHeatmap 
                                  ? `bg-gradient-to-br from-success/20 via-warning/30 to-danger/40 opacity-${Math.floor(intensity * 100)}`
                                  : 'bg-muted/20 hover:bg-muted/30'
                              } ${isSelected ? 'ring-2 ring-primary ring-opacity-60 shadow-lg scale-105' : ''}`}
                              onClick={() => setSelectedMerchant(merchant)}
                              title={`${merchant.name} - $${merchant.totalSpent.toFixed(2)}`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.01 }}
                            >
                              {showMerchantPins && (
                                <div className="absolute top-2 left-2">
                                  <div className={`w-4 h-4 rounded-full shadow-sm ${
                                    merchant.category === 'Food & Dining' ? 'bg-orange-500' :
                                    merchant.category === 'Shopping' ? 'bg-blue-500' :
                                    merchant.category === 'Transportation' ? 'bg-green-500' :
                                    merchant.category === 'Healthcare' ? 'bg-red-500' :
                                    merchant.category === 'Entertainment' ? 'bg-purple-500' :
                                    'bg-gray-500'
                                  }`} />
                                </div>
                              )}
                              
                              {isSelected && (
                                <motion.div 
                                  className="absolute inset-0 bg-primary/10 rounded-xl flex items-center justify-center backdrop-blur-sm"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <div className="text-xs font-bold text-primary bg-background/80 px-2 py-1 rounded-lg">
                                    ${merchant.totalSpent.toFixed(0)}
                                  </div>
                                </motion.div>
                              )}

                              {/* Hover effect */}
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Map Controls */}
                    <div className="absolute top-6 right-6 flex flex-col gap-3">
                      <div className="bg-background/80 backdrop-blur-sm rounded-lg p-2 shadow-lg border">
                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <ZoomIn className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <ZoomOut className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <Navigation className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Legend */}
                    <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border max-w-xs">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <h4 className="font-semibold text-sm">Spending Intensity</h4>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex gap-1">
                            <div className="w-3 h-3 bg-success/40 rounded"></div>
                            <div className="w-3 h-3 bg-warning/60 rounded"></div>
                            <div className="w-3 h-3 bg-danger/80 rounded"></div>
                          </div>
                          <span className="text-muted-foreground">Low → High</span>
                        </div>
                        <div className="pt-2 border-t border-border/50">
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div className="flex justify-between">
                              <span>Merchants:</span>
                              <span className="font-medium text-foreground">{merchants.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Locations:</span>
                              <span className="font-medium text-foreground">{heatmapData.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Spent:</span>
                              <span className="font-medium text-primary">
                                ${merchants.reduce((sum, m) => sum + m.totalSpent, 0).toFixed(0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
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
                      {(() => {
                        const IconComponent = getCategoryIcon(selectedMerchant.category);
                        return <IconComponent className="w-5 h-5 text-primary" />;
                      })()}
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
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          ${selectedMerchant.totalSpent.toFixed(0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Total Spent</div>
                      </div>
                      <div className="text-center p-3 bg-success/5 rounded-lg">
                        <div className="text-2xl font-bold text-success">
                          {selectedMerchant.visits}
                        </div>
                        <div className="text-xs text-muted-foreground">Visits</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Category</span>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {(() => {
                            const IconComponent = getCategoryIcon(selectedMerchant.category);
                            return <IconComponent className="w-3 h-3" />;
                          })()}
                          {selectedMerchant.category}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Avg per Visit</span>
                        <span className="font-semibold text-foreground">
                          ${(selectedMerchant.totalSpent / selectedMerchant.visits).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <Button className="w-full h-10" variant="outline">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Set Spending Cap
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {/* Merchant List */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <span>Top Merchants</span>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  {filteredMerchants.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredMerchants.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'No merchants match your search' : 'No merchants found'}
                    </p>
                    {searchQuery && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3"
                        onClick={() => setSearchQuery('')}
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredMerchants.map((merchant, index) => {
                    const IconComponent = getCategoryIcon(merchant.category);
                    return (
                      <motion.div
                        key={merchant.id}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedMerchant?.id === merchant.id
                            ? 'bg-primary/10 border border-primary/20 shadow-md'
                            : 'bg-muted/20 hover:bg-muted/30'
                        }`}
                        onClick={() => setSelectedMerchant(merchant)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">
                              {merchant.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-primary font-medium">
                                ${merchant.totalSpent.toFixed(2)}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                {merchant.visits} visits
                              </span>
                            </div>
                          </div>
                          {selectedMerchant?.id === merchant.id && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Map Controls */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Map Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-success/40 to-danger/80 rounded-full"></div>
                    <span className="text-sm font-medium">Spending Heatmap</span>
                  </div>
                  <Button
                    variant={showHeatmap ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowHeatmap(!showHeatmap)}
                    className="h-8"
                  >
                    {showHeatmap ? "On" : "Off"}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium">Merchant Pins</span>
                  </div>
                  <Button 
                    variant={showMerchantPins ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowMerchantPins(!showMerchantPins)}
                    className="h-8"
                  >
                    {showMerchantPins ? "On" : "Off"}
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <div className="text-sm font-medium flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Category Legend
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
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
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Healthcare</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span>Entertainment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
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
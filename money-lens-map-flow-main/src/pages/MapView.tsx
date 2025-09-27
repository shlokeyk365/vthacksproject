import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Car
} from "lucide-react";

const mockMerchants = [
  {
    id: "1",
    name: "Starbucks Coffee",
    address: "123 Main St, Blacksburg, VA",
    totalSpent: 247.85,
    visits: 12,
    category: "Food & Dining",
    icon: Coffee,
    coordinates: { lat: 37.2296, lng: -80.4139 }
  },
  {
    id: "2",
    name: "Target",
    address: "456 University Blvd, Blacksburg, VA",
    totalSpent: 892.45,
    visits: 8,
    category: "Shopping",
    icon: ShoppingBag,
    coordinates: { lat: 37.2431, lng: -80.4242 }
  },
  {
    id: "3",
    name: "Shell Gas Station",
    address: "789 South Main St, Blacksburg, VA",
    totalSpent: 356.70,
    visits: 15,
    category: "Transportation",
    icon: Car,
    coordinates: { lat: 37.2176, lng: -80.4118 }
  },
];

export default function MapView() {
  const [selectedMerchant, setSelectedMerchant] = useState(mockMerchants[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHeatmap, setShowHeatmap] = useState(true);

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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <Button variant="outline" size="sm">
            <Layers className="w-4 h-4 mr-2" />
            Layers
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
        {/* Map Container */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              {/* Map Placeholder - In real implementation, this would be Mapbox */}
              <div className="h-full bg-gradient-to-br from-primary/5 to-success/5 rounded-lg relative overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect your Mapbox token to view geographic spending data
                  </p>
                  <Button>
                    Configure Map Integration
                  </Button>
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
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Panel */}
        <div className="space-y-4 overflow-y-auto">
          {/* Selected Merchant Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <selectedMerchant.icon className="w-5 h-5" />
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
          
          {/* Merchant List */}
          <Card>
            <CardHeader>
              <CardTitle>Top Merchants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMerchants.map((merchant) => {
                  const IconComponent = merchant.icon;
                  return (
                    <div
                      key={merchant.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedMerchant.id === merchant.id
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
                })}
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
                <Button variant="default" size="sm">
                  On
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Satellite View</span>
                <Button variant="outline" size="sm">
                  Off
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
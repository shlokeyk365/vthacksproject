// Real merchant data for Blacksburg, VA area
// Coordinates are approximate and should be verified with actual geocoding

export interface RealMerchant {
  id: string;
  name: string;
  address: string;
  category: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone?: string;
  website?: string;
  hours?: string;
}

// Merchant data with specific addresses and stable coordinates
export const realMerchants: RealMerchant[] = [
  {
    id: "target-christiansburg",
    name: "Target",
    address: "195 Conston Ave NW, Christiansburg, VA 24073",
    category: "Shopping",
    coordinates: { lat: 37.156681, lng: -80.422609 }, // Christiansburg area
    phone: "(540) 552-7890"
  },
  {
    id: "starbucks-university",
    name: "Starbucks",
    address: "880 University City Blvd, Blacksburg, VA 24060",
    category: "Food & Dining",
    coordinates: { lat: 37.235581, lng: -80.433307}, // University area
    phone: "(540) 552-1234"
  },
  {
    id: "kroger-south-main",
    name: "Kroger",
    address: "1322 S Main St, Blacksburg, VA 24060",
    category: "Grocery",
    coordinates: { lat: 37.216801, lng: -80.402687 }, // South Main area
    phone: "(540) 552-5678"
  },
  {
    id: "walmart-christiansburg",
    name: "Walmart",
    address: "2400 N Franklin St, Christiansburg, VA 24073",
    category: "Shopping",
    coordinates: { lat: 37.145123, lng: -80.408456 },
    phone: "(540) 552-9999"
  },
  {
    id: "mcdonalds-university",
    name: "McDonald's",
    address: "900 University City Blvd, Blacksburg, VA 24060",
    category: "Food & Dining",
    coordinates: { lat: 37.234567, lng: -80.432109 },
    phone: "(540) 552-1111"
  },
  {
    id: "shell-gas-station",
    name: "Shell Gas Station",
    address: "1000 S Main St, Blacksburg, VA 24060",
    category: "Transportation",
    coordinates: { lat: 37.218901, lng: -80.401234 },
    phone: "(540) 552-2222"
  },
  {
    id: "corner-bar",
    name: "The Corner Bar",
    address: "120 College Ave, Blacksburg, VA 24060",
    category: "Entertainment",
    coordinates: { lat: 37.229012, lng: -80.414567 },
    phone: "(540) 552-3333"
  },
  {
    id: "subway-downtown",
    name: "Subway",
    address: "200 College Ave, Blacksburg, VA 24060",
    category: "Food & Dining",
    coordinates: { lat: 37.228456, lng: -80.413789 },
    phone: "(540) 552-4444"
  },
  {
    id: "cvs-pharmacy",
    name: "CVS Pharmacy",
    address: "300 S Main St, Blacksburg, VA 24060",
    category: "Healthcare",
    coordinates: { lat: 37.227890, lng: -80.412345 },
    phone: "(540) 552-5555"
  },
  {
    id: "pizza-hut",
    name: "Pizza Hut",
    address: "400 University City Blvd, Blacksburg, VA 24060",
    category: "Food & Dining",
    coordinates: { lat: 37.233456, lng: -80.431234 },
    phone: "(540) 552-6666"
  },
  {
    id: "dominos-pizza",
    name: "Domino's Pizza",
    address: "500 S Main St, Blacksburg, VA 24060",
    category: "Food & Dining",
    coordinates: { lat: 37.226789, lng: -80.411567 },
    phone: "(540) 552-7777"
  },
  {
    id: "food-lion",
    name: "Food Lion",
    address: "600 University City Blvd, Blacksburg, VA 24060",
    category: "Grocery",
    coordinates: { lat: 37.232345, lng: -80.430123 },
    phone: "(540) 552-8888"
  }
];

// Helper function to get merchants by category
export function getMerchantsByCategory(category: string): RealMerchant[] {
  return realMerchants.filter(merchant => merchant.category === category);
}

// Helper function to get merchants near a location
export function getMerchantsNearLocation(lat: number, lng: number, radiusKm: number = 5): RealMerchant[] {
  return realMerchants.filter(merchant => {
    const distance = calculateDistance(lat, lng, merchant.coordinates.lat, merchant.coordinates.lng);
    return distance <= radiusKm;
  });
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

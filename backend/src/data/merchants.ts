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
    category: "Retail",
    coordinates: { lat: 37.156681, lng: -80.422609 }, // Christiansburg area
    phone: "(540) 552-7890"
  },
  {
    id: "starbucks-university",
    name: "Starbucks",
    address: "880 University City Blvd, Blacksburg, VA 24060",
    category: "Coffee & Tea",
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

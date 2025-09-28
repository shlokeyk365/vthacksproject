// Brand color mapping for authentic company colors
export const getBrandColor = (merchantName: string, category: string): string => {
  const merchant = merchantName.toLowerCase();
  
  // Specific merchant brand colors
  if (merchant.includes('amazon')) {
    return '#FF9900'; // Amazon orange
  }
  if (merchant.includes('starbucks') || merchant.includes('starbucks coffee')) {
    return '#00704A'; // Starbucks green
  }
  if (merchant.includes('mcdonald') || merchant.includes('mcdonalds')) {
    return '#FFC72C'; // McDonald's yellow
  }
  if (merchant.includes('shell')) {
    return '#FFD700'; // Shell yellow
  }
  if (merchant.includes('target')) {
    return '#3B82F6'; // Target blue (same as other merchants)
  }
  if (merchant.includes('walmart')) {
    return '#004C91'; // Walmart blue
  }
  if (merchant.includes('netflix')) {
    return '#E50914'; // Netflix red
  }
  if (merchant.includes('spotify')) {
    return '#1DB954'; // Spotify green
  }
  if (merchant.includes('apple') || merchant.includes('app store')) {
    return '#A6B1B7'; // Apple gray
  }
  if (merchant.includes('google') || merchant.includes('google play')) {
    return '#4285F4'; // Google blue
  }
  if (merchant.includes('uber')) {
    return '#000000'; // Uber black
  }
  if (merchant.includes('lyft')) {
    return '#FF00BF'; // Lyft pink
  }
  if (merchant.includes('kroger')) {
    return '#E31837'; // Kroger red
  }
  if (merchant.includes('chipotle')) {
    return '#702F8A'; // Chipotle purple
  }
  if (merchant.includes('subway')) {
    return '#489E3B'; // Subway green
  }
  if (merchant.includes('pizza hut')) {
    return '#FF6600'; // Pizza Hut orange
  }
  if (merchant.includes('domino')) {
    return '#E31837'; // Domino's red
  }
  if (merchant.includes('taco bell')) {
    return '#702F8A'; // Taco Bell purple
  }
  if (merchant.includes('kfc')) {
    return '#E31837'; // KFC red
  }
  if (merchant.includes('burger king')) {
    return '#FF6600'; // Burger King orange
  }
  if (merchant.includes('wendy')) {
    return '#E31837'; // Wendy's red
  }
  if (merchant.includes('dunkin') || merchant.includes('dunkin donuts')) {
    return '#FF6600'; // Dunkin' orange
  }
  if (merchant.includes('pepsi')) {
    return '#004B93'; // Pepsi blue
  }
  if (merchant.includes('coca-cola') || merchant.includes('coke')) {
    return '#FF0000'; // Coca-Cola red
  }
  if (merchant.includes('nike')) {
    return '#000000'; // Nike black
  }
  if (merchant.includes('adidas')) {
    return '#000000'; // Adidas black
  }
  if (merchant.includes('zara')) {
    return '#000000'; // Zara black
  }
  if (merchant.includes('h&m') || merchant.includes('hm')) {
    return '#E50010'; // H&M red
  }
  if (merchant.includes('gap')) {
    return '#0066CC'; // Gap blue
  }
  if (merchant.includes('old navy')) {
    return '#0066CC'; // Old Navy blue
  }
  if (merchant.includes('banana republic')) {
    return '#0066CC'; // Banana Republic blue
  }
  if (merchant.includes('j.crew') || merchant.includes('jcrew')) {
    return '#000000'; // J.Crew black
  }
  if (merchant.includes('uniqlo')) {
    return '#FF6600'; // Uniqlo orange
  }
  if (merchant.includes('forever 21')) {
    return '#FF6600'; // Forever 21 orange
  }
  if (merchant.includes('urban outfitters')) {
    return '#000000'; // Urban Outfitters black
  }
  if (merchant.includes('american eagle')) {
    return '#0066CC'; // American Eagle blue
  }
  if (merchant.includes('hollister')) {
    return '#0066CC'; // Hollister blue
  }
  if (merchant.includes('abercrombie')) {
    return '#000000'; // Abercrombie black
  }
  if (merchant.includes('pacsun')) {
    return '#FF6600'; // PacSun orange
  }
  if (merchant.includes('express')) {
    return '#000000'; // Express black
  }
  if (merchant.includes('zara')) {
    return '#000000'; // Zara black
  }
  if (merchant.includes('mango')) {
    return '#FF6600'; // Mango orange
  }
  if (merchant.includes('cos')) {
    return '#000000'; // COS black
  }
  if (merchant.includes('everlane')) {
    return '#000000'; // Everlane black
  }
  if (merchant.includes('allbirds')) {
    return '#000000'; // Allbirds black
  }
  if (merchant.includes('patagonia')) {
    return '#0066CC'; // Patagonia blue
  }
  if (merchant.includes('north face')) {
    return '#000000'; // North Face black
  }
  if (merchant.includes('columbia')) {
    return '#0066CC'; // Columbia blue
  }
  if (merchant.includes('under armour')) {
    return '#000000'; // Under Armour black
  }
  if (merchant.includes('lululemon')) {
    return '#000000'; // Lululemon black
  }
  if (merchant.includes('athleta')) {
    return '#0066CC'; // Athleta blue
  }
  if (merchant.includes('gap')) {
    return '#0066CC'; // Gap blue
  }
  if (merchant.includes('banana republic')) {
    return '#0066CC'; // Banana Republic blue
  }
  if (merchant.includes('old navy')) {
    return '#0066CC'; // Old Navy blue
  }
  if (merchant.includes('j.crew') || merchant.includes('jcrew')) {
    return '#000000'; // J.Crew black
  }
  if (merchant.includes('uniqlo')) {
    return '#FF6600'; // Uniqlo orange
  }
  if (merchant.includes('forever 21')) {
    return '#FF6600'; // Forever 21 orange
  }
  if (merchant.includes('urban outfitters')) {
    return '#000000'; // Urban Outfitters black
  }
  if (merchant.includes('american eagle')) {
    return '#0066CC'; // American Eagle blue
  }
  if (merchant.includes('hollister')) {
    return '#0066CC'; // Hollister blue
  }
  if (merchant.includes('abercrombie')) {
    return '#000000'; // Abercrombie black
  }
  if (merchant.includes('pacsun')) {
    return '#FF6600'; // PacSun orange
  }
  if (merchant.includes('express')) {
    return '#000000'; // Express black
  }
  if (merchant.includes('zara')) {
    return '#000000'; // Zara black
  }
  if (merchant.includes('mango')) {
    return '#FF6600'; // Mango orange
  }
  if (merchant.includes('cos')) {
    return '#000000'; // COS black
  }
  if (merchant.includes('everlane')) {
    return '#000000'; // Everlane black
  }
  if (merchant.includes('allbirds')) {
    return '#000000'; // Allbirds black
  }
  if (merchant.includes('patagonia')) {
    return '#0066CC'; // Patagonia blue
  }
  if (merchant.includes('north face')) {
    return '#000000'; // North Face black
  }
  if (merchant.includes('columbia')) {
    return '#0066CC'; // Columbia blue
  }
  if (merchant.includes('under armour')) {
    return '#000000'; // Under Armour black
  }
  if (merchant.includes('lululemon')) {
    return '#000000'; // Lululemon black
  }
  if (merchant.includes('athleta')) {
    return '#0066CC'; // Athleta blue
  }
  
  // Fallback to category-based colors
  switch (category.toLowerCase()) {
    case 'food & dining':
    case 'dining':
      return '#FF6B6B'; // Warm red for food
    case 'shopping':
      return '#4ECDC4'; // Teal for shopping
    case 'transportation':
    case 'transport':
      return '#45B7D1'; // Blue for transport
    case 'utilities':
      return '#96CEB4'; // Green for utilities
    case 'entertainment':
      return '#FFEAA7'; // Yellow for entertainment
    case 'healthcare':
      return '#DDA0DD'; // Purple for healthcare
    case 'education':
      return '#98D8C8'; // Mint for education
    case 'gaming':
      return '#F7DC6F'; // Light yellow for gaming
    case 'maintenance':
      return '#BB8FCE'; // Light purple for maintenance
    default:
      return '#95A5A6'; // Default gray
  }
};

// Category-based brand colors for general spending
export const getCategoryBrandColor = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'food & dining':
    case 'dining':
      return '#FF6B6B'; // Warm red for food
    case 'shopping':
      return '#4ECDC4'; // Teal for shopping
    case 'transportation':
    case 'transport':
      return '#45B7D1'; // Blue for transport
    case 'utilities':
      return '#96CEB4'; // Green for utilities
    case 'entertainment':
      return '#FFEAA7'; // Yellow for entertainment
    case 'healthcare':
      return '#DDA0DD'; // Purple for healthcare
    case 'education':
      return '#98D8C8'; // Mint for education
    case 'gaming':
      return '#F7DC6F'; // Light yellow for gaming
    case 'maintenance':
      return '#BB8FCE'; // Light purple for maintenance
    default:
      return '#95A5A6'; // Default gray
  }
};

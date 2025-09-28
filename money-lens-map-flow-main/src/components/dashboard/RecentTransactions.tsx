import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowUpRight, ArrowDownLeft, Coffee, ShoppingBag, Car, Home, Utensils, Play, Gamepad2, Wrench } from "lucide-react";
import { useTransactions } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";

// Merchant logo mapping for real app logos
const getMerchantLogo = (merchantName: string) => {
  const merchant = merchantName.toLowerCase();
  
  // Popular merchants with their brand colors and icons
  if (merchant.includes('netflix')) {
    return {
      icon: '🎬',
      bgColor: 'bg-red-500',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('starbucks') || merchant.includes('starbucks coffee')) {
    return {
      icon: '☕',
      bgColor: 'bg-green-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('amazon')) {
    return {
      icon: '📦',
      bgColor: 'bg-orange-500',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('mcdonald') || merchant.includes('mcdonalds')) {
    return {
      icon: '🍟',
      bgColor: 'bg-yellow-500',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('uber') || merchant.includes('lyft')) {
    return {
      icon: '🚗',
      bgColor: 'bg-black',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('spotify')) {
    return {
      icon: '🎵',
      bgColor: 'bg-green-500',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('apple') || merchant.includes('app store')) {
    return {
      icon: '🍎',
      bgColor: 'bg-gray-800',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('google') || merchant.includes('google play')) {
    return {
      icon: '🔍',
      bgColor: 'bg-blue-500',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('shell') || merchant.includes('gas')) {
    return {
      icon: '⛽',
      bgColor: 'bg-yellow-400',
      textColor: 'text-black'
    };
  }
  if (merchant.includes('target')) {
    return {
      icon: '🎯',
      bgColor: 'bg-red-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('walmart')) {
    return {
      icon: '🏪',
      bgColor: 'bg-blue-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('kroger')) {
    return {
      icon: '🛒',
      bgColor: 'bg-red-700',
      textColor: 'text-white'
    };
  }
  
  // Fast Food & Restaurants
  if (merchant.includes('taco bell') || merchant.includes('tacobell')) {
    return {
      icon: '🌮',
      bgColor: 'bg-purple-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('subway')) {
    return {
      icon: '🥪',
      bgColor: 'bg-green-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('kfc') || merchant.includes('kentucky fried chicken')) {
    return {
      icon: '🍗',
      bgColor: 'bg-red-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('pizza hut') || merchant.includes('pizzahut')) {
    return {
      icon: '🍕',
      bgColor: 'bg-red-500',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('domino') || merchant.includes('dominos')) {
    return {
      icon: '🍕',
      bgColor: 'bg-blue-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('chipotle')) {
    return {
      icon: '🌯',
      bgColor: 'bg-orange-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('panera') || merchant.includes('panera bread')) {
    return {
      icon: '🥖',
      bgColor: 'bg-yellow-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('chick-fil-a') || merchant.includes('chickfila')) {
    return {
      icon: '🐔',
      bgColor: 'bg-red-500',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('wendy')) {
    return {
      icon: '🍔',
      bgColor: 'bg-red-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('burger king') || merchant.includes('burgerking')) {
    return {
      icon: '👑',
      bgColor: 'bg-yellow-500',
      textColor: 'text-black'
    };
  }
  
  // Grocery Stores
  if (merchant.includes('whole foods') || merchant.includes('wholefoods')) {
    return {
      icon: '🥬',
      bgColor: 'bg-green-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('safeway')) {
    return {
      icon: '🛒',
      bgColor: 'bg-red-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('costco')) {
    return {
      icon: '🏪',
      bgColor: 'bg-red-500',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('trader joe') || merchant.includes('traderjoe')) {
    return {
      icon: '🛒',
      bgColor: 'bg-green-500',
      textColor: 'text-white'
    };
  }
  
  // Gas Stations
  if (merchant.includes('exxon') || merchant.includes('mobil')) {
    return {
      icon: '⛽',
      bgColor: 'bg-red-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('bp') || merchant.includes('british petroleum')) {
    return {
      icon: '⛽',
      bgColor: 'bg-green-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('chevron')) {
    return {
      icon: '⛽',
      bgColor: 'bg-blue-600',
      textColor: 'text-white'
    };
  }
  
  // Entertainment & Streaming
  if (merchant.includes('hulu')) {
    return {
      icon: '📺',
      bgColor: 'bg-green-500',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('disney') || merchant.includes('disney+')) {
    return {
      icon: '🏰',
      bgColor: 'bg-blue-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('hbo') || merchant.includes('max')) {
    return {
      icon: '🎬',
      bgColor: 'bg-purple-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('youtube') || merchant.includes('youtube premium')) {
    return {
      icon: '📺',
      bgColor: 'bg-red-600',
      textColor: 'text-white'
    };
  }
  
  // Transportation
  if (merchant.includes('delta')) {
    return {
      icon: '✈️',
      bgColor: 'bg-blue-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('american airlines') || merchant.includes('americanairlines')) {
    return {
      icon: '✈️',
      bgColor: 'bg-blue-500',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('southwest')) {
    return {
      icon: '✈️',
      bgColor: 'bg-orange-500',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('amtrak')) {
    return {
      icon: '🚂',
      bgColor: 'bg-blue-700',
      textColor: 'text-white'
    };
  }
  
  // Retail & Shopping
  if (merchant.includes('best buy') || merchant.includes('bestbuy')) {
    return {
      icon: '💻',
      bgColor: 'bg-yellow-500',
      textColor: 'text-black'
    };
  }
  if (merchant.includes('home depot') || merchant.includes('homedepot')) {
    return {
      icon: '🔨',
      bgColor: 'bg-orange-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('lowes')) {
    return {
      icon: '🏠',
      bgColor: 'bg-blue-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('ikea')) {
    return {
      icon: '🪑',
      bgColor: 'bg-yellow-500',
      textColor: 'text-black'
    };
  }
  if (merchant.includes('nike')) {
    return {
      icon: '👟',
      bgColor: 'bg-black',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('adidas')) {
    return {
      icon: '👟',
      bgColor: 'bg-black',
      textColor: 'text-white'
    };
  }
  
  // Movie Theaters & Entertainment
  if (merchant.includes('regal') || merchant.includes('regal cinemas')) {
    return {
      icon: '🎬',
      bgColor: 'bg-blue-700',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('amc') || merchant.includes('amc theaters')) {
    return {
      icon: '🍿',
      bgColor: 'bg-red-700',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('cinemark')) {
    return {
      icon: '🎟️',
      bgColor: 'bg-indigo-700',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('imax')) {
    return {
      icon: '🎥',
      bgColor: 'bg-purple-700',
      textColor: 'text-white'
    };
  }
  
  // Schools & Education
  if (merchant.includes('virginia tech') || merchant.includes('vt') || merchant.includes('vtech')) {
    return {
      icon: '🎓',
      bgColor: 'bg-orange-700',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('university') || merchant.includes('college') || merchant.includes('school')) {
    return {
      icon: '🏫',
      bgColor: 'bg-blue-800',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('library')) {
    return {
      icon: '📚',
      bgColor: 'bg-yellow-700',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('bookstore') || merchant.includes('campus store')) {
    return {
      icon: '📖',
      bgColor: 'bg-green-700',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('dining hall') || merchant.includes('cafeteria') || merchant.includes('dining commons')) {
    return {
      icon: '🍽️',
      bgColor: 'bg-orange-600',
      textColor: 'text-white'
    };
  }
  
  // Utilities & Services
  if (merchant.includes('electric') || merchant.includes('power') || merchant.includes('energy') || merchant.includes('duke energy') || merchant.includes('dominion')) {
    return {
      icon: '⚡',
      bgColor: 'bg-yellow-500',
      textColor: 'text-black'
    };
  }
  if (merchant.includes('water') || merchant.includes('sewer')) {
    return {
      icon: '💧',
      bgColor: 'bg-blue-500',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('gas') || merchant.includes('natural gas')) {
    return {
      icon: '🔥',
      bgColor: 'bg-orange-500',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('internet') || merchant.includes('wifi') || merchant.includes('comcast') || merchant.includes('verizon')) {
    return {
      icon: '📶',
      bgColor: 'bg-blue-600',
      textColor: 'text-white'
    };
  }
  if (merchant.includes('phone') || merchant.includes('cellular') || merchant.includes('at&t') || merchant.includes('t-mobile')) {
    return {
      icon: '📱',
      bgColor: 'bg-purple-600',
      textColor: 'text-white'
    };
  }
  
  // Default fallback to category icon
  return null;
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'food & dining':
    case 'dining':
      return Coffee;
    case 'shopping':
      return ShoppingBag;
    case 'transportation':
    case 'transport':
      return Car;
    case 'utilities':
      return Home;
    case 'entertainment':
      return Play;
    case 'gaming':
      return Gamepad2;
    case 'maintenance':
      return Wrench;
    default:
      return Utensils;
  }
};

export function RecentTransactions() {
  const { data: transactionsData, isLoading } = useTransactions({ limit: 5 });
  const transactions = transactionsData?.transactions || [];
  if (isLoading) {
    return (
      <Card className="card-gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Recent Transactions
            <Badge variant="secondary" className="ml-auto">
              <Skeleton className="h-4 w-6" />
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Recent Transactions
          <Badge variant="secondary" className="ml-auto">
            {transactions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No transactions yet</p>
                <p className="text-sm">Start by adding your first transaction</p>
              </div>
            ) : (
              transactions.map((transaction) => {
                const merchantLogo = getMerchantLogo(transaction.merchant);
                const IconComponent = getCategoryIcon(transaction.category);
                const isIncome = transaction.amount > 0;
                
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {merchantLogo ? (
                        <div className={`p-2 rounded-lg ${merchantLogo.bgColor} ${merchantLogo.textColor} flex items-center justify-center w-8 h-8`}>
                          <span className="text-lg">{merchantLogo.icon}</span>
                        </div>
                      ) : (
                        <div className={`p-2 rounded-lg ${
                          isIncome 
                            ? 'bg-success/10 text-success' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{transaction.merchant}</p>
                        <p className="text-xs text-muted-foreground">{transaction.category}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-semibold ${
                        isIncome ? 'text-success' : 'text-foreground'
                      }`}>
                        {isIncome ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
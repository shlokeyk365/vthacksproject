import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, MapPin, DollarSign, Calendar, Building2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Transaction } from '@/lib/api';

interface MapMerchant {
  id: string;
  name: string;
  address: string;
  totalSpent: number;
  visits: number;
  category: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  averageSpent: number;
  pricingLevel: 'low' | 'medium' | 'high';
}

type SearchResult =
  | { type: 'transaction'; data: Transaction; relevanceScore: number }
  | { type: 'merchant'; data: MapMerchant; relevanceScore: number };

interface InlineSearchProps {
  onClose?: () => void;
}

export const InlineSearch: React.FC<InlineSearchProps> = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  // Manual search function with mock data
  const search = useCallback(async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery || trimmedQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    try {
      // Mock transaction data for search
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          merchant: 'Starbucks',
          amount: 5.50,
          category: 'Food & Dining',
          description: 'Coffee',
          location: '123 Main St',
          latitude: 40.7128,
          longitude: -74.0060,
          date: '2024-01-15',
          status: 'COMPLETED',
          isSimulated: false,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          merchant: 'Target',
          amount: 45.99,
          category: 'Shopping',
          description: 'Groceries',
          location: '456 Oak Ave',
          latitude: 40.7589,
          longitude: -73.9851,
          date: '2024-01-14',
          status: 'COMPLETED',
          isSimulated: false,
          createdAt: '2024-01-14T15:20:00Z',
          updatedAt: '2024-01-14T15:20:00Z'
        },
        {
          id: '3',
          merchant: 'Uber',
          amount: 12.75,
          category: 'Transportation',
          description: 'Ride to downtown',
          location: 'New York, NY',
          latitude: 40.7128,
          longitude: -74.0060,
          date: '2024-01-13',
          status: 'COMPLETED',
          isSimulated: false,
          createdAt: '2024-01-13T09:15:00Z',
          updatedAt: '2024-01-13T09:15:00Z'
        },
        {
          id: '4',
          merchant: 'McDonald\'s',
          amount: 8.99,
          category: 'Food & Dining',
          description: 'Lunch',
          location: '789 Broadway',
          latitude: 40.7614,
          longitude: -73.9776,
          date: '2024-01-12',
          status: 'COMPLETED',
          isSimulated: false,
          createdAt: '2024-01-12T12:45:00Z',
          updatedAt: '2024-01-12T12:45:00Z'
        },
        {
          id: '5',
          merchant: 'Amazon',
          amount: 29.99,
          category: 'Shopping',
          description: 'Online purchase',
          location: 'Online',
          latitude: 0,
          longitude: 0,
          date: '2024-01-11',
          status: 'COMPLETED',
          isSimulated: false,
          createdAt: '2024-01-11T20:30:00Z',
          updatedAt: '2024-01-11T20:30:00Z'
        },
        {
          id: '6',
          merchant: 'Netflix',
          amount: 15.99,
          category: 'Entertainment',
          description: 'Monthly subscription',
          location: 'Online',
          latitude: 0,
          longitude: 0,
          date: '2024-01-10',
          status: 'COMPLETED',
          isSimulated: false,
          createdAt: '2024-01-10T00:00:00Z',
          updatedAt: '2024-01-10T00:00:00Z'
        },
        {
          id: '7',
          merchant: 'Spotify',
          amount: 9.99,
          category: 'Entertainment',
          description: 'Premium subscription',
          location: 'Online',
          latitude: 0,
          longitude: 0,
          date: '2024-01-09',
          status: 'COMPLETED',
          isSimulated: false,
          createdAt: '2024-01-09T00:00:00Z',
          updatedAt: '2024-01-09T00:00:00Z'
        },
        {
          id: '8',
          merchant: 'Apple',
          amount: 99.99,
          category: 'Shopping',
          description: 'App Store purchase',
          location: 'Online',
          latitude: 0,
          longitude: 0,
          date: '2024-01-08',
          status: 'COMPLETED',
          isSimulated: false,
          createdAt: '2024-01-08T14:30:00Z',
          updatedAt: '2024-01-08T14:30:00Z'
        },
        {
          id: '9',
          merchant: 'Google',
          amount: 2.99,
          category: 'Entertainment',
          description: 'Google Play purchase',
          location: 'Online',
          latitude: 0,
          longitude: 0,
          date: '2024-01-07',
          status: 'COMPLETED',
          isSimulated: false,
          createdAt: '2024-01-07T16:45:00Z',
          updatedAt: '2024-01-07T16:45:00Z'
        },
        {
          id: '10',
          merchant: 'Microsoft',
          amount: 12.99,
          category: 'Shopping',
          description: 'Office 365 subscription',
          location: 'Online',
          latitude: 0,
          longitude: 0,
          date: '2024-01-06',
          status: 'COMPLETED',
          isSimulated: false,
          createdAt: '2024-01-06T09:20:00Z',
          updatedAt: '2024-01-06T09:20:00Z'
        }
      ];

      // Mock merchant data for search
      const mockMerchants: MapMerchant[] = [
        {
          id: 'merchant-1', name: 'Starbucks', address: '123 Main St, New York, NY', totalSpent: 55.50, visits: 10,
          category: 'Food & Dining', coordinates: { lat: 40.7128, lng: -74.0060 }, averageSpent: 5.55, pricingLevel: 'medium'
        },
        {
          id: 'merchant-2', name: 'Target', address: '456 Oak Ave, New York, NY', totalSpent: 459.90, visits: 8,
          category: 'Shopping', coordinates: { lat: 40.7589, lng: -73.9851 }, averageSpent: 57.49, pricingLevel: 'medium'
        },
        {
          id: 'merchant-3', name: 'Whole Foods', address: '789 Pine St, New York, NY', totalSpent: 320.25, visits: 6,
          category: 'Grocery', coordinates: { lat: 40.7505, lng: -73.9934 }, averageSpent: 53.38, pricingLevel: 'high'
        },
        {
          id: 'merchant-4', name: 'McDonald\'s', address: '789 Broadway, New York, NY', totalSpent: 89.90, visits: 15,
          category: 'Food & Dining', coordinates: { lat: 40.7614, lng: -73.9776 }, averageSpent: 5.99, pricingLevel: 'low'
        },
        {
          id: 'merchant-5', name: 'Walmart', address: '321 Commerce St, New York, NY', totalSpent: 280.75, visits: 5,
          category: 'Shopping', coordinates: { lat: 40.7505, lng: -73.9934 }, averageSpent: 56.15, pricingLevel: 'low'
        },
        {
          id: 'merchant-6',
          name: 'Netflix',
          address: 'Online Service',
          totalSpent: 15.99,
          visits: 1,
          category: 'Entertainment',
          coordinates: { lat: 0, lng: 0 },
          averageSpent: 15.99,
          pricingLevel: 'low'
        },
        {
          id: 'merchant-7',
          name: 'Spotify',
          address: 'Online Service',
          totalSpent: 9.99,
          visits: 1,
          category: 'Entertainment',
          coordinates: { lat: 0, lng: 0 },
          averageSpent: 9.99,
          pricingLevel: 'low'
        },
        {
          id: 'merchant-8',
          name: 'Apple',
          address: 'Online Store',
          totalSpent: 99.99,
          visits: 1,
          category: 'Shopping',
          coordinates: { lat: 0, lng: 0 },
          averageSpent: 99.99,
          pricingLevel: 'high'
        },
        {
          id: 'merchant-9',
          name: 'Google',
          address: 'Online Service',
          totalSpent: 2.99,
          visits: 1,
          category: 'Entertainment',
          coordinates: { lat: 0, lng: 0 },
          averageSpent: 2.99,
          pricingLevel: 'low'
        },
        {
          id: 'merchant-10',
          name: 'Microsoft',
          address: 'Online Service',
          totalSpent: 12.99,
          visits: 1,
          category: 'Shopping',
          coordinates: { lat: 0, lng: 0 },
          averageSpent: 12.99,
          pricingLevel: 'low'
        }
      ];

      const searchResults: SearchResult[] = [];

      // Search transactions
      mockTransactions.forEach((transaction) => {
        const merchantScore = calculateRelevanceScore(transaction.merchant, trimmedQuery);
        const categoryScore = calculateRelevanceScore(transaction.category, trimmedQuery) * 0.5;
        const locationScore = calculateRelevanceScore(transaction.location || '', trimmedQuery) * 0.3;
        const relevanceScore = merchantScore + categoryScore + locationScore;
        
        if (relevanceScore > 0) {
          searchResults.push({
            type: 'transaction',
            data: transaction,
            relevanceScore
          });
        }
      });

      // Search merchants
      mockMerchants.forEach((merchant) => {
        const nameScore = calculateRelevanceScore(merchant.name, trimmedQuery);
        const categoryScore = calculateRelevanceScore(merchant.category, trimmedQuery) * 0.3;
        const addressScore = calculateRelevanceScore(merchant.address, trimmedQuery) * 0.2;
        const relevanceScore = nameScore + categoryScore + addressScore;
        
        if (relevanceScore > 0) {
          searchResults.push({
            type: 'merchant',
            data: merchant,
            relevanceScore
          });
        }
      });

      // Sort by relevance score
      searchResults.sort((a, b) => b.relevanceScore - a.relevanceScore);
      const finalResults = searchResults.slice(0, 10); // Limit to 10 results
      setResults(finalResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmedQuery = query.trim();
      if (trimmedQuery.length >= 2) {
        search(query);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [query, search]);

  const calculateRelevanceScore = (text: string, query: string): number => {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();
    
    if (textLower.includes(queryLower)) {
      // Exact match gets highest score
      if (textLower === queryLower) return 10;
      // Starts with query gets high score
      if (textLower.startsWith(queryLower)) return 8;
      // Contains query gets medium score
      return 5;
    }
    
    // Check for partial word matches (e.g., "net" matches "Netflix")
    const words = textLower.split(/\s+/);
    for (const word of words) {
      if (word.startsWith(queryLower)) {
        return 6; // Partial word match gets good score
      }
      if (word.includes(queryLower)) {
        return 3; // Partial word contains query gets lower score
      }
    }
    
    // Check for character sequence matches (e.g., "net" matches "Netflix" even if not at start)
    if (queryLower.length >= 2) {
      let textIndex = 0;
      let queryIndex = 0;
      while (textIndex < textLower.length && queryIndex < queryLower.length) {
        if (textLower[textIndex] === queryLower[queryIndex]) {
          queryIndex++;
        }
        textIndex++;
      }
      if (queryIndex === queryLower.length) {
        return 2; // Character sequence match gets low score
      }
    }
    
    return 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPricingLevelColor = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSelect = (result: SearchResult) => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    if (result.type === 'transaction') {
      navigate(`/transactions?id=${result.data.id}`);
    } else {
      navigate(`/map?merchant=${result.data.id}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search transactions, merchants..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-20"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
          
          {!isLoading && results.length === 0 && query && query.trim().length >= 2 && (
            <div className="p-4 text-center text-muted-foreground">
              No results found for "{query}"
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="p-2">
              {/* Transactions */}
              {results.filter(result => result.type === 'transaction').length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">Recent Transactions</h3>
                  <div className="space-y-1">
                    {results
                      .filter(result => result.type === 'transaction')
                      .map((result, index) => {
                        const transaction = result.data as Transaction;
                        return (
                          <div
                            key={`transaction-${transaction.id}-${index}`}
                            onClick={() => handleSelect(result)}
                            className="flex items-center gap-3 p-3 rounded-md hover:bg-muted cursor-pointer transition-colors"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <DollarSign className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{transaction.merchant}</span>
                                <Badge variant="outline" className="text-xs">
                                  {transaction.category}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(transaction.date)}</span>
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{transaction.location}</span>
                              </div>
                            </div>
                            <span className="font-semibold text-right">
                              {formatCurrency(transaction.amount)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Merchants */}
              {results.filter(result => result.type === 'merchant').length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">Merchants</h3>
                  <div className="space-y-1">
                    {results
                      .filter(result => result.type === 'merchant')
                      .map((result, index) => {
                        const merchant = result.data as MapMerchant;
                        return (
                          <div
                            key={`merchant-${merchant.id}-${index}`}
                            onClick={() => handleSelect(result)}
                            className="flex items-center gap-3 p-3 rounded-md hover:bg-muted cursor-pointer transition-colors"
                          >
                            <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-secondary-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{merchant.name}</span>
                                <Badge className={`text-xs capitalize ${getPricingLevelColor(merchant.pricingLevel)}`}>
                                  {merchant.pricingLevel}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{merchant.address}</span>
                              </div>
                            </div>
                            <span className="font-semibold text-right">
                              {formatCurrency(merchant.averageSpent)} avg.
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

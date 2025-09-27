import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

interface AutocompleteItem {
  id: string;
  label: string;
  type: 'merchant' | 'category' | 'recent';
  value: string;
  count?: number;
}

export function useAutocomplete() {
  // Fetch recent merchants
  const { data: recentMerchants } = useQuery({
    queryKey: ['transactions', 'recent-merchants'],
    queryFn: async () => {
      const response = await apiClient.getTransactions({ limit: 50 });
      const merchants = response.data?.transactions || [];
      
      // Group by merchant and count occurrences
      const merchantCounts = merchants.reduce((acc: Record<string, number>, transaction) => {
        const merchant = transaction.merchant;
        acc[merchant] = (acc[merchant] || 0) + 1;
        return acc;
      }, {});

      // Convert to autocomplete items
      return Object.entries(merchantCounts)
        .map(([merchant, count]) => ({
          id: `merchant-${merchant}`,
          label: merchant,
          type: 'merchant' as const,
          value: merchant,
          count
        }))
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, 10); // Top 10 merchants
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['transactions', 'categories'],
    queryFn: async () => {
      const response = await apiClient.getTransactions({ limit: 100 });
      const transactions = response.data?.transactions || [];
      
      // Group by category and count occurrences
      const categoryCounts = transactions.reduce((acc: Record<string, number>, transaction) => {
        const category = transaction.category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      // Convert to autocomplete items
      return Object.entries(categoryCounts)
        .map(([category, count]) => ({
          id: `category-${category}`,
          label: category,
          type: 'category' as const,
          value: category,
          count
        }))
        .sort((a, b) => (b.count || 0) - (a.count || 0));
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Get recent search terms from localStorage
  const getRecentSearches = (): AutocompleteItem[] => {
    try {
      const recent = localStorage.getItem('recent-searches');
      if (!recent) return [];
      
      const searches = JSON.parse(recent) as string[];
      return searches.slice(0, 5).map((search, index) => ({
        id: `recent-${index}`,
        label: search,
        type: 'recent' as const,
        value: search
      }));
    } catch {
      return [];
    }
  };

  // Save search term to recent searches
  const saveRecentSearch = (searchTerm: string) => {
    try {
      const recent = localStorage.getItem('recent-searches');
      const searches = recent ? JSON.parse(recent) as string[] : [];
      
      // Remove if already exists and add to front
      const filtered = searches.filter(s => s !== searchTerm);
      const updated = [searchTerm, ...filtered].slice(0, 10); // Keep last 10
      
      localStorage.setItem('recent-searches', JSON.stringify(updated));
    } catch {
      // Ignore localStorage errors
    }
  };

  // Combine all suggestions
  const suggestions: AutocompleteItem[] = [
    ...getRecentSearches(),
    ...(recentMerchants || []),
    ...(categories || [])
  ];

  return {
    suggestions,
    saveRecentSearch,
    isLoading: false // We're not loading autocomplete data separately
  };
}

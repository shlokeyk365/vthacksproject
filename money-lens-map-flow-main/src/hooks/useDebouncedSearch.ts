import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient, type Transaction } from '../lib/api';
import { extractSearchTerms } from '../components/ui/highlight-text';

interface UseDebouncedSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  limit?: number;
  enabled?: boolean;
}

interface UseDebouncedSearchResult {
  query: string;
  setQuery: (query: string) => void;
  results: Transaction[];
  searchTerms: string[];
  filters: any;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  clearResults: () => void;
}

export function useDebouncedSearch(options: UseDebouncedSearchOptions = {}): UseDebouncedSearchResult {
  const {
    debounceMs = 300,
    minQueryLength = 1,
    limit = 50,
    enabled = true
  } = options;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the query
  useEffect(() => {
    if (!enabled) return;

    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, enabled]);

  // Clear debounced query when disabled
  useEffect(() => {
    if (!enabled) {
      setDebouncedQuery('');
    }
  }, [enabled]);

  const shouldSearch = enabled && 
    debouncedQuery.trim().length >= minQueryLength;

  const {
    data,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['transactions', 'search', debouncedQuery],
    queryFn: () => apiClient.searchTransactions(debouncedQuery, limit),
    enabled: shouldSearch,
    select: (data) => data.data || { transactions: [], searchQuery: '', filters: null, generalTerms: [] },
    staleTime: 30000, // Consider data stale after 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  // Extract search terms for highlighting
  const searchTerms = extractSearchTerms(debouncedQuery);

  const clearResults = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    query,
    setQuery,
    results: data?.transactions || [],
    searchTerms,
    filters: data?.filters || null,
    isLoading,
    isError,
    error: error as Error | null,
    clearResults
  };
}

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Property } from '@/lib/supabase';

export interface UsePropertiesOptions {
  status?: string;
  ownerId?: string;
  limit?: number;
  page?: number;
  category?: string;
  city?: string;
  delegation?: string;
}

const ITEMS_PER_PAGE = 10;

export function useProperties(options: UsePropertiesOptions = {}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery,   setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProperties = async (page = currentPage, isLoadMore = false) => {
    try {
      setLoading(true);
      
      // First, get total count
      let countQuery = supabase
        .from('properties')
        .select('*', { count: 'exact' });
      if (options.status) {
        countQuery = countQuery.eq('status', options.status);
      }
      
      const { count } = await countQuery;
      setTotalCount(count || 0);
      
      // Then fetch paginated data
      const start = (page - 1) * ITEMS_PER_PAGE;
      
      let query = supabase
        .from('properties')
        .select('*')
        .range(start, start + ITEMS_PER_PAGE - 1)
        .order('created_at', { ascending: false });
      
      // Apply additional filters if provided
      
      if (options.status) {
        query = query.eq('status', options.status);
      }
      
      if (options.ownerId) {
        query = query.eq('owner_id', options.ownerId);
      }
      
      if (options.category) {
        query = query.eq('category', options.category);
      }
      
      // Location filter logic
      if (options.city && options.delegation) {
        // Match exact format 'delegation, city'
        query = query.ilike('location', `${options.delegation}, ${options.city}`);
      } else if (options.city) {
        // Match any location ending with ', city'
        query = query.ilike('location', `%, ${options.city}`);
      } else if (options.delegation) {
        // Match any location starting with 'delegation,'
        query = query.ilike('location', `${options.delegation},%`);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setProperties(prev => isLoadMore ? [...prev, ...(data || [])] : (data || []));
      setHasMore((data?.length || 0) === ITEMS_PER_PAGE);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch properties on mount and when dependencies change
  useEffect(() => {
    fetchProperties(1, false);
  }, [options.ownerId, options.status, options.category, options.city, options.delegation]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProperties(1, false);
  };

  // Handle load more
  const handleLoadMore = async () => {
    if (!hasMore || loading) return;
    await fetchProperties(currentPage + 1, true);
  };

  // Filter properties based on search query
  const filteredProperties = searchQuery
    ? properties.filter(
        property =>
          property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          property.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : properties;

  return {
    properties: filteredProperties,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    refreshing,
    handleRefresh,
    handleLoadMore,
    hasMore,
    totalCount,
    currentPage
  };
}
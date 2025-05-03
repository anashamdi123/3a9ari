import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Property } from '@/lib/supabase';

interface UsePropertiesOptions {
  status?: string;
  ownerId?: string;
  limit?: number;
  page?: number;
}

const ITEMS_PER_PAGE = 10;

export function useProperties(options: UsePropertiesOptions = {}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProperties = async (page = currentPage, isLoadMore = false) => {
    try {
      setLoading(true);
      
      // First, get total count
      const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('status', 'approved');
      
      setTotalCount(count || 0);
      
      // Then fetch paginated data
      const start = (page - 1) * ITEMS_PER_PAGE;
      
      let query = supabase
        .from('properties')
        .select('*')
        .eq('status', 'approved')
        .range(start, start + ITEMS_PER_PAGE - 1)
        .order('created_at', { ascending: false });
      
      // Apply additional filters if provided
      if (options.ownerId) {
        query = query.eq('owner_id', options.ownerId);
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
  }, [options.ownerId]);

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
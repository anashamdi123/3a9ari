import { useState, useEffect } from 'react';
import { supabase, Property } from '@/lib/supabase';

interface UsePropertiesOptions {
  status?: 'pending' | 'approved' | 'rejected';
  ownerId?: string;
  limit?: number;
}

export function useProperties(options: UsePropertiesOptions = {}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('properties')
        .select('*');
      
      // Apply filters if provided
      if (options.status) {
        query = query.eq('status', options.status);
      }
      
      if (options.ownerId) {
        query = query.eq('owner_id', options.ownerId);
      }
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      // Order by created_at
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setProperties(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch properties on mount and when dependencies change
  useEffect(() => {
    fetchProperties();
  }, [options.status, options.ownerId, options.limit]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchProperties();
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
    refetch: fetchProperties
  };
}
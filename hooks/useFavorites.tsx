import { useState, useEffect } from 'react';
import { supabase, Favorite } from '@/lib/supabase';
import { useAuthContext } from '@/context/auth-context';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          user_id,
          property_id,
          created_at,
          property:property_id (*)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setFavorites(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (propertyId: string) => {
    if (!user) return;
    
    const isFav = favorites.some(fav => fav.property_id === propertyId);
    
    try {
      if (isFav) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);
        
        if (error) throw error;
        
        setFavorites(favorites.filter(fav => fav.property_id !== propertyId));
      } else {
        // Add to favorites
        const { data, error } = await supabase
          .from('favorites')
          .insert([
            { user_id: user.id, property_id: propertyId }
          ])
          .select();
        
        if (error) throw error;
        
        if (data) {
          setFavorites([...favorites, data[0]]);
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const isFavorite = (propertyId: string): boolean => {
    return favorites.some(fav => fav.property_id === propertyId);
  };

  return {
    favorites,
    loading,
    error,
    fetchFavorites,
    toggleFavorite,
    isFavorite
  };
}
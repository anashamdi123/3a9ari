import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView,
  StatusBar,
  RefreshControl
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase, Property } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { MapPin, Heart } from 'lucide-react-native';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuthContext } from '@/context/auth-context';
import { CURRENCY, AREA_UNIT } from '@/constants/config';

const { width } = Dimensions.get('window');
const NUM_COLUMNS = width < 600 ? 1 : width < 900 ? 2 : 3;
const ITEM_WIDTH = (width - (Theme.spacing.lg * 2) - ((NUM_COLUMNS - 1) * Theme.spacing.md)) / NUM_COLUMNS;

export default function PropertyListScreen() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { isAuthenticated } = useAuthContext();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  useEffect(() => {
    fetchProperties();
  }, []);
  
  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchProperties();
  };
  
  const handlePropertyPress = (id: string) => {
    router.push(`/property/${id}`);
  };
  
  const handleFavoriteToggle = (id: string) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    toggleFavorite(id);
  };
  
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.background.light} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Theme.colors.primary]}
            tintColor={Theme.colors.primary}
          />
        }
      >
        <View style={styles.gridContainer}>
          {properties.map((property) => (
            <TouchableOpacity
              key={property.id}
              style={[styles.propertyCard, { width: ITEM_WIDTH }]}
              onPress={() => handlePropertyPress(property.id)}
              activeOpacity={0.7}
            >
              <View style={styles.imageContainer}>
                <Image
                  source={{ 
                    uri: property.images[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'
                  }}
                  style={styles.image}
                />
                <TouchableOpacity
                  style={styles.favoriteButton}
                  onPress={() => handleFavoriteToggle(property.id)}
                >
                  <Heart
                    size={24}
                    color={isFavorite(property.id) ? Theme.colors.error : 'white'}
                    fill={isFavorite(property.id) ? Theme.colors.error : 'transparent'}
                  />
                </TouchableOpacity>
              </View>
              
              <View style={styles.detailsContainer}>
                <Text style={styles.price}>
                  {property.price.toLocaleString()} {CURRENCY}
                </Text>
                
                <Text style={styles.title} numberOfLines={1}>
                  {property.title}
                </Text>
                
                <View style={styles.locationContainer}>
                  <MapPin size={16} color={Theme.colors.text.secondary} />
                  <Text style={styles.location} numberOfLines={1}>
                    {property.location}
                  </Text>
                </View>
                
                <View style={styles.infoContainer}>
                  <Text style={styles.infoText}>
                    {property.size} {AREA_UNIT}
                  </Text>
                  <Text style={styles.infoText}>
                    {new Date(property.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.light,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.secondary,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
  },
  propertyCard: {
    backgroundColor: 'white',
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 16 / 9,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: Theme.spacing.sm,
    right: Theme.spacing.sm,
    padding: Theme.spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: Theme.borderRadius.round,
  },
  detailsContainer: {
    padding: Theme.spacing.md,
  },
  price: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xl,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  title: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  location: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
    marginRight: Theme.spacing.xs,
    flex: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.sm,
  },
  infoText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
  },
}); 
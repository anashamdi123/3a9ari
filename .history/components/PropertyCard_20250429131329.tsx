import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { Theme } from '@/constants/theme';
import { Property } from '@/lib/supabase';
import { useAuthContext } from '@/context/auth-context';
import { useFavorites } from '@/hooks/useFavorites';
import { CURRENCY, AREA_UNIT } from '@/constants/config';

interface PropertyCardProps {
  property: Property;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export function PropertyCard({ property, onFavorite, isFavorite }: PropertyCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const { toggleFavorite } = useFavorites();
  const windowWidth = Dimensions.get('window').width;
  const cardWidth = (windowWidth - Theme.spacing.xl * 3) / 2;

  const handlePress = () => {
    router.push(`/property/${property.id}`);
  };

  const handleFavoritePress = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    toggleFavorite(property.id);
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { width: cardWidth }]} 
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property.images[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg' }}
          style={styles.image}
          resizeMode="cover"
        />
        {onFavorite && (
          <TouchableOpacity 
            style={styles.favoriteButton} 
            onPress={onFavorite}
          >
            <Heart 
              size={20} 
              color={isFavorite ? Theme.colors.error : Theme.colors.text.light} 
              fill={isFavorite ? Theme.colors.error : 'none'} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {property.location}
        </Text>
        <View style={styles.details}>
          <Text style={styles.price}>
            {property.price.toLocaleString()} {CURRENCY}
          </Text>
          <Text style={styles.size}>
            {property.size} {AREA_UNIT}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: Theme.spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: Theme.spacing.sm,
    right: Theme.spacing.sm,
    backgroundColor: 'white',
    borderRadius: Theme.borderRadius.full,
    padding: Theme.spacing.xs,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  content: {
    padding: Theme.spacing.md,
  },
  title: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  location: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.sm,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.primary,
  },
  size: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
  },
});
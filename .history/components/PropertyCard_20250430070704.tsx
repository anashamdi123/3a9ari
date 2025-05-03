import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MapPin, Ruler, Star } from 'lucide-react-native';
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
  const cardWidth = (windowWidth - (Theme.spacing.lg * 2) - Theme.spacing.md) / 2;

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
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: property.images[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg' }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        {onFavorite && (
          <TouchableOpacity 
            style={styles.favoriteButton} 
            onPress={handleFavoritePress}
            activeOpacity={0.8}
          >
            <Heart 
              size={20} 
              color={isFavorite ? Theme.colors.error : 'white'} 
              fill={isFavorite ? Theme.colors.error : 'none'} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {property.title}
          </Text>
          <View style={styles.ratingContainer}>
            <Star size={14} color={Theme.colors.warning} fill={Theme.colors.warning} />
            <Text style={styles.rating}>4.8</Text>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <MapPin size={14} color={Theme.colors.text.secondary} />
          <Text style={styles.location} numberOfLines={1}>
            {property.location}
          </Text>
        </View>

        <View style={styles.details}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {property.price.toLocaleString()} {CURRENCY}
            </Text>
            <Text style={styles.priceLabel}>السعر</Text>
          </View>
          
          <View style={styles.sizeContainer}>
            <Ruler size={14} color={Theme.colors.text.secondary} />
            <Text style={styles.size}>
              {property.size} {AREA_UNIT}
            </Text>
          </View>
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: Theme.spacing.md,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  favoriteButton: {
    position: 'absolute',
    top: Theme.spacing.sm,
    right: Theme.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: Theme.borderRadius.round,
    padding: Theme.spacing.sm,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  title: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.warning + '10',
    paddingHorizontal: Theme.spacing.xs,
    paddingVertical: Theme.spacing.xxs,
    borderRadius: Theme.borderRadius.sm,
  },
  rating: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.warning,
    marginLeft: Theme.spacing.xxs,
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
    marginLeft: Theme.spacing.xs,
    flex: 1,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.sm,
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.primary,
  },
  priceLabel: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.xs,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.xxs,
  },
  sizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.light,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  size: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
    marginLeft: Theme.spacing.xs,
  },
});
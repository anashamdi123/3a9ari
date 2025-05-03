import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MapPin, Ruler, DollarSign } from 'lucide-react-native';
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
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>

        <View style={styles.featureRow}>
          <MapPin size={16} color={Theme.colors.text.secondary} />
          <Text style={styles.featureText} numberOfLines={1}>
            {property.location}
          </Text>
        </View>

        <View style={styles.featureRow}>
          <DollarSign size={16} color={Theme.colors.text.secondary} />
          <Text style={styles.featureText}>
            {property.price.toLocaleString()} {CURRENCY}
          </Text>
        </View>

        <View style={styles.featureRow}>
          <Ruler size={16} color={Theme.colors.text.secondary} />
          <Text style={styles.featureText}>
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
  title: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.light,
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.xs,
  },
  featureText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
    marginLeft: Theme.spacing.sm,
    flex: 1,
  },
});
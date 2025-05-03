import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, MapPin, Ruler, Bed, Bath } from 'lucide-react-native';
import { Theme } from '@/constants/theme';
import { Property } from '@/lib/supabase';
import { useAuthContext } from '@/context/auth-context';
import { useFavorites } from '@/hooks/useFavorites';
import { CURRENCY, AREA_UNIT } from '@/constants/config';

interface PropertyCardProps {
  property: Property;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width > 500 ? width / 2 - 24 : width - 32;

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const router = useRouter();
  const { isAuthenticated } = useAuthContext();
  const { isFavorite, toggleFavorite } = useFavorites();
  
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

  const isFav = isFavorite(property.id);
  
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.95}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ 
            uri: property.images[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg' 
          }} 
          style={styles.image}
        />
        <View style={styles.overlay} />
        
        <TouchableOpacity 
          style={styles.favoriteButton} 
          onPress={handleFavoritePress}
        >
          <Heart 
            size={20} 
            color={isFav ? Theme.colors.error : 'white'} 
            fill={isFav ? Theme.colors.error : 'transparent'}
          />
        </TouchableOpacity>

        <View style={styles.priceTag}>
          <Text style={styles.price}>
            {property.price.toLocaleString()} {CURRENCY}
          </Text>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {property.title}
        </Text>

        <View style={styles.locationContainer}>
          <MapPin size={16} color={Theme.colors.text.secondary} />
          <Text style={styles.location} numberOfLines={1}>
            {property.location}
          </Text>
        </View>
        
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Bed size={16} color={Theme.colors.text.secondary} />
            <Text style={styles.featureText}>3</Text>
          </View>
          
          <View style={styles.feature}>
            <Bath size={16} color={Theme.colors.text.secondary} />
            <Text style={styles.featureText}>2</Text>
          </View>
          
          <View style={styles.feature}>
            <Ruler size={16} color={Theme.colors.text.secondary} />
            <Text style={styles.featureText}>
              {property.size} {AREA_UNIT}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Theme.colors.background.main,
    borderRadius: Theme.borderRadius.xl,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      default: {
        shadowColor: Theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
    marginBottom: Theme.spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  favoriteButton: {
    position: 'absolute',
    top: Theme.spacing.md,
    left: Theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  priceTag: {
    position: 'absolute',
    bottom: Theme.spacing.md,
    right: Theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
  },
  price: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: 'white',
  },
  contentContainer: {
    padding: Theme.spacing.lg,
  },
  title: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  location: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
    marginRight: Theme.spacing.xs,
    flex: 1,
  },
  featuresContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.light,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  featureText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
    marginLeft: Theme.spacing.xs,
  },
});
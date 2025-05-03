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
      activeOpacity={0.9}
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
          onPress={handleFavoritePress}
          activeOpacity={0.8}
        >
          <Heart 
            size={20} 
            color={isFav ? Theme.colors.error : 'white'} 
            fill={isFav ? Theme.colors.error : 'transparent'}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.price}>{property.price.toLocaleString()} {CURRENCY}</Text>
        <Text style={styles.title} numberOfLines={1}>{property.title}</Text>
        <Text style={styles.location} numberOfLines={1}>{property.location}</Text>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.size}>{property.size} {AREA_UNIT}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Theme.colors.background.main,
    borderRadius: Theme.borderRadius.md,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: Theme.spacing.lg,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: Theme.spacing.sm,
    left: Theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    padding: Theme.spacing.md,
  },
  price: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
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
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.xs,
  },
  size: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
  },
});import React from 'react';
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
      activeOpacity={0.9}
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
          onPress={handleFavoritePress}
          activeOpacity={0.8}
        >
          <Heart 
            size={20} 
            color={isFav ? Theme.colors.error : 'white'} 
            fill={isFav ? Theme.colors.error : 'transparent'}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.price}>{property.price.toLocaleString()} {CURRENCY}</Text>
        <Text style={styles.title} numberOfLines={1}>{property.title}</Text>
        <Text style={styles.location} numberOfLines={1}>{property.location}</Text>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.size}>{property.size} {AREA_UNIT}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Theme.colors.background.main,
    borderRadius: Theme.borderRadius.md,
    shadowColor: Theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: Theme.spacing.lg,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteButton: {
    position: 'absolute',
    top: Theme.spacing.sm,
    left: Theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    padding: Theme.spacing.md,
  },
  price: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
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
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.xs,
  },
  size: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
  },
});
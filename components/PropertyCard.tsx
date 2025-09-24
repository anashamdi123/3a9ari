import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Heart, MapPin, Ruler } from 'lucide-react-native';
import { Property } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { CURRENCY, AREA_UNITS, PRICE_UNITS, PROPERTY_CATEGORIES } from '@/constants/config';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuthContext } from '@/context/auth-context';

interface PropertyCardProps {
  property: Property;
  onFavoriteToggle?: (propertyId: string) => void;
}

export function PropertyCard({ property, onFavoriteToggle }: PropertyCardProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthContext();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [loading, setLoading] = useState(true);

  const handlePress = () => router.push(`/property/${property.id}`);

  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (onFavoriteToggle) {
      onFavoriteToggle(property.id);
    } else {
      toggleFavorite(property.id);
    }
  };

  const isFav = isFavorite(property.id);
  const isOwner = user?.id === property.owner_id;

  const priceUnitLabel = property.price_unit
    ? PRICE_UNITS.find(unit => unit.id === property.price_unit)?.label
    : PRICE_UNITS[0].label;

  const areaUnitLabel = property.size_unit
    ? AREA_UNITS.find(unit => unit.id === property.size_unit)?.label
    : AREA_UNITS[0].label;

  const categoryLabel = property.category
    ? PROPERTY_CATEGORIES.find(cat => cat.id === property.category)?.label
    : 'غير محدد';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={
            property.images?.[0]
              ? { uri: property.images[0] }
              : require('@/assets/images/not_found.png')
          }
          style={styles.image}
          contentFit="cover"
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          transition={100}
        />
        {loading && (
          <ActivityIndicator
            style={StyleSheet.absoluteFill}
            size="large"
            color={Theme.colors.primary}
          />
        )}

        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{categoryLabel}</Text>
        </View>

        {/* Favorite Button */}
        {!isOwner && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            activeOpacity={0.7}
          >
            <Heart
              size={24}
              color={isFav ? Theme.colors.error : Theme.colors.white}
              fill={isFav ? Theme.colors.error : 'none'}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <View style={styles.priceBadgeContent}>
          <Text style={styles.priceTextContent}>
            {property.price?.toLocaleString() || 'N/A'} {priceUnitLabel}
          </Text>
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {property.title || 'Untitled Property'}
        </Text>

        <View style={styles.locationContainer}>
          <Text style={styles.detailText} numberOfLines={1}>
            {property.location || 'Location not specified'}
          </Text>
          <MapPin size={18} color={Theme.colors.text.secondary} />
        </View>

        <View style={styles.locationContainer}>
          <Text style={styles.detailText}>
            {property.size
              ? `${property.size} ${areaUnitLabel}`
              : 'Size not available'}
          </Text>
          <Ruler size={18} color={Theme.colors.text.secondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// styles (unchanged — same as your code)
const styles = StyleSheet.create({
  container: {
    width: '95%',
    backgroundColor: Theme.colors.background.card,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    ...Theme.shadows.small,
  },
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Theme.colors.background.light,
  },
  categoryBadge: {
    position: 'absolute',
    bottom: Theme.spacing.sm,
    left: Theme.spacing.sm,
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
  },
  categoryText: {
    color: Theme.colors.white,
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.sm,
    textAlign: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: Theme.spacing.sm,
    right: Theme.spacing.sm,
    backgroundColor: Theme.colors.overlay,
    borderRadius: Theme.borderRadius.round,
    padding: Theme.spacing.sm,
  },
  content: {
    padding: Theme.spacing.lg,
  },
  title: {
    fontSize: Theme.fontSizes.lg,
    fontFamily: 'Tajawal-Bold',
    marginBottom: Theme.spacing.sm,
    color: Theme.colors.text.primary,
    textAlign: 'right',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    gap: Theme.spacing.sm,
    height: 28,
  },
  detailText: {
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    fontFamily: 'Tajawal-Medium',
    flex: 1,
    textAlign: 'right',
    includeFontPadding: false,
    textAlignVertical: 'center',
    height: 28,
    lineHeight: 28,
  },
  priceBadgeContent: {
    backgroundColor: Theme.colors.overlay,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
    alignSelf: 'flex-end',
    marginBottom: Theme.spacing.sm,
  },
  priceTextContent: {
    color: Theme.colors.text.light,
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    textAlign: 'center',
  },
});

import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Dimensions, Linking, StatusBar, Modal, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase, Property } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Phone, MapPin, ChevronRight, ChevronLeft, Heart, ArrowLeft, X } from 'lucide-react-native';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuthContext } from '@/context/auth-context';
import { CURRENCY, PROPERTY_CATEGORIES, AREA_UNITS, PRICE_UNITS } from '@/constants/config';
import { GestureHandlerRootView, PinchGestureHandler, PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({});
  
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  
  const { isAuthenticated, user } = useAuthContext();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  // Get the price unit label
  const priceUnitLabel = property?.price_unit 
    ? PRICE_UNITS.find(unit => unit.id === property.price_unit)?.label 
    : PRICE_UNITS[0].label;

  // Get the area unit label
  const areaUnitLabel = property?.size_unit 
    ? AREA_UNITS.find(unit => unit.id === property.size_unit)?.label 
    : AREA_UNITS[0].label;
  
  useEffect(() => {
    fetchProperty();
  }, [id]);
  
  const fetchProperty = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCall = () => {
    if (property?.phone_number) {
      Linking.openURL(`tel:${property.phone_number}`);
    }
  };
  
  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (property) {
      toggleFavorite(property.id);
    }
  };
  
  const handleImagePress = (index: number) => {
    setCurrentImageIndex(index);
    setIsFullscreen(true);
  };
  
  const handleImageLoadStart = (idx: number) => {
    setImageLoading((prev) => ({ ...prev, [idx]: true }));
  };
  
  const handleImageLoadEnd = (idx: number) => {
    setImageLoading((prev) => ({ ...prev, [idx]: false }));
  };
  
  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
    scale.value = 1;
    savedScale.value = 1;
  };
  
  const onPinchGestureEvent = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
    onActive: (event) => {
      scale.value = savedScale.value * event.scale;
    },
    onEnd: () => {
      savedScale.value = scale.value;
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };
  
  if (loading || !property) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const isFav = isFavorite(property.id);
  const isOwner = user?.id === property.owner_id;
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container} edges={['top']}>

        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={Theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, !isOwner && styles.headerTitleWithFavorite]} numberOfLines={1} ellipsizeMode="tail">
            {property.title.length > 20 ? `${property.title.substring(0, 20)}...` : property.title}
          </Text>
          {!isOwner && (
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={handleFavoriteToggle}
              activeOpacity={0.7}
            >
              <Heart
                size={24}
                color={isFav ? Theme.colors.error : Theme.colors.text.primary}
                fill={isFav ? Theme.colors.error : 'transparent'}
              />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
          <View style={styles.imageContainer}>
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                setCurrentImageIndex(index);
              }}
              scrollEventThrottle={16}
            >
              {property.images.map((image, index) => (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => handleImagePress(index)} 
                  activeOpacity={1}
                >
                  <View>
              <Image
                    source={{ uri: image || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg' }}
                style={styles.image}
                      onLoadStart={() => handleImageLoadStart(index)}
                      onLoadEnd={() => handleImageLoadEnd(index)}
                    />
                    {imageLoading[index] && (
                      <ActivityIndicator
                        style={StyleSheet.absoluteFill}
                        size="large"
                        color={Theme.colors.primary}
                      />
                    )}
                  </View>
            </TouchableOpacity>
              ))}
            </ScrollView>
            
            {property.images.length > 1 && (
                <View style={styles.imageCounter}>
                  <Text style={styles.imageCounterText}>
                    {currentImageIndex + 1}/{property.images.length}
                  </Text>
                </View>
            )}
          </View>
          
          <View style={styles.detailsContainer}>
            <Text style={styles.price}>
              {property.price.toLocaleString()} {priceUnitLabel}
            </Text>
            
            <Text style={styles.title}>{property.title}</Text>
            
            <View style={styles.categoryContainer}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>
                  {PROPERTY_CATEGORIES.find(cat => cat.id === property.category)?.label || property.category}
                </Text>
              </View>
            </View>
            
            <View style={styles.locationContainer}>
              <MapPin size={18} color={Theme.colors.text.secondary} />
              <Text style={styles.location}>{property.location}</Text>
            </View>
            
            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>المساحة</Text>
                <Text style={styles.infoValue}>
                  {property.size} {areaUnitLabel}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>تاريخ الإضافة</Text>
                <Text style={styles.infoValue}>
                  {new Date(property.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
            
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>الوصف</Text>
              <Text style={styles.description}>{property.description}</Text>
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <Button
            title="اتصل بالمالك"
            onPress={handleCall}
            icon={<Phone size={20} color="white" style={{ marginLeft: 8 }} />}
          />
        </View>

        <Modal
          visible={isFullscreen}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseFullscreen}
        >
          <View style={styles.fullscreenContainer}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleCloseFullscreen}
            >
              <X size={24} color="white" />
            </TouchableOpacity>
            
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              onScroll={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / width);
                setCurrentImageIndex(index);
              }}
              scrollEventThrottle={16}
              contentOffset={{ x: currentImageIndex * width, y: 0 }}
            >
              {property.images.map((image, index) => (
                <PinchGestureHandler key={index} onGestureEvent={onPinchGestureEvent}>
              <Animated.View style={[styles.fullscreenImageContainer, animatedStyle]}>
                    <View>
                <Image
                      source={{ uri: image || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg' }}
                  style={styles.fullscreenImage}
                  resizeMode="contain"
                        onLoadStart={() => handleImageLoadStart(index)}
                        onLoadEnd={() => handleImageLoadEnd(index)}
                      />
                      {imageLoading[index] && (
                        <ActivityIndicator
                          style={StyleSheet.absoluteFill}
                          size="large"
                          color={Theme.colors.primary}
                        />
                      )}
                    </View>
              </Animated.View>
            </PinchGestureHandler>
              ))}
            </ScrollView>
            
            {property.images.length > 1 && (
                <View style={styles.fullscreenCounter}>
                  <Text style={styles.fullscreenCounterText}>
                    {currentImageIndex + 1}/{property.images.length}
                  </Text>
                </View>
            )}
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.light,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
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
  imageContainer: {
    width: '100%',
    height: Dimensions.get('window').height * 0.5,
    position: 'relative',
  },
  image: {
    width: width,
    height: '100%',
    resizeMode: 'cover',
  },
  imageCounter: {
    position: 'absolute',
    bottom: Theme.spacing.md,
    left: '50%',
    transform: [{ translateX: -30 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  imageCounterText: {
    fontFamily: 'Tajawal-Medium',
    color: 'white',
    fontSize: Theme.fontSizes.sm,
  },
  detailsContainer: {
    padding: Theme.spacing.lg,
  },
  price: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xxl,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'right',
  },
  title: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xl,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'right',
  },
  categoryContainer: {
    flexDirection: 'row-reverse',
    marginBottom: Theme.spacing.md,
  },
  categoryBadge: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.round,
  },
  categoryText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.sm,
    color: 'white',
    textAlign: 'center',
  },
  locationContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.xs,
    height: 24,
  },
  location: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    textAlign: 'right',
    includeFontPadding: false,
    textAlignVertical: 'center',
    height: 24,
    lineHeight: 24,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.main,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  infoValue: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
  },
  descriptionContainer: {
    backgroundColor: Theme.colors.background.main,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
  },
  descriptionTitle: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  description: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    lineHeight: 24,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.primary,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    padding: Theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.xl,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
    backgroundColor: Theme.colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.primary,
    textAlign: 'center',
    flex: 1,
    marginHorizontal: Theme.spacing.md,
  },
  headerTitleWithFavorite: {
    marginRight: 40,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenImageContainer: {
    width: '100%',
    maxWidth: 480,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 1,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  fullscreenCounter: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 20,
    left: '50%',
    transform: [{ translateX: -30 }],
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    paddingVertical: 4,
    paddingHorizontal: 12,
    zIndex: 1,
  },
  fullscreenCounterText: {
    fontFamily: 'Tajawal-Medium',
    color: 'white',
    fontSize: Theme.fontSizes.sm,
  },
});
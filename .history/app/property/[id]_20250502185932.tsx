import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TouchableOpacity, Dimensions, Linking, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase, Property } from '@/lib/supabase';
import { Theme } from '@/constants/theme';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { Phone, MapPin, ChevronRight, ChevronLeft, Heart } from 'lucide-react-native';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuthContext } from '@/context/auth-context';
import { CURRENCY, AREA_UNIT } from '@/constants/config';

const { width } = Dimensions.get('window');

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const { isAuthenticated } = useAuthContext();
  const { isFavorite, toggleFavorite } = useFavorites();
  
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
  
  const nextImage = () => {
    if (property && currentImageIndex < property.images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };
  
  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };
  
  if (loading || !property) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="تفاصيل العقار" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const isFav = isFavorite(property.id);
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="تفاصيل العقار" />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ 
              uri: property.images[currentImageIndex] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'
            }}
            style={styles.image}
          />
          
          {property.images.length > 1 && (
            <>
              <TouchableOpacity style={styles.imageNavLeft} onPress={nextImage}>
                <ChevronLeft color="white" size={24} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.imageNavRight} onPress={prevImage}>
                <ChevronRight color="white" size={24} />
              </TouchableOpacity>
              
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentImageIndex + 1}/{property.images.length}
                </Text>
              </View>
            </>
          )}
          
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoriteToggle}
          >
            <Heart
              size={24}
              color={isFav ? Theme.colors.error : 'white'}
              fill={isFav ? Theme.colors.error : 'transparent'}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.price}>
            {property.price.toLocaleString()} {CURRENCY}
          </Text>
          
          <Text style={styles.title}>{property.title}</Text>
          
          <View style={styles.locationContainer}>
            <MapPin size={18} color={Theme.colors.text.secondary} />
            <Text style={styles.location}>{property.location}</Text>
          </View>
          
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>المساحة</Text>
              <Text style={styles.infoValue}>
                {property.size} {AREA_UNIT}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.light,
    paddingBottom: 80,
  },
  scrollContent: {
    flexGrow: 1,
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
    marginTop: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageNavLeft: {
    position: 'absolute',
    left: Theme.spacing.md,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageNavRight: {
    position: 'absolute',
    right: Theme.spacing.md,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
  favoriteButton: {
    position: 'absolute',
    top: Theme.spacing.md,
    left: Theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    padding: Theme.spacing.lg,
  },
  price: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xxl,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.sm,
  },
  title: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xl,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  location: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    marginRight: Theme.spacing.xs,
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
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    padding: Theme.spacing.md,
  },
});
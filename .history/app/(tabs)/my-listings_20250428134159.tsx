import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { useAuthContext } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { Property } from '@/lib/supabase';
import { Plus, Home, AlertCircle } from 'lucide-react-native';
import { I18nManager } from 'react-native';
import { CURRENCY, AREA_UNIT } from '@/constants/config';

// Force RTL layout
I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

export default function MyListingsScreen() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const [listings, setListings] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError('حدث خطأ أثناء تحميل العقارات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddListing = () => {
    router.push('/add-listing' as any);
  };

  const renderListingItem = ({ item }: { item: Property }) => (
    <TouchableOpacity 
      style={styles.listingItem}
      onPress={() => router.push(`/property/${item.id}` as any)}
    >
      <View style={styles.listingContent}>
        <View style={styles.listingHeader}>
          <Text style={styles.listingTitle}>{item.title}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) }
          ]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
        
        <Text style={styles.listingDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.listingDetails}>
          <View style={styles.detailItem}>
            <Home size={16} color={Theme.colors.text.secondary} />
            <Text style={styles.detailText}>{item.size} {AREA_UNIT}</Text>
          </View>
          <Text style={styles.price}>{item.price} {CURRENCY}</Text>
        </View>
        
        <Text style={styles.location}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusColor = (status: Property['status']) => {
    switch (status) {
      case 'approved':
        return Theme.colors.success;
      case 'pending':
        return Theme.colors.warning;
      case 'rejected':
        return Theme.colors.error;
      default:
        return Theme.colors.text.secondary;
    }
  };

  const getStatusText = (status: Property['status']) => {
    switch (status) {
      case 'approved':
        return 'معتمد';
      case 'pending':
        return 'قيد المراجعة';
      case 'rejected':
        return 'مرفوض';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <AlertCircle size={48} color={Theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchListings}
          >
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>عقاراتي</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddListing}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      {listings.length === 0 ? (
        <View style={styles.centerContainer}>
          <Home size={48} color={Theme.colors.text.secondary} />
          <Text style={styles.emptyText}>لا توجد عقارات مضافة</Text>
          <TouchableOpacity 
            style={styles.addListingButton}
            onPress={handleAddListing}
          >
            <Text style={styles.addListingButtonText}>إضافة عقار جديد</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderListingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.light,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xl,
    color: Theme.colors.text.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: Theme.spacing.md,
  },
  listingItem: {
    backgroundColor: 'white',
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    padding: Theme.spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listingContent: {
    gap: Theme.spacing.sm,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingTitle: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  statusText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.sm,
    color: 'white',
  },
  listingDescription: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
  },
  listingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  detailText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
  },
  price: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.primary,
  },
  location: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.xs,
  },
  emptyText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  addListingButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  addListingButtonText: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: 'white',
  },
  errorText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.error,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  retryButtonText: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: 'white',
  },
}); 
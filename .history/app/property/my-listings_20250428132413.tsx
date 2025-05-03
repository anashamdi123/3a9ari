import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { useAuthContext } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { Property } from '@/lib/supabase';
import { Edit2, Trash2 } from 'lucide-react-native';

export default function MyListingsScreen() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const [listings, setListings] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل العقارات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    Alert.alert(
      'حذف العقار',
      'هل أنت متأكد من رغبتك في حذف هذا العقار؟',
      [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'حذف',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', propertyId);

              if (error) throw error;
              setListings(listings.filter(listing => listing.id !== propertyId));
              Alert.alert('نجاح', 'تم حذف العقار بنجاح');
            } catch (error) {
              Alert.alert('خطأ', 'حدث خطأ أثناء حذف العقار');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Property }) => (
    <View style={styles.listingCard}>
      <View style={styles.listingInfo}>
        <Text style={styles.listingTitle}>{item.title}</Text>
        <Text style={styles.listingPrice}>{item.price} {Theme.CURRENCY}</Text>
        <Text style={styles.listingLocation}>{item.location}</Text>
        <Text style={styles.listingStatus}>
          {item.status === 'pending' ? 'قيد المراجعة' :
           item.status === 'approved' ? 'تمت الموافقة' : 'مرفوض'}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => router.push(`/property/edit/${item.id}`)}
        >
          <Edit2 size={20} color={Theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Trash2 size={20} color={Theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>عقاراتي</Text>
      </View>

      {listings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>لا توجد عقارات مضافة</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/new-listing')}
          >
            <Text style={styles.addButtonText}>إضافة عقار جديد</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.md,
  },
  header: {
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  headerTitle: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xl,
    color: Theme.colors.text.primary,
    textAlign: 'center',
  },
  list: {
    padding: Theme.spacing.lg,
  },
  listingCard: {
    backgroundColor: Theme.colors.background.main,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  listingPrice: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  listingLocation: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  listingStatus: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Theme.spacing.sm,
  },
  editButton: {
    backgroundColor: Theme.colors.background.light,
  },
  deleteButton: {
    backgroundColor: Theme.colors.background.light,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  emptyText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.xl,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  addButtonText: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: 'white',
  },
}); 
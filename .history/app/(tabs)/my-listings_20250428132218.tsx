import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { useAuthContext } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { Property } from '@/lib/supabase';
import { Edit2, Trash2, Eye } from 'lucide-react-native';
import { formatCurrency } from '@/utils/format';

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
      console.error('Error fetching listings:', error);
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
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
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
              console.error('Error deleting property:', error);
              Alert.alert('خطأ', 'حدث خطأ أثناء حذف العقار');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (propertyId: string) => {
    router.push(`/edit-listing/${propertyId}`);
  };

  const handleView = (propertyId: string) => {
    router.push(`/property/${propertyId}`);
  };

  const renderItem = ({ item }: { item: Property }) => (
    <View style={styles.listingCard}>
      <View style={styles.listingHeader}>
        <Text style={styles.listingTitle}>{item.title}</Text>
        <Text style={styles.listingPrice}>{formatCurrency(item.price)}</Text>
      </View>

      <Text style={styles.listingLocation}>{item.location}</Text>
      <Text style={styles.listingSize}>{item.size} {Theme.constants.AREA_UNIT}</Text>

      <View style={styles.listingStatus}>
        <Text style={[
          styles.statusText,
          { color: item.status === 'approved' ? Theme.colors.success : 
                   item.status === 'rejected' ? Theme.colors.error : 
                   Theme.colors.warning }
        ]}>
          {item.status === 'approved' ? 'معتمد' :
           item.status === 'rejected' ? 'مرفوض' :
           'قيد المراجعة'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => handleView(item.id)}
        >
          <Eye size={20} color={Theme.colors.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item.id)}
        >
          <Edit2 size={20} color={Theme.colors.text.primary} />
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>عقاراتي</Text>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>لا توجد عقارات مضافة</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/new-listing')}
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  loadingText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
  },
  emptyText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.lg,
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
  list: {
    padding: Theme.spacing.lg,
  },
  listingCard: {
    backgroundColor: 'white',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  listingTitle: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.primary,
    flex: 1,
  },
  listingPrice: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.primary,
  },
  listingLocation: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  listingSize: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
  },
  listingStatus: {
    marginTop: Theme.spacing.sm,
    marginBottom: Theme.spacing.md,
  },
  statusText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    paddingTop: Theme.spacing.md,
  },
  actionButton: {
    padding: Theme.spacing.sm,
    marginLeft: Theme.spacing.md,
    borderRadius: Theme.borderRadius.sm,
  },
  viewButton: {
    backgroundColor: Theme.colors.background.light,
  },
  editButton: {
    backgroundColor: Theme.colors.background.light,
  },
  deleteButton: {
    backgroundColor: Theme.colors.background.light,
  },
}); 
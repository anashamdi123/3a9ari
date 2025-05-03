import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { useAuthContext } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { Property } from '@/lib/supabase';
import { Plus, Edit2, Trash2 } from 'lucide-react-native';
import { Button } from '@/components/Button';

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
    } catch (error: any) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل العقارات');
      console.error('Error fetching listings:', error);
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
            } catch (error: any) {
              Alert.alert('خطأ', 'حدث خطأ أثناء حذف العقار');
              console.error('Error deleting property:', error);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Property }) => (
    <View style={styles.propertyCard}>
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle}>{item.title}</Text>
        <Text style={styles.propertyPrice}>{item.price} {Theme.CURRENCY}</Text>
        <Text style={styles.propertyLocation}>{item.location}</Text>
        <Text style={styles.propertyStatus}>
          الحالة: {item.status === 'pending' ? 'قيد المراجعة' : item.status === 'approved' ? 'تمت الموافقة' : 'مرفوض'}
        </Text>
      </View>
      <View style={styles.propertyActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push(`/property/edit/${item.id}`)}
        >
          <Edit2 size={20} color={Theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
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
        <Button
          title="إضافة عقار"
          onPress={() => router.push('/property/add')}
          style={styles.addButton}
        >
          <Plus size={20} color="white" />
        </Button>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      ) : listings.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>لا توجد عقارات مضافة</Text>
          <Button
            title="إضافة عقار جديد"
            onPress={() => router.push('/property/add')}
            style={styles.addFirstButton}
          />
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  list: {
    padding: Theme.spacing.lg,
  },
  propertyCard: {
    backgroundColor: 'white',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  propertyInfo: {
    flex: 1,
  },
  propertyTitle: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  propertyPrice: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.xs,
  },
  propertyLocation: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  propertyStatus: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
  },
  propertyActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: Theme.spacing.sm,
    marginLeft: Theme.spacing.sm,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  loadingText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
  },
  emptyText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.lg,
    textAlign: 'center',
  },
  addFirstButton: {
    width: '100%',
    maxWidth: 300,
  },
}); 
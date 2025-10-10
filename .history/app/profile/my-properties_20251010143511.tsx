import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, TouchableOpacity, Alert, Modal, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { useAuthContext } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { Property } from '@/lib/supabase';
import { X, Trash2 } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { UserPropertyCard } from '@/components/UserPropertyCard';
import { Header } from '@/components/Header';
import { useToast } from '@/context/ToastContext';

type StatusGroup = {
  status: string;
  properties: Property[];
  color: string;
  text: string;
};

export default function MyListingsScreen() {
  const router = useRouter();
  const { profile } = useAuthContext();
  const { showToast } = useToast();
  const [listings, setListings] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    if (!profile?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      showToast('حدث خطأ أثناء تحميل العقارات', 'error');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleEdit = (property: Property) => {
    router.push({
      pathname: '/new-listing',
      params: { propertyId: property.id },
    });
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
              setIsLoading(true);
              const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', propertyId);

              if (error) throw error;
              showToast('تم حذف العقار بنجاح', 'success');
              fetchListings();
            } catch (error: any) {
              showToast('حدث خطأ أثناء حذف العقار', 'error');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusGroups = (properties: Property[]): StatusGroup[] => {
    const groups: { [key: string]: Property[] } = {
      pending: [],
      approved: [],
      rejected: []
    };

    properties.forEach(property => {
      if (groups[property.status]) {
        groups[property.status].push(property);
      }
    });

    return [
      {
        status: 'pending',
        properties: groups.pending,
        color: Theme.colors.warning,
        text: 'قيد المراجعة'
      },
      {
        status: 'approved',
        properties: groups.approved,
        color: Theme.colors.success,
        text: 'مقبول'
      },
      {
        status: 'rejected',
        properties: groups.rejected,
        color: Theme.colors.error,
        text: 'مرفوض'
      }
    ].filter(group => group.properties.length > 0);
  };

  const renderStatusGroup = ({ item }: { item: StatusGroup }) => {
    return (
      <View style={styles.statusGroup}>
        <View style={[styles.statusBadge, { backgroundColor: item.color }]}>
          <Text style={styles.statusText}>{item.text}</Text>
        </View>
        <FlatList
          data={item.properties}
          renderItem={({ item: property }) => (
            <View style={styles.propertyItem}>
              <UserPropertyCard 
                property={property}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            </View>
          )}
          keyExtractor={(property) => property.id}
          contentContainerStyle={styles.propertiesList}
        />
      </View>
    );
  };

  const windowWidth = Dimensions.get('window').width;
  const isTablet = windowWidth >= 768;
  const isDesktop = windowWidth >= 1024;

  // Loading block similar to index.tsx
  if (isLoading && listings.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="عقاراتي" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="عقاراتي" />
      <View style={styles.modalContent}>
        <FlatList
          data={getStatusGroups(listings)}
          renderItem={renderStatusGroup}
          keyExtractor={(group) => group.status}
          contentContainerStyle={[
            styles.groupsList,
            isTablet && styles.groupsListTablet,
            isDesktop && styles.groupsListDesktop
          ]}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchListings();
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isLoading ? 'جاري التحميل...' : 'لم تقم بإضافة أي عقارات بعد'}
              </Text>
              {!isLoading && (
                <Button
                  title="إضافة عقار جديد"
                  onPress={() => router.push('/new-listing')}
                  size="large"
                  style={styles.addButton}
                />
              )}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.light,
  },
  modalContent: {
    flex: 1,
    backgroundColor: Theme.colors.background.light,
  },
  searchContainer: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    width: '100%',
    backgroundColor: Theme.colors.background.light,
  },
  placeholderContainer: {
    backgroundColor: Theme.colors.background.card,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: Theme.colors.text.light,
    fontSize: Theme.fontSizes.lg,
    fontFamily: 'Tajawal-Medium',
  },
  groupsList: {
    padding: Theme.spacing.md,
  },
  groupsListTablet: {
    padding: Theme.spacing.lg,
  },
  groupsListDesktop: {
    padding: Theme.spacing.xl,
    maxWidth: 1440,
    alignSelf: 'center',
    width: '100%',
  },
  statusGroup: {
    marginBottom: Theme.spacing.xl,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.md,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: 'white',
  },
  propertiesList: {
    paddingTop: Theme.spacing.sm,
  },
  propertyItem: {
    marginBottom: Theme.spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: Theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
  },
  addButton: {
    width: '100%',
    maxWidth: 300,
  },
}); 
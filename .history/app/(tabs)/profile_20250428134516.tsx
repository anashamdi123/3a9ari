import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Alert, TextInput, ActivityIndicator, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useAuthContext } from '@/context/auth-context';
import { LogOut, CreditCard as Edit3, Clipboard, User as UserIcon, Save, X, Home, MapPin, Ruler, Phone } from 'lucide-react-native';
import { supabase, Property } from '@/lib/supabase';
import { I18nManager } from 'react-native';
import { CURRENCY, AREA_UNIT } from '@/constants/config';

// Force RTL layout
I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

export default function ProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, profile, logout, refreshProfile } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [userListings, setUserListings] = useState<Property[]>([]);
  const [editedProfile, setEditedProfile] = useState({
    full_name: profile?.full_name || '',
  });
  
  useEffect(() => {
    if (isAuthenticated && profile?.id) {
      fetchUserListings();
    }
  }, [isAuthenticated, profile?.id]);
  
  const fetchUserListings = async () => {
    if (!profile?.id) return;
    
    setIsLoadingListings(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setUserListings(data || []);
    } catch (error) {
      console.error('Error fetching user listings:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل العقارات');
    } finally {
      setIsLoadingListings(false);
    }
  };
  
  const handleLogin = () => {
    router.push('/auth/login');
  };
  
  const handleLogout = async () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
      [
        {
          text: 'إلغاء',
          style: 'cancel',
        },
        {
          text: 'تسجيل الخروج',
          onPress: async () => {
            await logout();
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleEditProfile = () => {
    setEditedProfile({
      full_name: profile?.full_name || '',
    });
    setIsEditing(true);
  };
  
  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: editedProfile.full_name })
        .eq('id', profile.id);
        
      if (error) throw error;
      
      await refreshProfile();
      setIsEditing(false);
      Alert.alert('نجاح', 'تم تحديث الملف الشخصي بنجاح');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الملف الشخصي');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
  };
  
  const handleMyListings = () => {
    router.push('/(tabs)/my-listings' as any);
  };
  
  const renderPropertyItem = ({ item }: { item: Property }) => (
    <TouchableOpacity 
      style={styles.propertyCard}
      onPress={() => router.push(`/property/${item.id}` as any)}
    >
      {item.images && item.images[0] ? (
        <Image 
          source={{ uri: item.images[0] }} 
          style={styles.propertyImage}
        />
      ) : (
        <View style={[styles.propertyImage, styles.noImage]}>
          <Home size={24} color={Theme.colors.text.secondary} />
        </View>
      )}
      <View style={styles.propertyInfo}>
        <Text style={styles.propertyTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.propertyDetails}>
          <View style={styles.propertyDetail}>
            <MapPin size={16} color={Theme.colors.text.secondary} />
            <Text style={styles.propertyDetailText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
          <View style={styles.propertyDetail}>
            <Ruler size={16} color={Theme.colors.text.secondary} />
            <Text style={styles.propertyDetailText}>
              {item.size} {AREA_UNIT}
            </Text>
          </View>
        </View>
        <View style={styles.propertyFooter}>
          <Text style={styles.propertyPrice}>
            {item.price.toLocaleString()} {CURRENCY}
          </Text>
          <View style={[
            styles.statusBadge,
            item.status === 'approved' && styles.statusApproved,
            item.status === 'rejected' && styles.statusRejected,
            item.status === 'pending' && styles.statusPending,
          ]}>
            <Text style={styles.statusText}>
              {item.status === 'approved' ? 'معتمد' :
               item.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <UserIcon size={64} color={Theme.colors.primary} />
          <Text style={styles.title}>الملف الشخصي</Text>
          <Text style={styles.message}>
            قم بتسجيل الدخول للوصول إلى ملفك الشخصي وإدارة حسابك
          </Text>
          <Button
            title="تسجيل الدخول"
            onPress={handleLogin}
            style={styles.loginButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الملف الشخصي</Text>
      </View>
      
      <View style={styles.profileContainer}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <UserIcon size={40} color="white" />
          </View>
          <View style={styles.profileInfo}>
            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.input}
                  value={editedProfile.full_name}
                  onChangeText={(text) => setEditedProfile({ ...editedProfile, full_name: text })}
                  placeholder="الاسم الكامل"
                  placeholderTextColor={Theme.colors.text.secondary}
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity 
                    style={[styles.editButton, styles.saveButton]} 
                    onPress={handleSaveProfile}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Save size={20} color="white" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.editButton, styles.cancelButton]} 
                    onPress={handleCancelEdit}
                  >
                    <X size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Text style={styles.profileName}>{profile?.full_name || 'المستخدم'}</Text>
                <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
              </>
            )}
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={handleEditProfile}
          disabled={isEditing}
        >
          <Edit3 size={20} color={Theme.colors.text.primary} />
          <Text style={styles.menuItemText}>تعديل الملف الشخصي</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleMyListings}>
          <Clipboard size={20} color={Theme.colors.text.primary} />
          <Text style={styles.menuItemText}>عقاراتي</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <LogOut size={20} color={Theme.colors.error} />
          <Text style={[styles.menuItemText, styles.logoutText]}>تسجيل الخروج</Text>
        </TouchableOpacity>
        
        <View style={styles.listingsSection}>
          <Text style={styles.sectionTitle}>عقاراتي</Text>
          {isLoadingListings ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Theme.colors.primary} />
            </View>
          ) : userListings.length > 0 ? (
            <FlatList
              data={userListings}
              renderItem={renderPropertyItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listingsContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Home size={48} color={Theme.colors.text.secondary} />
              <Text style={styles.emptyText}>لا توجد عقارات مضافة بعد</Text>
              <Button
                title="إضافة عقار جديد"
                onPress={() => router.push('/add-property' as any)}
                style={styles.addButton}
              />
            </View>
          )}
        </View>
      </View>
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
  profileContainer: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xxl,
    color: 'white',
  },
  profileInfo: {
    marginRight: Theme.spacing.lg,
    flex: 1,
  },
  editContainer: {
    flex: 1,
  },
  input: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingVertical: Theme.spacing.sm,
    marginBottom: Theme.spacing.sm,
  },
  editButtons: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  editButton: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: Theme.colors.primary,
  },
  cancelButton: {
    backgroundColor: Theme.colors.error,
  },
  profileName: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  profileEmail: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: 'white',
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
  },
  menuItemText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    marginRight: Theme.spacing.md,
  },
  logoutText: {
    color: Theme.colors.error,
  },
  title: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xxl,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  message: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  loginButton: {
    width: '100%',
    maxWidth: 300,
  },
  listingsSection: {
    flex: 1,
    marginTop: Theme.spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  listingsContainer: {
    paddingBottom: Theme.spacing.xl,
  },
  propertyCard: {
    backgroundColor: 'white',
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  propertyImage: {
    width: '100%',
    height: 200,
    backgroundColor: Theme.colors.background.light,
  },
  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertyInfo: {
    padding: Theme.spacing.md,
  },
  propertyTitle: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  propertyDetails: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  propertyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  },
  propertyDetailText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
  },
  propertyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  propertyPrice: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.primary,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
  },
  statusApproved: {
    backgroundColor: Theme.colors.success + '20',
  },
  statusRejected: {
    backgroundColor: Theme.colors.error + '20',
  },
  statusPending: {
    backgroundColor: Theme.colors.warning + '20',
  },
  statusText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  emptyText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  addButton: {
    width: '100%',
    maxWidth: 300,
  },
});
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, TextInput, FlatList, ScrollView, Dimensions, Modal, Pressable, RefreshControl, Alert as RNAlert } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { useAuthContext } from '@/context/auth-context';
import { LogOut, CreditCard as Edit3, Clipboard, User as UserIcon, ArrowLeft, Trash2, X, Eye, EyeOff } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useProperties } from '@/hooks/useProperties';
import { UserPropertyCard } from '@/components/UserPropertyCard';
import { useToast } from '@/context/ToastContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Property } from '@/lib/supabase';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

type StatusGroup = {
  status: string;
  properties: any[];
  color: string;
  text: string;
};

export default function ProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, profile, logout, refreshProfile } = useAuthContext();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { properties: myProperties, loading: loadingProperties, refreshing, handleRefresh } = useProperties({
    ownerId: profile?.id
  });
  
  // Update fullName when profile changes
  useEffect(() => {
    setFullName(profile?.full_name || '');
  }, [profile?.full_name]);
  
  // Check if the name has changed
  const hasNameChanged = fullName.trim() !== (profile?.full_name || '').trim();
  const isNameValid = fullName.trim().length >= 3 && fullName.trim().length <= 30;
  const canSave = hasNameChanged && isNameValid;
  
  const handleLogin = () => {
    router.push('/auth/login');
  };
  
  const handleLogout = () => {
    RNAlert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد',
          style: 'destructive',
          onPress: () => handleLogoutConfirm(),
        },
      ]
    );
  };
  
  const handleLogoutConfirm = async () => {
            try {
              await logout();
              showToast('تم تسجيل الخروج بنجاح', 'success');
              setTimeout(() => {
                router.replace('/(tabs)');
              }, 1500);
            } catch (error) {
              showToast('فشل تسجيل الخروج', 'error');
            }
  };
  
  const handleEditProfile = () => {
    router.push('../profile/edit-profile');
  };

  const handleChangePassword = () => {
    router.push('../profile/change-password');
  };

  const handleSavePassword = async () => {
    try {
      if (!currentPassword.trim()) {
        setTimeout(() => showToast('يرجى إدخال كلمة المرور الحالية', 'error'), 300);
        return;
      }
      if (!newPassword.trim()) {
        setTimeout(() => showToast('يرجى إدخال كلمة المرور الجديدة', 'error'), 300);
        return;
      }
      if (newPassword.length < 6) {
        setTimeout(() => showToast('يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل', 'error'), 300);
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setTimeout(() => showToast('كلمات المرور الجديدة غير متطابقة', 'error'), 300);
        return;
      }
      
      setIsLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setTimeout(() => showToast('تم تغيير كلمة المرور بنجاح', 'success'), 300);
    } catch (error: any) {
      setTimeout(() => showToast(error.message || 'فشل تغيير كلمة المرور', 'error'), 300);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (!fullName.trim()) {
        showToast('يرجى إدخال الاسم الكامل', 'error');
        return;
      }
      if (fullName.trim().length < 3 || fullName.trim().length > 30) {
        showToast('يجب أن يتكون الاسم من 3 إلى 30 حرفًا', 'error');
        return;
      }
      
      setIsLoading(true);
      
      const { error } = await supabase
        .from('users')
        .update({ full_name: fullName })
        .eq('id', profile?.id);
      
      if (error) throw error;
      
      await refreshProfile();
      showToast('تم تحديث الملف الشخصي بنجاح', 'success');
    } catch (error: any) {
      console.error('فشل تحديث الملف الشخصي', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMyListings = () => {
    router.push('../profile/my-properties');
  };

  const getStatusColor = (status: string) => {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'مقبول';
      case 'pending':
        return 'قيد المراجعة';
      case 'rejected':
        return 'مرفوض';
      default:
        return status;
    }
  };

  const getStatusGroups = (properties: any[]): StatusGroup[] => {
    const groups: { [key: string]: any[] } = {
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

  const handleDeleteProperty = (propertyId: string) => {
    RNAlert.alert(
      'حذف العقار',
      'هل أنت متأكد من رغبتك في حذف هذا العقار؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => handleDeletePropertyConfirm(propertyId),
        },
      ]
    );
  };

  const handleDeletePropertyConfirm = async (propertyId: string) => {
            try {
              setIsLoading(true);
              const { error } = await supabase
                .from('properties')
                .delete()
                .eq('id', propertyId);
              if (error) throw error;
              showToast('تم حذف العقار بنجاح', 'success');
              handleRefresh();
            } catch (error: any) {
              showToast('فشل حذف العقار', 'error');
            } finally {
              setIsLoading(false);
      }
  };

  const handleEditProperty = (property: Property) => {
    router.push(`/property/${property.id}`);
  };

  const renderStatusGroup = ({ item }: { item: StatusGroup }) => {
    return (
      <View style={styles.statusGroup}>
        <View style={[styles.statusHeader, { backgroundColor: item.color + '15' }]}>
          <View style={[styles.statusBadge, { backgroundColor: item.color }]}>
            <Text style={styles.statusText}>{item.text}</Text>
          </View>
          <Text style={styles.statusCount}>{item.properties.length} عقار</Text>
        </View>
        <View style={styles.propertiesList}>
          {item.properties.map((property) => (
            <View 
              key={property.id} 
              style={styles.propertyItem}
            >
              <UserPropertyCard 
                property={property}
                onEdit={handleEditProperty}
                onDelete={handleDeleteProperty}
                onCardPress={() => setShowProperties(false)}
              />
            </View>
          ))}
        </View>
      </View>
    );
  };
  
  const windowWidth = Dimensions.get('window').width;
  const isTablet = windowWidth >= 768;
  const isDesktop = windowWidth >= 1024;

  // Calculate number of columns based on screen size
  const numColumns = isDesktop ? 4 : isTablet ? 3 : 2;

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="الملف الشخصي" />
        <View style={styles.centerContainer}>
          <View style={styles.iconContainer}>
            <UserIcon size={64} color={Theme.colors.primary} />
          </View>
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
      <Header title="الملف الشخصي" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.full_name ? profile.full_name[0].toUpperCase() : '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.full_name || 'المستخدم'}</Text>
              <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
              {profile?.phone_number && (
                <Text style={styles.profileEmail}>{profile.phone_number}</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleEditProfile}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: Theme.colors.primary + '15' }]}>
                <Edit3 size={24} color={Theme.colors.primary} />
              </View>
              <Text style={styles.menuItemText}>تعديل الملف الشخصي</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleChangePassword}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: Theme.colors.warning + '15' }]}>
                <UserIcon size={24} color={Theme.colors.warning} />
              </View>
              <Text style={styles.menuItemText}>تغيير كلمة المرور</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleMyListings}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: Theme.colors.success + '15' }]}>
                <Clipboard size={24} color={Theme.colors.success} />
              </View>
              <Text style={styles.menuItemText}>
                عقاراتي ({loadingProperties ? '...' : myProperties.length})
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.logoutItem]} 
            onPress={handleLogout}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: Theme.colors.error + '15' }]}>
                <LogOut size={24} color={Theme.colors.error} />
              </View>
              <Text style={[styles.menuItemText, styles.logoutText]}>تسجيل الخروج</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.main,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Theme.colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.lg,
    ...Theme.shadows.medium,
  },
  profileHeader: {
    marginBottom: Theme.spacing.md,
    marginTop: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.card,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.medium,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xxl,
    color: Theme.colors.primary,
  },
  profileInfo: {
    marginLeft: Theme.spacing.sm,
    flex: 1,
  },
  profileName: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xl,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  profileEmail: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
  },
  menuContainer: {
    padding: Theme.spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.card,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.small,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },  
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  menuItemText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    flex: 1,
  },
  logoutItem: {
    marginTop: Theme.spacing.lg,
    backgroundColor: Theme.colors.error + '15',
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
  loadingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Theme.colors.primary,
    borderTopColor: 'transparent',
    alignSelf: 'center',
    marginLeft: Theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Theme.colors.overlay,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Theme.colors.background.main,
    borderTopLeftRadius: Theme.borderRadius.xl,
    borderTopRightRadius: Theme.borderRadius.xl,
    minHeight: '80%',
    maxHeight: '90%',
    paddingBottom: Theme.spacing.xl,
    width: '100%',
    maxWidth: 480,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  modalTitle: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xl,
    color: Theme.colors.text.primary,
  },
  closeButton: {
    padding: Theme.spacing.sm,
  },
  modalBody: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xl,
  },
  modalFooter: {
    padding: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  inputContainer: {
    marginBottom: Theme.spacing.lg,
  },
  inputLabel: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.sm,
  },
  input: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background.card,
  },
  inputValue: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background.card,
    borderRadius: Theme.borderRadius.md,
  },
  saveButton: {
    width: '100%',
  },
  groupsList: {
    padding: Theme.spacing.sm,
    paddingBottom: Theme.spacing.xl,
    width: '100%',
  },
  groupsListTablet: {
    padding: Theme.spacing.md,
    paddingBottom: Theme.spacing.xxl,
    width: '100%',
  },
  groupsListDesktop: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
    maxWidth: 1440,
    alignSelf: 'center',
    width: '100%',
  },
  statusGroup: {
    marginBottom: Theme.spacing.xl,
    backgroundColor: Theme.colors.background.card,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    ...Theme.shadows.small,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.lg,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  statusBadge: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
  },
  statusText: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
  },
  statusCount: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
  },
  propertiesList: {
    padding: Theme.spacing.sm,
    paddingBottom: Theme.spacing.xl,
    width: '100%',
  },
  propertyItem: {
    width: '100%',
    maxWidth: 480,
    paddingHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
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
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingLeft: 40,
  },
  eyeIcon: {
    position: 'absolute',
    left: Theme.spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: Theme.spacing.xs,
  },
});

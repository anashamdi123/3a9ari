import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, TextInput, Alert, FlatList, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useAuthContext } from '@/context/auth-context';
import { LogOut, CreditCard as Edit3, Clipboard, User as UserIcon } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useProperties } from '@/hooks/useProperties';
import { PropertyCard } from '@/components/PropertyCard';
import { Toast } from '@/components/Toast';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function ProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, profile, logout, refreshProfile } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showProperties, setShowProperties] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const { properties: myProperties, loading: loadingProperties, refreshing, handleRefresh } = useProperties({
    ownerId: profile?.id
  });
  
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
            try {
              await logout();
              setToast({ message: 'تم تسجيل الخروج بنجاح', type: 'success' });
              setTimeout(() => {
                router.replace('/(tabs)');
              }, 1500);
            } catch (error) {
              setToast({ message: 'فشل تسجيل الخروج', type: 'error' });
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleEditProfile = async () => {
    if (isEditing) {
      try {
        setIsLoading(true);
        
        const { error } = await supabase
          .from('users')
          .update({ full_name: fullName })
          .eq('id', profile?.id);
        
        if (error) throw error;
        
        await refreshProfile();
        setIsEditing(false);
      } catch (error: any) {
        Alert.alert('خطأ', 'فشل تحديث الملف الشخصي');
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsEditing(true);
    }
  };
  
  const handleMyListings = () => {
    setShowProperties(!showProperties);
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

  const renderPropertyItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.propertyItem}>
        <PropertyCard property={item} />
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
    );
  };
  
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
      {!showProperties ? (
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.full_name ? profile.full_name[0].toUpperCase() : '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              {isEditing ? (
                <TextInput
                  style={styles.nameInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="أدخل اسمك الكامل"
                  placeholderTextColor={Theme.colors.text.light}
                />
              ) : (
                <Text style={styles.profileName}>{profile?.full_name || 'المستخدم'}</Text>
              )}
              <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={handleEditProfile}
            disabled={isLoading}
          >
            <Edit3 size={20} color={Theme.colors.text.primary} />
            <Text style={styles.menuItemText}>
              {isEditing ? 'حفظ التغييرات' : 'تعديل الملف الشخصي'}
            </Text>
            {isLoading && (
              <View style={styles.loadingIndicator} />
            )}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleMyListings}>
            <Clipboard size={20} color={Theme.colors.text.primary} />
            <Text style={styles.menuItemText}>
              عقاراتي ({loadingProperties ? '...' : myProperties.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <LogOut size={20} color={Theme.colors.error} />
            <Text style={[styles.menuItemText, styles.logoutText]}>تسجيل الخروج</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.propertiesContainer}>
          <FlatList
            data={myProperties}
            renderItem={renderPropertyItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.propertiesList}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {loadingProperties ? 'جاري التحميل...' : 'لم تقم بإضافة أي عقارات بعد'}
                </Text>
              </View>
            }
            ListHeaderComponent={
              <TouchableOpacity 
                style={styles.backButton}
                onPress={handleMyListings}
              >
                <Text style={styles.backButtonText}>رجوع للملف الشخصي</Text>
              </TouchableOpacity>
            }
          />
        </View>
      )}
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
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
  profileContainer: {
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
  profileName: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  nameInput: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.primary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.sm,
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
  logoutItem: {
    marginTop: Theme.spacing.lg,
    backgroundColor: Theme.colors.error + '10',
  },
  menuItemText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    marginRight: Theme.spacing.md,
    flex: 1,
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
  propertiesContainer: {
    flex: 1,
  },
  propertiesList: {
    padding: Theme.spacing.md,
  },
  propertyItem: {
    position: 'relative',
    marginBottom: Theme.spacing.md,
    backgroundColor: 'transparent',
  },
  statusBadge: {
    position: 'absolute',
    top: Theme.spacing.md,
    right: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    zIndex: 1,
  },
  statusText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.sm,
    color: 'white',
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
  backButton: {
    backgroundColor: Theme.colors.background.main,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.lg,
  },
  backButtonText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.primary,
    textAlign: 'center',
  },
});

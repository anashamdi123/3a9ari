import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, TextInput, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useAuthContext } from '@/context/auth-context';
import { LogOut, CreditCard as Edit3, Clipboard, User as UserIcon } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useProperties } from '@/hooks/useProperties';
import { PropertyCard } from '@/components/PropertyCard';
import { Toast } from '@/components/Toast';

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
        return 'نشط';
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
      <View style={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <UserIcon size={64} color={Theme.colors.primary} />
          </View>
          <Text style={styles.name}>{profile?.full_name || 'مستخدم'}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>حسابي</Text>
          <View style={styles.menuItem}>
            <Edit3 size={24} color={Theme.colors.text.secondary} />
            <Text style={styles.menuText}>تعديل الملف الشخصي</Text>
          </View>
          <View style={styles.menuItem}>
            <Clipboard size={24} color={Theme.colors.text.secondary} />
            <Text style={styles.menuText}>عقاراتي</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإعدادات</Text>
          <TouchableOpacity style={styles.menuItem} onPress={logout}>
            <LogOut size={24} color={Theme.colors.error} />
            <Text style={[styles.menuText, { color: Theme.colors.error }]}>تسجيل الخروج</Text>
          </TouchableOpacity>
        </View>
      </View>
      
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
  content: {
    flex: 1,
    padding: Theme.spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.xl,
  },
  name: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.primary,
  },
  email: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.lg,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: 'white',
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
  },
  menuText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    marginRight: Theme.spacing.md,
    flex: 1,
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
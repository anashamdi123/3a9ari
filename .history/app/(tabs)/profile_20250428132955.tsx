import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useAuthContext } from '@/context/auth-context';
import { LogOut, CreditCard as Edit3, Clipboard, User as UserIcon, Phone, Mail, Calendar, ChevronLeft } from 'lucide-react-native';
import { I18nManager } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, profile, logout, isLoading } = useAuthContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
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
              setIsLoggingOut(true);
              await logout();
              router.replace('/');
            } catch (error) {
              Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الخروج. يرجى المحاولة مرة أخرى.');
            } finally {
              setIsLoggingOut(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleEditProfile = () => {
    router.push('/profile/edit');
  };
  
  const handleMyListings = () => {
    router.push('/profile/listings');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
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
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.full_name ? profile.full_name[0].toUpperCase() : '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile?.full_name || 'المستخدم'}</Text>
              <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Mail size={20} color={Theme.colors.text.secondary} style={styles.infoIcon} />
              <Text style={styles.infoText}>{profile?.email || 'لم يتم تحديد البريد الإلكتروني'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Calendar size={20} color={Theme.colors.text.secondary} style={styles.infoIcon} />
              <Text style={styles.infoText}>
                تاريخ التسجيل: {profile?.created_at ? formatDate(profile.created_at) : 'غير متوفر'}
              </Text>
            </View>
          </View>
          
          <View style={styles.menuSection}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
              <View style={styles.menuItemContent}>
                <Edit3 size={20} color={Theme.colors.text.primary} style={styles.menuIcon} />
                <Text style={styles.menuItemText}>تعديل الملف الشخصي</Text>
              </View>
              <ChevronLeft size={20} color={Theme.colors.text.secondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleMyListings}>
              <View style={styles.menuItemContent}>
                <Clipboard size={20} color={Theme.colors.text.primary} style={styles.menuIcon} />
                <Text style={styles.menuItemText}>عقاراتي</Text>
              </View>
              <ChevronLeft size={20} color={Theme.colors.text.secondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.logoutItem]} 
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <View style={styles.menuItemContent}>
                <LogOut size={20} color={Theme.colors.error} style={styles.menuIcon} />
                <Text style={[styles.menuItemText, styles.logoutText]}>
                  {isLoggingOut ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}
                </Text>
              </View>
              <ChevronLeft size={20} color={Theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    padding: Theme.spacing.lg,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    padding: Theme.spacing.lg,
    backgroundColor: 'white',
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.sm,
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
  profileEmail: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
    ...Theme.shadows.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  infoIcon: {
    marginRight: Theme.spacing.md,
  },
  infoText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    flex: 1,
  },
  menuSection: {
    backgroundColor: 'white',
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
    ...Theme.shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: Theme.spacing.md,
  },
  menuItemText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
  },
  logoutItem: {
    borderBottomWidth: 0,
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
});
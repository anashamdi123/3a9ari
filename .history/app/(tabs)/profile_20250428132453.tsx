import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useAuthContext } from '@/context/auth-context';
import { LogOut, CreditCard as Edit3, Clipboard, User as UserIcon, Settings, Bell } from 'lucide-react-native';
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
    router.push('/auth/edit-profile');
  };
  
  const handleMyListings = () => {
    router.push('/property/my-listings');
  };

  const handleNotifications = () => {
    router.push('/notifications');
  };

  const handleSettings = () => {
    router.push('/settings');
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>الملف الشخصي</Text>
        </View>
        
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
          
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
              <Edit3 size={20} color={Theme.colors.text.primary} />
              <Text style={styles.menuItemText}>تعديل الملف الشخصي</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem} onPress={handleMyListings}>
              <Clipboard size={20} color={Theme.colors.text.primary} />
              <Text style={styles.menuItemText}>عقاراتي</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleNotifications}>
              <Bell size={20} color={Theme.colors.text.primary} />
              <Text style={styles.menuItemText}>الإشعارات</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
              <Settings size={20} color={Theme.colors.text.primary} />
              <Text style={styles.menuItemText}>الإعدادات</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.menuItem, styles.logoutButton]} 
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut size={20} color={Theme.colors.error} />
              <Text style={[styles.menuItemText, styles.logoutText]}>
                {isLoggingOut ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج'}
              </Text>
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
  scrollView: {
    flex: 1,
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
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
    backgroundColor: Theme.colors.background.main,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
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
    marginHorizontal: Theme.spacing.lg,
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
  menuContainer: {
    backgroundColor: Theme.colors.background.main,
    borderRadius: Theme.borderRadius.lg,
    overflow: 'hidden',
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
  menuItem: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  menuItemText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    marginHorizontal: Theme.spacing.md,
  },
  logoutButton: {
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
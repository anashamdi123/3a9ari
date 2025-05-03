import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useAuthContext } from '@/context/auth-context';
import { 
  LogOut, 
  CreditCard as Edit3, 
  Clipboard, 
  User as UserIcon,
  Camera,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { I18nManager } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, profile, logout, refreshProfile } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: profile?.full_name || '',
    phone_number: profile?.phone_number || '',
    location: profile?.location || ''
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
            await logout();
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('تنبيه', 'نحتاج إذن الوصول إلى معرض الصور لتحديث صورة الملف الشخصي');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setIsLoading(true);
        const file = {
          uri: result.assets[0].uri,
          name: `profile-${profile?.id}.jpg`,
          type: 'image/jpeg',
        };

        const { data, error } = await supabase.storage
          .from('profiles')
          .upload(`${profile?.id}/avatar.jpg`, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(`${profile?.id}/avatar.jpg`);

        await supabase
          .from('users')
          .update({ avatar_url: publicUrl })
          .eq('id', profile?.id);

        await refreshProfile();
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الصورة');
  
  const handleEditProfile = () => {
    // Navigate to edit profile screen (to be implemented)
    Alert.alert('تعديل الملف الشخصي', 'هذه الميزة قيد التطوير');
  };
  
  const handleMyListings = () => {
    // Navigate to my listings screen (to be implemented)
    Alert.alert('عقاراتي', 'هذه الميزة قيد التطوير');
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
        
        <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
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
});
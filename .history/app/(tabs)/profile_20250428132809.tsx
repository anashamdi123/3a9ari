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
        
        // Convert image to blob
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();
        
        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(`${profile?.id}/avatar.jpg`, blob, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(`${profile?.id}/avatar.jpg`);

        const { error: updateError } = await supabase
          .from('users')
          .update({ avatar_url: publicUrl })
          .eq('id', profile?.id);

        if (updateError) throw updateError;

        await refreshProfile();
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الصورة');
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('users')
        .update(editedProfile)
        .eq('id', profile?.id);

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
  
  const handleMyListings = () => {
    router.push('/(tabs)/my-listings' as any);
  };

  const renderProfileStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>12</Text>
        <Text style={styles.statLabel}>عقارات</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>45</Text>
        <Text style={styles.statLabel}>مفضلة</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>8</Text>
        <Text style={styles.statLabel}>زيارات</Text>
      </View>
    </View>
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
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>الملف الشخصي</Text>
          {!isEditing && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Edit2 size={20} color={Theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity 
              style={styles.avatarWrapper}
              onPress={handleImagePick}
              disabled={isLoading}
            >
              {profile?.avatar_url ? (
                <Image 
                  source={{ uri: profile.avatar_url }} 
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {profile?.full_name ? profile.full_name[0].toUpperCase() : '?'}
                  </Text>
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Camera size={16} color="white" />
              </View>
            </TouchableOpacity>
            <View style={styles.profileInfo}>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedProfile.full_name}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, full_name: text }))}
                  placeholder="الاسم الكامل"
                />
              ) : (
                <Text style={styles.profileName}>{profile?.full_name || 'المستخدم'}</Text>
              )}
              <Text style={styles.profileEmail}>{profile?.email || ''}</Text>
            </View>
          </View>

          {renderProfileStats()}

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Phone size={20} color={Theme.colors.text.secondary} />
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedProfile.phone_number}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, phone_number: text }))}
                  placeholder="رقم الهاتف"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoText}>{profile?.phone_number || 'لم يتم إضافة رقم الهاتف'}</Text>
              )}
            </View>

            <View style={styles.infoItem}>
              <MapPin size={20} color={Theme.colors.text.secondary} />
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedProfile.location}
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, location: text }))}
                  placeholder="الموقع"
                />
              ) : (
                <Text style={styles.infoText}>{profile?.location || 'لم يتم إضافة الموقع'}</Text>
              )}
            </View>

            <View style={styles.infoItem}>
              <Clock size={20} color={Theme.colors.text.secondary} />
              <Text style={styles.infoText}>
                {profile?.created_at ? `تاريخ التسجيل: ${new Date(profile.created_at).toLocaleDateString('ar-SA')}` : ''}
              </Text>
            </View>
          </View>

          {isEditing ? (
            <View style={styles.editActions}>
              <Button
                title="حفظ"
                onPress={handleSaveProfile}
                style={styles.saveButton}
                loading={isLoading}
              />
              <Button
                title="إلغاء"
                onPress={() => {
                  setIsEditing(false);
                  setEditedProfile({
                    full_name: profile?.full_name || '',
                    phone_number: profile?.phone_number || '',
                    location: profile?.location || ''
                  });
                }}
                type="outline"
                style={styles.cancelButton}
              />
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.menuItem} onPress={handleMyListings}>
                <Clipboard size={20} color={Theme.colors.text.primary} />
                <Text style={styles.menuItemText}>عقاراتي</Text>
                <ChevronLeft size={20} color={Theme.colors.text.secondary} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <LogOut size={20} color={Theme.colors.error} />
                <Text style={[styles.menuItemText, styles.logoutText]}>تسجيل الخروج</Text>
                <ChevronLeft size={20} color={Theme.colors.error} />
              </TouchableOpacity>
            </>
          )}
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  editButton: {
    position: 'absolute',
    right: Theme.spacing.lg,
  },
  profileContainer: {
    padding: Theme.spacing.lg,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  avatarWrapper: {
    position: 'relative',
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
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Theme.colors.primary,
    borderRadius: 12,
    padding: 4,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Theme.colors.background.main,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xl,
    color: Theme.colors.text.primary,
  },
  statLabel: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.xs,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Theme.colors.border,
  },
  infoContainer: {
    backgroundColor: Theme.colors.background.main,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  infoText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    marginRight: Theme.spacing.md,
  },
  input: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    paddingVertical: Theme.spacing.xs,
    flex: 1,
    textAlign: 'right',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.main,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
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
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.lg,
  },
  saveButton: {
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
});
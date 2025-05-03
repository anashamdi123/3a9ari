import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Alert, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useAuthContext } from '@/context/auth-context';
import { LogOut, CreditCard as Edit3, Clipboard, User as UserIcon, Mail, Phone, MapPin, Calendar } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { I18nManager } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, profile, logout, refreshProfile } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone_number: profile?.phone_number || '',
    location: profile?.location || '',
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
            router.replace('/');
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  const handleEditProfile = () => {
    setIsEditing(true);
  };
  
  const handleSaveProfile = async () => {
    if (!profile?.id) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          location: formData.location,
          updated_at: new Date().toISOString(),
        })
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
  
  const handleMyListings = () => {
    router.push('/profile/listings');
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
          
          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>الاسم الكامل</Text>
                <TextInput
                  style={styles.input}
                  value={formData.full_name}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, full_name: text }))}
                  placeholder="أدخل اسمك الكامل"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>رقم الهاتف</Text>
                <TextInput
                  style={styles.input}
                  value={formData.phone_number}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, phone_number: text }))}
                  placeholder="أدخل رقم هاتفك"
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>الموقع</Text>
                <TextInput
                  style={styles.input}
                  value={formData.location}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, location: text }))}
                  placeholder="أدخل موقعك"
                />
              </View>
              
              <View style={styles.buttonContainer}>
                <Button
                  title="إلغاء"
                  onPress={() => setIsEditing(false)}
                  style={styles.cancelButton}
                  variant="outline"
                />
                <Button
                  title="حفظ"
                  onPress={handleSaveProfile}
                  style={styles.saveButton}
                  loading={isLoading}
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Mail size={20} color={Theme.colors.text.secondary} />
                  <Text style={styles.infoText}>{profile?.email}</Text>
                </View>
                
                {profile?.phone_number && (
                  <View style={styles.infoRow}>
                    <Phone size={20} color={Theme.colors.text.secondary} />
                    <Text style={styles.infoText}>{profile.phone_number}</Text>
                  </View>
                )}
                
                {profile?.location && (
                  <View style={styles.infoRow}>
                    <MapPin size={20} color={Theme.colors.text.secondary} />
                    <Text style={styles.infoText}>{profile.location}</Text>
                  </View>
                )}
                
                <View style={styles.infoRow}>
                  <Calendar size={20} color={Theme.colors.text.secondary} />
                  <Text style={styles.infoText}>
                    تاريخ الانضمام: {new Date(profile?.created_at || '').toLocaleDateString('ar-SA')}
                  </Text>
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
  infoSection: {
    backgroundColor: 'white',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  infoRow: {
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
  editForm: {
    backgroundColor: 'white',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xl,
  },
  inputContainer: {
    marginBottom: Theme.spacing.lg,
  },
  inputLabel: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
  },
  input: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.sm,
    padding: Theme.spacing.md,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Theme.spacing.lg,
  },
  cancelButton: {
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  saveButton: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
});
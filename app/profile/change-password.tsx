import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { useAuthContext } from '@/context/auth-context';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuthContext();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSavePassword = async () => {
    try {
      if (!currentPassword.trim()) {
        showToast('يرجى إدخال كلمة المرور الحالية', 'error');
        return;
      }
      if (!newPassword.trim()) {
        showToast('يرجى إدخال كلمة المرور الجديدة', 'error');
        return;
      }
      if (newPassword.length < 6) {
        showToast('يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل', 'error');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        showToast('كلمات المرور الجديدة غير متطابقة', 'error');
        return;
      }
      if (!user?.email) {
        showToast('تعذر التحقق من المستخدم الحالي', 'error');
        return;
      }
      setIsLoading(true);
      // Validate current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) {
        showToast('كلمة المرور الحالية غير صحيحة', 'error');
        setIsLoading(false);
        return;
      }
      // If current password is valid, proceed to update
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      showToast('تم تغيير كلمة المرور بنجاح', 'success');
      setIsLoading(false);
      setTimeout(() => router.back(), 500);
    } catch (error: any) {
      showToast(error.message || 'فشل تغيير كلمة المرور', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="تغيير كلمة المرور" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>كلمة المرور الحالية</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="أدخل كلمة المرور الحالية"
              placeholderTextColor={Theme.colors.text.light}
              secureTextEntry={!showCurrentPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? (
                <EyeOff size={20} color={Theme.colors.text.secondary} />
              ) : (
                <Eye size={20} color={Theme.colors.text.secondary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>كلمة المرور الجديدة</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="أدخل كلمة المرور الجديدة"
              placeholderTextColor={Theme.colors.text.light}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff size={20} color={Theme.colors.text.secondary} />
              ) : (
                <Eye size={20} color={Theme.colors.text.secondary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>تأكيد كلمة المرور الجديدة</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              placeholder="أدخل كلمة المرور الجديدة مرة أخرى"
              placeholderTextColor={Theme.colors.text.light}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color={Theme.colors.text.secondary} />
              ) : (
                <Eye size={20} color={Theme.colors.text.secondary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.buttonRow}>
          <Button
            title="تغيير كلمة المرور"
            onPress={handleSavePassword}
            loading={isLoading}
            disabled={isLoading}
            size="large"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Theme.colors.background.main,
    padding: Theme.spacing.lg,
    justifyContent: 'center',
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
  buttonRow: {
    marginTop: Theme.spacing.xl,
  },
  button: {
    width: '100%',
  },
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background.main,
  },
}); 
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useAuthContext } from '@/context/auth-context';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/Header';

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuthContext();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone_number ? profile.phone_number.replace('+216 ', '') : '');
  const [isLoading, setIsLoading] = useState(false);

  const hasNameChanged = fullName.trim() !== (profile?.full_name || '').trim();
  const hasPhoneChanged = phoneNumber.trim() !== (profile?.phone_number ? profile.phone_number.replace('+216 ', '') : '');
  const isNameValid = fullName.trim().length >= 3 && fullName.trim().length <= 30;
  const isPhoneValid = validatePhoneNumber(phoneNumber);
  const canSave = (hasNameChanged || hasPhoneChanged) && isNameValid && isPhoneValid;

  function handlePhoneNumberChange(text: string) {
    // Remove any non-digit characters
    const digits = text.replace(/[^\d]/g, '');
    // Format the number with spaces
    let formattedNumber = '';
    if (digits.length > 0) {
      formattedNumber = digits.slice(0, 2);
      if (digits.length > 2) {
        formattedNumber += ' ' + digits.slice(2, 5);
      }
      if (digits.length > 5) {
        formattedNumber += ' ' + digits.slice(5, 8);
      }
    }
    setPhoneNumber(formattedNumber);
  }

  function validatePhoneNumber(phone: string): boolean {
    const digits = phone.replace(/[^\d]/g, '');
    if (digits.length !== 8) return false;
    const operatorCode = digits[0];
    if (!['2', '4', '5', '7', '9'].includes(operatorCode)) return false;
    return true;
  }

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
      if (!phoneNumber.trim()) {
        showToast('يرجى إدخال رقم الهاتف', 'error');
        return;
      }
      if (!validatePhoneNumber(phoneNumber)) {
        showToast('يرجى إدخال رقم هاتف تونسي صحيح', 'error');
        return;
      }
      setIsLoading(true);
      const fullPhoneNumber = `+216 ${phoneNumber}`;
      const { error } = await supabase
        .from('users')
        .update({ full_name: fullName, phone_number: fullPhoneNumber })
        .eq('id', profile?.id);
      if (error) throw error;
      await refreshProfile();
      showToast('تم تحديث الملف الشخصي بنجاح', 'success');
      setTimeout(() => router.back(), 500);
    } catch (error: any) {
      showToast('فشل تحديث الملف الشخصي', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title="تعديل الملف الشخصي" />
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>الاسم الكامل</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="أدخل اسمك الكامل"
            placeholderTextColor={Theme.colors.text.light}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
          <Text style={styles.inputValue}>{profile?.email || ''}</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>رقم الهاتف</Text>
          <View style={styles.phoneInputContainer}>
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixText}>+216</Text>
            </View>
            <TextInput
              style={[styles.input, styles.phoneInput]}
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              placeholder="XX XXX XXX"
              placeholderTextColor={Theme.colors.text.light}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>
        <View style={styles.buttonRow}>
          <Button
            title="حفظ التغييرات"
            onPress={handleSaveProfile}
            loading={isLoading}
            disabled={!canSave || isLoading}
            size="large"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background.main,
  },
  container: {
    flex: 1,
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
  inputValue: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background.card,
    borderRadius: Theme.borderRadius.md,
  },
  buttonRow: {
    marginTop: Theme.spacing.xl,
  },
  button: {
    width: '100%',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.card,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
    marginBottom: Theme.spacing.lg,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    textAlign: 'right',
  },
  phonePrefix: {
    backgroundColor: Theme.colors.background.light,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    borderRightWidth: 1,
    borderRightColor: Theme.colors.border,
  },
  phonePrefixText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
  },
}); 
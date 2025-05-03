import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useAuthContext } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuthContext();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!profile?.id) return;

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('users')
        .update({ full_name: fullName })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      Alert.alert('نجاح', 'تم تحديث الملف الشخصي بنجاح');
      router.back();
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الملف الشخصي');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>تعديل الملف الشخصي</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>الاسم الكامل</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="أدخل اسمك الكامل"
              placeholderTextColor={Theme.colors.text.light}
            />
          </View>

          <Button
            title={isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            onPress={handleSave}
            disabled={isLoading || !fullName.trim()}
            style={styles.saveButton}
          />
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
  form: {
    padding: Theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  input: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    backgroundColor: Theme.colors.background.main,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  saveButton: {
    marginTop: Theme.spacing.xl,
  },
}); 
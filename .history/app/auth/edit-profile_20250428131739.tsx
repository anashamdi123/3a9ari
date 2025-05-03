import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useAuthContext } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuthContext();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!profile?.id) return;

    if (!fullName.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال الاسم الكامل');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: fullName.trim() })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      Alert.alert('نجاح', 'تم تحديث الملف الشخصي بنجاح');
      router.back();
    } catch (error: any) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تحديث الملف الشخصي');
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          variant="ghost"
          onPress={() => router.back()}
          style={styles.backButton}
          icon={<ArrowLeft size={24} color={Theme.colors.text.primary} />}
        />
        <Text style={styles.headerTitle}>تعديل الملف الشخصي</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>الاسم الكامل</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="أدخل اسمك الكامل"
              placeholderTextColor={Theme.colors.text.secondary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <Text style={styles.emailText}>{profile?.email}</Text>
          </View>

          <Button
            title="حفظ التغييرات"
            onPress={handleSave}
            loading={isLoading}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.main,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  backButton: {
    marginRight: Theme.spacing.md,
  },
  headerTitle: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xl,
    color: Theme.colors.text.primary,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: Theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: Theme.spacing.xl,
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
    backgroundColor: 'white',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  emailText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    backgroundColor: Theme.colors.background.main,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
  },
  saveButton: {
    marginTop: Theme.spacing.xl,
  },
}); 
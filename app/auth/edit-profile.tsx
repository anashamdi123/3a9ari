import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { useAuthContext } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react-native';
import { Alert as RNAlert } from 'react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, refreshProfile } = useAuthContext();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!profile?.id) return;

    if (!fullName.trim()) {
      RNAlert.alert('خطأ', 'يرجى إدخال الاسم الكامل', [
        { text: 'حسناً', style: 'cancel' }
      ]);
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
      RNAlert.alert('نجاح', 'تم تحديث الملف الشخصي بنجاح', [
        { text: 'حسناً', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      RNAlert.alert('خطأ', 'حدث خطأ أثناء تحديث الملف الشخصي', [
        { text: 'حسناً', style: 'cancel' }
      ]);
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button
          title=""
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
    backgroundColor: Theme.colors.background.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
  },
  backButton: {
    padding: Theme.spacing.sm,
  },
  headerTitle: {
    fontSize: Theme.fontSizes.lg,
    fontWeight: 'bold',
    marginLeft: Theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: Theme.spacing.md,
  },
  inputContainer: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    fontSize: Theme.fontSizes.md,
    fontWeight: 'bold',
    marginBottom: Theme.spacing.sm,
  },
  input: {
    height: 40,
    borderColor: Theme.colors.text.secondary,
    borderWidth: 1,
    padding: Theme.spacing.sm,
  },
  emailText: {
    fontSize: Theme.fontSizes.md,
  },
  saveButton: {
    marginTop: Theme.spacing.md,
  },
}); 
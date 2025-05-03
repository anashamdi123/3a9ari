import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuthContext } from '@/context/auth-context';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { Toast } from '@/components/Toast';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuthContext();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleRegister = async () => {
    if (!fullName.trim()) {
      setToast({ message: 'يرجى إدخال الاسم الكامل', type: 'error' });
      return;
    }
    
    if (!email.trim()) {
      setToast({ message: 'يرجى إدخال البريد الإلكتروني', type: 'error' });
      return;
    }
    
    if (!validateEmail(email.trim())) {
      setToast({ message: 'يرجى إدخال بريد إلكتروني صحيح', type: 'error' });
      return;
    }
    
    if (!password.trim()) {
      setToast({ message: 'يرجى إدخال كلمة المرور', type: 'error' });
      return;
    }
    
    if (password.length < 6) {
      setToast({ message: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل', type: 'error' });
      return;
    }
    
    if (password !== confirmPassword) {
      setToast({ message: 'كلمات المرور غير متطابقة', type: 'error' });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await register(email.trim(), password, fullName.trim());
      
      if (error) {
        throw error;
      }
      
      setToast({ message: 'تم إنشاء الحساب بنجاح', type: 'success' });
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);
    } catch (err: any) {
      setToast({ message: err.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogin = () => {
    router.push('/auth/login');
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="إنشاء حساب جديد" modal />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>انضم إلى عقاري</Text>
            <Text style={styles.subtitleText}>أنشئ حسابك للوصول إلى جميع المميزات</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>الاسم الكامل</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="أدخل اسمك الكامل"
                placeholderTextColor={Theme.colors.text.light}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="أدخل بريدك الإلكتروني"
                placeholderTextColor={Theme.colors.text.light}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>كلمة المرور</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="أدخل كلمة المرور"
                placeholderTextColor={Theme.colors.text.light}
                secureTextEntry
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>تأكيد كلمة المرور</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="أدخل كلمة المرور مرة أخرى"
                placeholderTextColor={Theme.colors.text.light}
                secureTextEntry
              />
            </View>
            
            <Button
              title="إنشاء حساب"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}
            />
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>لديك حساب بالفعل؟</Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text style={styles.loginLink}>تسجيل الدخول</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.light,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    padding: Theme.spacing.xl,
  },
  welcomeText: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xxl,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'center',
  },
  subtitleText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xl,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.error,
  },
  errorText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.error,
    textAlign: 'right',
  },
  formGroup: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
    textAlign: 'right',
  },
  input: {
    fontFamily: 'Tajawal-Regular',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    textAlign: 'right',
  },
  registerButton: {
    marginTop: Theme.spacing.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Theme.spacing.xl,
  },
  loginText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    marginLeft: Theme.spacing.xs,
  },
  loginLink: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.primary,
  },
});
import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useAuthContext } from '@/context/auth-context';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuthContext();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null); // Clear error when user types
  };

  const validateForm = () => {
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName.trim()) {
      setError('يرجى إدخال الاسم الكامل');
      return false;
    }
    
    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني');
      return false;
    }
    
    if (!validateEmail(email.trim())) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return false;
    }
    
    if (!password) {
      setError('يرجى إدخال كلمة المرور');
      return false;
    }
    
    if (!validatePassword(password)) {
      setError('يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، وحرف كبير، وحرف صغير، ورقم واحد');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return false;
    }

    return true;
  };
  
  const handleRegister = async () => {
    try {
      if (!validateForm()) return;
      
      setIsLoading(true);
      setError(null);
      
      const { error: registrationError } = await register(
        formData.email.trim(),
        formData.password,
        formData.fullName.trim()
      );
      
      if (registrationError) {
        if (registrationError.message.includes('already registered')) {
          setError('هذا البريد الإلكتروني مسجل بالفعل');
        } else {
          setError(registrationError.message || 'حدث خطأ أثناء إنشاء الحساب');
        }
        return;
      }
      
      // Registration successful
      router.replace('/(tabs)');
      
    } catch (err: any) {
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى');
      console.error('Registration error:', err);
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
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>الاسم الكامل</Text>
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
                placeholder="أدخل اسمك الكامل"
                placeholderTextColor={Theme.colors.text.light}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="أدخل بريدك الإلكتروني"
                placeholderTextColor={Theme.colors.text.light}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>كلمة المرور</Text>
              <TextInput
                style={styles.input}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                placeholder="أدخل كلمة المرور"
                placeholderTextColor={Theme.colors.text.light}
                secureTextEntry
                textContentType="newPassword"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>تأكيد كلمة المرور</Text>
              <TextInput
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                placeholder="أدخل كلمة المرور مرة أخرى"
                placeholderTextColor={Theme.colors.text.light}
                secureTextEntry
                textContentType="newPassword"
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
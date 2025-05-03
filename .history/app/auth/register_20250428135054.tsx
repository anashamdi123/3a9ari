import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuthContext } from '@/context/auth-context';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { useRouter } from 'expo-router';
import { I18nManager } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

// Force RTL layout
I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuthContext();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const validatePassword = (password: string) => {
    // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
    return passwordRegex.test(password);
  };
  
  const handleRegister = async () => {
    // Reset previous error
    setError(null);
    
    // Validate input
    if (!fullName.trim()) {
      setError('يرجى إدخال الاسم الكامل');
      return;
    }
    
    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني');
      return;
    }
    
    if (!validateEmail(email.trim())) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    
    if (!password.trim()) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }
    
    if (!validatePassword(password)) {
      setError('يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل، وحرف كبير، وحرف صغير، ورقم');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await register(email.trim(), password, fullName.trim());
      
      if (error) {
        setError(error.message);
        return;
      }
      
      router.replace('/(tabs)' as any);
    } catch (err: any) {
      setError(err.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLogin = () => {
    router.push('/auth/login' as any);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="إنشاء حساب جديد" modal />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  setError(null);
                }}
                placeholder="أدخل اسمك الكامل"
                placeholderTextColor={Theme.colors.text.light}
                editable={!isLoading}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>البريد الإلكتروني</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError(null);
                }}
                placeholder="أدخل بريدك الإلكتروني"
                placeholderTextColor={Theme.colors.text.light}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>كلمة المرور</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError(null);
                  }}
                  placeholder="أدخل كلمة المرور"
                  placeholderTextColor={Theme.colors.text.light}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={Theme.colors.text.secondary} />
                  ) : (
                    <Eye size={20} color={Theme.colors.text.secondary} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>تأكيد كلمة المرور</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setError(null);
                  }}
                  placeholder="أدخل كلمة المرور مرة أخرى"
                  placeholderTextColor={Theme.colors.text.light}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isLoading}
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
            
            <Button
              title="إنشاء حساب"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}
            />
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>لديك حساب بالفعل؟</Text>
              <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
                <Text style={[styles.loginLink, isLoading && styles.disabledText]}>
                  تسجيل الدخول
                </Text>
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
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: Theme.spacing.xl,
  },
  eyeIcon: {
    position: 'absolute',
    left: Theme.spacing.md,
    top: Theme.spacing.md + 8,
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
  disabledText: {
    opacity: 0.5,
  },
});
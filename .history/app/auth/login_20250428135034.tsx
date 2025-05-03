import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
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

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuthContext();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleLogin = async () => {
    // Reset previous error
    setError(null);
    
    // Validate input
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
    
    try {
      setIsLoading(true);
      
      const { error } = await login(email.trim(), password);
      
      if (error) {
        throw error;
      }
      
      router.replace('/(tabs)' as any);
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = () => {
    router.push('/auth/register' as any);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="تسجيل الدخول" modal />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>أهلاً بك في عقاري</Text>
            <Text style={styles.subtitleText}>قم بتسجيل الدخول للوصول إلى حسابك</Text>
            
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
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
            
            <Button
              title="تسجيل الدخول"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              style={styles.loginButton}
            />
            
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>ليس لديك حساب؟</Text>
              <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
                <Text style={[styles.registerLink, isLoading && styles.disabledText]}>
                  إنشاء حساب جديد
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
    justifyContent: 'center',
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
  loginButton: {
    marginTop: Theme.spacing.md,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Theme.spacing.xl,
  },
  registerText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    marginLeft: Theme.spacing.xs,
  },
  registerLink: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.primary,
  },
  disabledText: {
    opacity: 0.5,
  },
});
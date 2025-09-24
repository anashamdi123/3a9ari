import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuthContext } from '@/context/auth-context';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, User, Mail, Phone } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuthContext();
  const { showToast } = useToast();
  
  // Step state
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handlePhoneNumberChange = (text: string) => {
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
    console.log(formattedNumber) ; 
  };
  
  const validatePhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters
    const digits = phone.replace(/[^\d]/g, '');
    
    // Check if it's a valid Tunisian number
    // Must have 8 digits total
    if (digits.length !== 8) {
      return false;
    }
    
    // Check if the operator code is valid (2, 4, 5, 7, 9)
    const operatorCode = digits[0];
    if (!['2', '4', '5', '7', '9'].includes(operatorCode)) {
      return false;
    }
    
    return true;
  };
  
  // Step navigation handlers
  const handleNext = () => {
    if (step === 1) {
      if (!fullName.trim()) {
        showToast('يرجى إدخال الاسم الكامل', 'error');
        return;
      }
      if (fullName.trim().length < 3 || fullName.trim().length > 30) {
        showToast('يجب أن يتكون الاسم من 3 إلى 30 حرفًا', 'error');
        return;
      }
      if (!email.trim()) {
        showToast('يرجى إدخال البريد الإلكتروني', 'error');
        return;
      }
      if (!validateEmail(email.trim())) {
        showToast('يرجى إدخال بريد إلكتروني صحيح', 'error');
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
    }
    if (step === 2) {
      if (!password.trim()) {
        showToast('يرجى إدخال كلمة المرور', 'error');
        return;
      }
      if (password.length < 6) {
        showToast('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل', 'error');
        return;
      }
      if (password !== confirmPassword) {
        showToast('كلمات المرور غير متطابقة', 'error');
        return;
      }
    }
    setStep(step + 1);
  };
  
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };
  
  const handleRegister = async () => {
    // Final validation (redundant, but safe)
    if (!fullName.trim()) {
      showToast('يرجى إدخال الاسم الكامل', 'error');
      return;
    }
    if (fullName.trim().length < 3 || fullName.trim().length > 30) {
      showToast('يجب أن يتكون الاسم من 3 إلى 30 حرفًا', 'error');
      return;
    }
    if (!email.trim()) {
      showToast('يرجى إدخال البريد الإلكتروني', 'error');
      return;
    }
    if (!validateEmail(email.trim())) {
      showToast('يرجى إدخال بريد إلكتروني صحيح', 'error');
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
    if (!password.trim()) {
      showToast('يرجى إدخال كلمة المرور', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('يجب أن تتكون كلمة المرور من 6 أحرف على الأقل', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('كلمات المرور غير متطابقة', 'error');
      return;
    }
    try {
      setIsLoading(true);
      const fullPhoneNumber = `+216 ${phoneNumber}`;
      const { error } = await register(email.trim(), password, fullName.trim(), fullPhoneNumber);
      if (error) throw error;
      showToast('تم إنشاء الحساب بنجاح', 'success');
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);
    } catch (err: any) {
      showToast(err.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى', 'error');
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>انضم إلى عقاري</Text>
            <Text style={styles.subtitleText}>أنشئ حسابك للوصول إلى جميع المميزات</Text>
            
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>الاسم الكامل</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="أدخل اسمك الكامل"
                placeholderTextColor={Theme.colors.text.light}
                autoCapitalize="words"
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
              <Text style={styles.label}>رقم الهاتف</Text>
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
              </>
            )}
            
            {/* Step 2: Passwords */}
            {step === 2 && (
              <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>كلمة المرور</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="أدخل كلمة المرور"
                  placeholderTextColor={Theme.colors.text.light}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
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
                  onChangeText={setConfirmPassword}
                  placeholder="أدخل كلمة المرور مرة أخرى"
                  placeholderTextColor={Theme.colors.text.light}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="password"
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
              </>
            )}
            
            {/* Step 3: Review & Submit */}
            {step === 3 && (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>مراجعة المعلومات</Text>
                  <View style={{ backgroundColor: Theme.colors.background.card, borderRadius: Theme.borderRadius.md, padding: Theme.spacing.xl }}>
                    <View style={styles.reviewItem}>
                      <Text style={{ color: Theme.colors.text.primary, marginRight: 10, flex: 1, textAlign: 'right' }}>{fullName}</Text>
                      <User size={20} color={Theme.colors.text.secondary  }  />
                    </View>
                    <View style={styles.reviewItem}>
                      <Text style={{ color: Theme.colors.text.primary, marginRight: 10, flex: 1, textAlign: 'right' }}>{email}</Text>
                      <Mail size={20} color={Theme.colors.text.secondary} />
                    </View>
                    <View style={styles.reviewItem}>
                      <Text style={{ color: Theme.colors.text.primary, marginRight: 10, flex: 1, textAlign: 'right' }}>{phoneNumber}</Text>
                      <Phone size={20} color={Theme.colors.text.secondary} />
                    </View>
                  </View>
                </View> 
              </>
            )}
            
            {/* Navigation Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: Theme.spacing.lg, marginTop: Theme.spacing.xl }}>
              {step > 1 && (
                <Button
                  title="السابق"
                  onPress={handleBack}
                  type="outline"
                  style={{ width: 120, marginHorizontal: 8 }}
                  textStyle={{ color: Theme.colors.primary }}
                  size='large'

                />
              )}
              {step < 3 ? (
                <Button
                  title="التالي"
                  onPress={handleNext}
                  style={{ width: 120, marginHorizontal: 8 }}
                  size='large'
                />
              ) : (
            <Button
                  title={isLoading ? 'جاري الإرسال...' : 'إنشاء حساب'}
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              size="large"
              style={styles.registerButton}
            />
              )}
            </View>
            
            {/* Login Link */}
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
    backgroundColor: Theme.colors.background.card,
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
    paddingLeft: 40,
  },
  eyeIcon: {
    position: 'absolute',
    left: Theme.spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: Theme.spacing.xs,
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
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.card,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    overflow: 'hidden',
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
  phoneInput: {
    flex: 1,
    borderWidth: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    textAlign: 'right',
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
});
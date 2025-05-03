import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TextInput, Alert, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuthContext } from '@/context/auth-context';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { Toast } from '@/components/Toast';
import { supabase } from '@/lib/supabase';
import { Plus, X, Camera, ChevronRight, ChevronLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

export default function NewListingScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthContext();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Form state
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const handlePickImage = async () => {
    if (images.length >= 5) {
      Alert.alert('تنبيه', 'يمكنك إضافة 5 صور كحد أقصى');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets.length > 0) {
      setImages([...images, result.assets[0].uri]);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  
  const handleNext = () => {
    if (step === 1 && images.length === 0) {
      Alert.alert('خطأ', 'يرجى إضافة صورة واحدة على الأقل');
      return;
    }
    
    if (step === 2) {
      if (!title.trim()) {
        Alert.alert('خطأ', 'يرجى إدخال عنوان العقار');
        return;
      }
      if (!price.trim() || isNaN(Number(price))) {
        Alert.alert('خطأ', 'يرجى إدخال سعر صحيح');
        return;
      }
      if (!size.trim() || isNaN(Number(size))) {
        Alert.alert('خطأ', 'يرجى إدخال مساحة صحيحة');
        return;
      }
    }
    
    if (step < 3) {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleSubmit = async () => {
    if (!location.trim()) {
      setToast({ message: 'يرجى إدخال الموقع', type: 'error' });
      return;
    }
    if (!description.trim()) {
      setToast({ message: 'يرجى إدخال وصف العقار', type: 'error' });
      return;
    }
    if (!phoneNumber.trim()) {
      setToast({ message: 'يرجى إدخال رقم الهاتف للتواصل', type: 'error' });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // In a real implementation, we would upload images to Supabase Storage
      // For this MVP, we'll just use the local URIs as placeholders
      
      const imageUrls = images;
      
      // Create the property listing
      const { data, error } = await supabase
        .from('properties')
        .insert([
          {
            owner_id: user!.id,
            title,
            price: Number(price),
            size: Number(size),
            location,
            description,
            phone_number: phoneNumber,
            images: imageUrls,
            status: 'pending',
          },
        ])
        .select();
      
      if (error) throw error;
      
      setToast({ message: 'تم إضافة العقار بنجاح وهو الآن قيد المراجعة', type: 'success' });
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);
    } catch (error: any) {
      setToast({ message: error.message || 'حدث خطأ أثناء إضافة العقار', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Plus size={64} color={Theme.colors.primary} />
          <Text style={styles.title}>إضافة عقار</Text>
          <Text style={styles.message}>
            قم بتسجيل الدخول لتتمكن من إضافة عقاراتك وعرضها للبيع
          </Text>
          <Button
            title="تسجيل الدخول"
            onPress={() => router.push('/auth/login')}
            style={styles.loginButton}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={`إضافة عقار - الخطوة ${step}/3`} 
        showBackButton={false}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>إضافة صور العقار</Text>
            <Text style={styles.stepDescription}>
              قم بإضافة صور واضحة لعقارك لجذب اهتمام المشترين
            </Text>
            
            <View style={styles.imagesContainer}>
              <View style={styles.addImageButton}>
                <Button
                  title="إضافة صورة"
                  onPress={handlePickImage}
                  icon={<Plus size={20} color="white" style={{ marginLeft: 8 }} />}
                />
              </View>
              
              {images.map((image, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri: image }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemoveImage(index)}
                  >
                    <X size={16} color="white" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>معلومات العقار الأساسية</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>عنوان العقار</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="مثال: فيلا في وادي الليل"
                placeholderTextColor={Theme.colors.text.light}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>السعر (دت)</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="أدخل السعر"
                placeholderTextColor={Theme.colors.text.light}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>المساحة (متر مربع)</Text>
              <TextInput
                style={styles.input}
                value={size}
                onChangeText={setSize}
                placeholder="أدخل المساحة"
                placeholderTextColor={Theme.colors.text.light}
                keyboardType="numeric"
              />
            </View>
          </View>
        )}
        
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>بيانات إضافية</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>الموقع</Text>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="مثال: الرياض، حي النزهة"
                placeholderTextColor={Theme.colors.text.light}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>رقم الهاتف</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="رقم الهاتف للتواصل"
                placeholderTextColor={Theme.colors.text.light}
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>وصف العقار</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="أضف وصفاً تفصيلياً للعقار..."
                placeholderTextColor={Theme.colors.text.light}
                multiline
                textAlignVertical="top"
                numberOfLines={6}
              />
            </View>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.footer}>
        {step > 1 && (
          <Button
            title="السابق"
            onPress={handleBack}
            type="outline"
            style={styles.backButton}
            icon={<ChevronRight size={20} color={Theme.colors.primary} style={{ marginLeft: 8 }} />}
          />
        )}
        
        {step < 3 ? (
          <Button
            title="التالي"
            onPress={handleNext}
            style={styles.nextButton}
            icon={<ChevronLeft size={20} color="white" style={{ marginRight: 8 }} />}
          />
        ) : (
          <Button
            title={isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
            onPress={handleSubmit}
            disabled={isSubmitting}
            loading={isSubmitting}
            style={styles.submitButton}
          />
        )}
      </View>
      
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Theme.spacing.xl,
  },
  title: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xxl,
    color: Theme.colors.text.primary,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  },
  message: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  loginButton: {
    width: '100%',
    maxWidth: 300,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
  },
  stepContainer: {
    marginBottom: Theme.spacing.xl,
  },
  stepTitle: {
    fontFamily: 'Tajawal-Bold',
    fontSize: Theme.fontSizes.xl,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.sm,
    textAlign: 'right',
  },
  stepDescription: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.lg,
    textAlign: 'right',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Theme.spacing.md,
  },
  addImageButton: {
    margin: Theme.spacing.xs,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: Theme.borderRadius.md,
    margin: Theme.spacing.xs,
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Theme.spacing.lg,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
  },
  backButton: {
    flex: 1,
    marginLeft: Theme.spacing.sm,
  },
  nextButton: {
    flex: 1,
    marginRight: Theme.spacing.sm,
  },
  submitButton: {
    flex: 1,
  },
});
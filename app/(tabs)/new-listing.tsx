import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Image, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { useAuthContext } from '@/context/auth-context';
import { Theme } from '@/constants/theme';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { Plus, X, Camera, ChevronRight, ChevronLeft, RotateCcw, ChevronDown } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { LOCATIONS, LocationType, PROPERTY_CATEGORIES, AREA_UNITS, PRICE_UNITS, AreaUnit, PriceUnit } from '@/constants/config';
import { Alert as RNAlert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

async function uploadImageToSupabase(uri: string, userId: string): Promise<string | null> {
  try {
    // Read the file as base64
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      console.error('File does not exist:', uri);
      return null;
    }
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    const fileExt = uri.split('.').pop() || 'jpg';
    const fileName = uri.split('/').pop() || `image.${fileExt}`;
    const filePath = `${userId}/${Date.now()}-${fileName}`;
    // Decode base64 to ArrayBuffer
    const arrayBuffer = decode(base64);
    // Set correct content type
    let contentType = `image/${fileExt}`;
    if (fileExt === 'jpg') contentType = 'image/jpeg';
    if (fileExt === 'png') contentType = 'image/png';
    if (fileExt === 'jpeg') contentType = 'image/jpeg';
    if (fileExt === 'webp') contentType = 'image/webp';
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, arrayBuffer, {
        contentType,
        upsert: false,
      });
    if (uploadError) {
      console.error('Upload error:', uploadError.message);
      throw uploadError;
    }
    const { data: publicUrlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  } catch (err: any) {
    console.error('Upload error:', err.message);
    return null;
  }
}

export default function NewListingScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthContext();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [sizeUnit, setSizeUnit] = useState<AreaUnit>('m²');
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
  const [selectedDelegation, setSelectedDelegation] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showDelegationModal, setShowDelegationModal] = useState(false);
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [priceUnit, setPriceUnit] = useState<PriceUnit>('tnd');
  const [showPriceUnitModal, setShowPriceUnitModal] = useState(false);
  
  const handlePickImage = async () => {
    if (images.length >= 5) {
      RNAlert.alert(
        'تنبيه',
        'يمكنك إضافة 5 صور كحد أقصى',
        [
          { text: 'حسناً', style: 'cancel' }
        ]
      );
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 5 - images.length,
    });
    
    if (!result.canceled && result.assets.length > 0) {
      const newImages = [...images, ...result.assets.map(asset => asset.uri)];
      if (newImages.length > 5) {
        RNAlert.alert(
          'تنبيه',
          'تم تحديد 5 صور كحد أقصى. سيتم إضافة الصور حتى الوصول للحد الأقصى.',
          [
            {
              text: 'حسناً',
              onPress: () => setImages(newImages.slice(0, 5)),
              style: 'default',
            },
          ]
        );
      } else {
        setImages(newImages);
      }
    }
  };
  
  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
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
  
  const handleNext = () => {
    if (step === 1 && images.length === 0) {
      showToast('يرجى إضافة صورة واحدة على الأقل', 'error');
      return;
    }
    if (step === 2) {
      if (!selectedCategory) {
        showToast('يرجى اختيار نوع العقار', 'error');
        return;
      }
      if (!title.trim()) {
        showToast('يرجى إدخال عنوان العقار', 'error');
        return;
      }
      if (!price.trim() || isNaN(Number(price))) {
        showToast('يرجى إدخال سعر صحيح', 'error');
        return;
      }
      if (!size.trim() || isNaN(Number(size))) {
        showToast('يرجى إدخال مساحة صحيحة', 'error');
        return;
      }
    }
    if (step === 3) {
      if (!selectedLocation || !selectedDelegation) {
        showToast('يرجى اختيار الموقع', 'error');
        return;
      }
      if (!description.trim()) {
        showToast('يرجى إدخال وصف العقار', 'error');
        return;
      }
      if (!phoneNumber.trim()) {
        showToast('يرجى إدخال رقم الهاتف للتواصل', 'error');
        return;
      }
      if (!validatePhoneNumber(phoneNumber)) {
        showToast('يرجى إدخال رقم هاتف تونسي صحيح', 'error');
        return;
      }
    }
    if (step < 4) {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleSubmit = async () => {
    if (!selectedCategory) {
      showToast('يرجى اختيار نوع العقار', 'error');
      return;
    }
    if (!selectedLocation || !selectedDelegation) {
      showToast('يرجى اختيار الموقع', 'error');
      return;
    }
    if (!description.trim()) {
      showToast('يرجى إدخال وصف العقار', 'error');
      return;
    }
    if (!phoneNumber.trim()) {
      showToast('يرجى إدخال رقم الهاتف للتواصل', 'error');
      return;
    }
    if (!validatePhoneNumber(phoneNumber)) {
      showToast('يرجى إدخال رقم هاتف تونسي صحيح', 'error');
      return;
    }
    try {
      setIsSubmitting(true);

      const uploadedImageUrls: string[] = [];
      if (user?.id) {
        for (const uri of images) {
          const url = await uploadImageToSupabase(uri, user.id);
          if (url) {
            uploadedImageUrls.push(url);
          } else {
            console.warn(`Failed to upload image: ${uri}`);
          }
        }
      }

      if (uploadedImageUrls.length !== images.length) {
        showToast('فشل تحميل بعض الصور. يرجى المحاولة مرة أخرى.', 'error');
        setIsSubmitting(false);
        return;
      }
      
      const delegationLabel = selectedLocation.delegations.find(d => d.id === selectedDelegation)?.label;
      const location = `${delegationLabel}, ${selectedLocation.label}`;
      const fullPhoneNumber = `+216 ${phoneNumber}`;
      const { data, error } = await supabase
        .from('properties')
        .insert([
          {
            owner_id: user!.id,
            title,
            price: Number(price),
            price_unit: priceUnit,
            size: Number(size),
            size_unit: sizeUnit,
            location,
            description,
            phone_number: fullPhoneNumber,
            images: uploadedImageUrls,
            status: 'pending',
            category: selectedCategory,
          },
        ])
        .select();
      if (error) throw error;
      showToast('تم إضافة العقار بنجاح وهو الآن قيد المراجعة', 'success');
      // Reset form after successful submission
      setImages([]);
      setTitle('');
      setPrice('');
      setSize('');
      setSizeUnit('m²');
      setSelectedLocation(null);
      setSelectedDelegation(null);
      setDescription('');
      setPhoneNumber('');
      setSelectedCategory(null);
      setStep(1);
      setPriceUnit('tnd');
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 1500);
    } catch (error: any) {
      showToast(error.message || 'حدث خطأ أثناء إضافة العقار', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleReset = () => {
    RNAlert.alert(
      'إعادة تعيين',
      'هل أنت متأكد من إعادة تعيين النموذج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تأكيد',
          style: 'destructive',
          onPress: () => {
        setImages([]);
        setTitle('');
        setPrice('');
        setSize('');
        setSizeUnit('m²');
        setSelectedLocation(null);
        setSelectedDelegation(null);
        setDescription('');
        setPhoneNumber('');
        setSelectedCategory(null);
        setStep(1);
        setPriceUnit('tnd');
        showToast('تم إعادة تعيين النموذج', 'success');
          },
        },
      ]
    );
  };
  
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="إضافة عقار" />
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
        title={`إضافة عقار - الخطوة ${step}/4`} 
        rightComponent={
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={handleReset}
          >
            <RotateCcw size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
        }
      />
      <View style={styles.contentContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>إضافة صور العقار</Text>
              <Text style={styles.stepDescription}>
                قم بإضافة صور واضحة لعقارك لجذب اهتمام المشترين
              </Text>
              <Text style={styles.imageLimitText}>
                {images.length}/5 صور
              </Text>
              <View style={styles.imagesContainer}>
                <View style={styles.addImageButton}>
                  <Button
                    title="إضافة صورة"
                    onPress={handlePickImage}
                    icon={<Plus size={20} color="white" style={{ marginLeft: 8 }} />}
                  />
                </View>
              </View>
              {/* Thumbnails row under the add button */}
              {images.length > 0 && (
                <View style={styles.thumbnailsFlexContainer}>
                  {images.map((image, index) => (
                    <View key={index} style={styles.thumbnailContainer}>
                      <Image source={{ uri: image }} style={styles.thumbnail} />
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveImage(index)}
                      >
                        <X size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
          
          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>معلومات العقار الأساسية</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>نوع العقار</Text>
                  <TouchableOpacity
                    style={styles.locationSelect}
                    onPress={() => setShowCategoryModal(true)}
                  >
                    <Text style={[
                      styles.locationSelectText,
                      !selectedCategory && styles.placeholderText
                    ]}>
                      {selectedCategory 
                        ? PROPERTY_CATEGORIES.find(c => c.id === selectedCategory)?.label 
                        : 'اختر نوع العقار'}
                    </Text>
                    <ChevronDown size={20} color={Theme.colors.text.primary} />
                  </TouchableOpacity>
                </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>إسم العقار</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="مثال: فيلا في وادي الليل"
                  placeholderTextColor={Theme.colors.text.light}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>السعر</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <TouchableOpacity
                    style={[styles.locationSelect, { flex: 1, marginRight: 10, marginLeft: 0, maxWidth: 125 }]}
                    onPress={() => setShowPriceUnitModal(true)}
                  >
                    <Text style={[styles.locationSelectText, !priceUnit && styles.placeholderText]}>
                      {PRICE_UNITS.find(unit => unit.id === priceUnit)?.label || 'اختر وحدة السعر'}
                    </Text>
                    <ChevronDown size={20} color={Theme.colors.text.primary} />
                  </TouchableOpacity>
                <TextInput
                    style={[styles.input, { flex: 3 }]}
                  value={price}
                  onChangeText={setPrice}
                    placeholder={`أدخل السعر بـ${PRICE_UNITS.find(unit => unit.id === priceUnit)?.label || ''}`}
                  placeholderTextColor={Theme.colors.text.light}
                  keyboardType="numeric"
                />
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>المساحة</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <TouchableOpacity
                    style={[styles.locationSelect, { flex: 1, marginRight: 10, marginLeft: 0, maxWidth: 110 }]}
                    onPress={() => setShowUnitModal(true)}
                  >
                    <Text style={[styles.locationSelectText, !sizeUnit && styles.placeholderText]}>
                      {AREA_UNITS.find(unit => unit.id === sizeUnit)?.label || 'اختر وحدة المساحة'}
                    </Text>
                    <ChevronDown size={20} color={Theme.colors.text.primary} />
                  </TouchableOpacity>
                <TextInput
                    style={[styles.input, { flex: 3 }]}
                  value={size}
                  onChangeText={setSize}
                    placeholder={`أدخل المساحة بـ${AREA_UNITS.find(unit => unit.id === sizeUnit)?.label || ''}`}
                  placeholderTextColor={Theme.colors.text.light}
                  keyboardType="numeric"
                />
                </View>
              </View>
            </View>
          )}
          
          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>بيانات إضافية</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>الموقع</Text>
                <View style={styles.locationContainer}>
                  <TouchableOpacity
                    style={styles.locationSelect}
                      onPress={() => setShowLocationModal(true)}
                  >
                    <Text style={[
                      styles.locationSelectText,
                        !selectedLocation && styles.placeholderText
                    ]}>
                        {selectedLocation ? selectedLocation.label : 'اختر المدينة'}
                    </Text>
                    <ChevronDown size={20} color={Theme.colors.text.primary} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.locationSelect,
                        !selectedLocation && styles.disabledSelect
                    ]}
                      onPress={() => selectedLocation && setShowDelegationModal(true)}
                      disabled={!selectedLocation}
                  >
                    <Text style={[
                      styles.locationSelectText,
                      !selectedDelegation && styles.placeholderText
                    ]}>
                      {selectedDelegation 
                          ? selectedLocation?.delegations.find(d => d.id === selectedDelegation)?.label 
                        : 'اختر المعتمدية'}
                    </Text>
                    <ChevronDown size={20} color={Theme.colors.text.primary} />
                  </TouchableOpacity>
                </View>
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
          {step === 4 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>مراجعة البيانات</Text>
              <Text style={styles.stepDescription}>يرجى مراجعة جميع المعلومات قبل الإرسال</Text>
              {/* Images Preview */}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                {images.map((img, idx) => (
                  <Image key={idx} source={{ uri: img }} style={{ width: 60, height: 60, borderRadius: 8, marginRight: 8, marginBottom: 8 }} />
                ))}
              </View>
              <View style={styles.reviewRow}><Text style={styles.reviewLabel}>العنوان:</Text><Text style={styles.reviewValue}>{title}</Text></View>
              <View style={styles.reviewRow}><Text style={styles.reviewLabel}>نوع العقار:</Text><Text style={styles.reviewValue}>{selectedCategory ? PROPERTY_CATEGORIES.find(c => c.id === selectedCategory)?.label : ''}</Text></View>
              <View style={styles.reviewRow}><Text style={styles.reviewLabel}>السعر:</Text><Text style={styles.reviewValue}>{price} {PRICE_UNITS.find(u => u.id === priceUnit)?.label}</Text></View>
              <View style={styles.reviewRow}><Text style={styles.reviewLabel}>المساحة:</Text><Text style={styles.reviewValue}>{size} {AREA_UNITS.find(u => u.id === sizeUnit)?.label}</Text></View>
              <View style={styles.reviewRow}><Text style={styles.reviewLabel}>الموقع:</Text><Text style={styles.reviewValue}>{selectedDelegation && selectedLocation ? `${selectedLocation.delegations.find(d => d.id === selectedDelegation)?.label}, ${selectedLocation.label}` : ''}</Text></View>
              <View style={styles.reviewRow}><Text style={styles.reviewLabel}>رقم الهاتف:</Text><Text style={styles.reviewValue}>+216 {phoneNumber}</Text></View>
              <View style={styles.reviewRow}><Text style={styles.reviewLabel}>الوصف:</Text><Text style={styles.reviewValue}>{description}</Text></View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      
        <View style={styles.footer}>
          {step > 1 && (
            <Button
              title="السابق"
              onPress={handleBack}
              type="outline"
              style={[styles.navButton, styles.backButton]}
              textStyle={{ color: Theme.colors.primary }}
            />
          )}
          
          {step < 4 ? (
            <Button
              title="التالي"
              onPress={handleNext}
              style={[styles.navButton, styles.nextButton]}
            />
          ) : (
            <Button
              title={isSubmitting ? 'جاري الإرسال...' : 'إرسال'}
              onPress={handleSubmit}
              disabled={isSubmitting}
              loading={isSubmitting}
              style={[styles.navButton, styles.submitButton]}
            />
          )}
        </View>
      </View>
      
      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsSubmitting(false);
          setShowLocationModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختر المدينة</Text>
              <TouchableOpacity
                onPress={() => setShowLocationModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {LOCATIONS.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedLocation(location);
                    setSelectedDelegation(null);
                    setShowLocationModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{location.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delegation Selection Modal */}
      <Modal
        visible={showDelegationModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsSubmitting(false);
          setShowDelegationModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختر المعتمدية</Text>
              <TouchableOpacity
                onPress={() => setShowDelegationModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {selectedLocation?.delegations.map((delegation) => (
                <TouchableOpacity
                  key={delegation.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedDelegation(delegation.id);
                    setShowDelegationModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{delegation.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
      
      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsSubmitting(false);
          setShowCategoryModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختر نوع العقار</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {PROPERTY_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCategory(category.id);
                    setShowCategoryModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{category.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
      </View>
      </Modal>

      {/* Unit Selection Modal */}
      <Modal
        visible={showUnitModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsSubmitting(false);
          setShowUnitModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختر وحدة المساحة</Text>
              <TouchableOpacity
                onPress={() => setShowUnitModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {AREA_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setSizeUnit(unit.id as AreaUnit);
                    setShowUnitModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{unit.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Price Unit Selection Modal */}
      <Modal
        visible={showPriceUnitModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsSubmitting(false);
          setShowPriceUnitModal(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختر وحدة السعر</Text>
              <TouchableOpacity
                onPress={() => setShowPriceUnitModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Theme.colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {PRICE_UNITS.map((unit) => (
                <TouchableOpacity
                  key={unit.id}
                  style={styles.modalItem}
                  onPress={() => {
                    setPriceUnit(unit.id as PriceUnit);
                    setShowPriceUnitModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{unit.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
      </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.light,
  },
  contentContainer: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Theme.spacing.lg,
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
  stepContainer: {
    marginBottom: Theme.spacing.xl,
    width: '100%',
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
  imageLimitText: {
    fontFamily: 'Tajawal-Medium',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.md,
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
    width: '100%',
    aspectRatio: 1,
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
    width: '100%',
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
    width: '100%',
    minWidth: 0,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.main,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    ...Theme.shadows.medium,
    gap: Theme.spacing.xl,
  },
  navButton: {
    width: 140,
    height: 48,
    borderRadius: Theme.borderRadius.md,
  },
  backButton: {
    backgroundColor: Theme.colors.background.card,
    borderColor: Theme.colors.primary,
  },
  nextButton: {
    backgroundColor: Theme.colors.primary,
  },
  submitButton: {
    backgroundColor: Theme.colors.primary,
  },
  helperText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.sm,
    color: Theme.colors.text.secondary,
    marginTop: Theme.spacing.xs,
    textAlign: 'right',
  },
  resetButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationContainer: {
    gap: Theme.spacing.sm,
  },
  locationSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.background.card,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
  },
  locationSelectText: {
    fontFamily: 'Tajawal-Regular',
    fontSize: Theme.fontSizes.md,
    color: Theme.colors.text.primary,
    textAlign: 'right',
  },
  placeholderText: {
    color: Theme.colors.text.light,
  },
  disabledSelect: {
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Theme.colors.background.main,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    width: '100%',
    maxWidth: 480,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  modalScroll: {
    maxHeight: '80%',
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  modalItemText: {
    fontSize: 16,
    color: Theme.colors.text.primary,
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
  unitToggle: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.lg,
    backgroundColor: Theme.colors.background.card,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.md,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  unitToggleActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  unitToggleText: {
    fontFamily: 'Tajawal-Medium',
    color: Theme.colors.text.primary,
  },
  unitToggleTextActive: {
    color: 'white',
  },
  thumbnailsFlexContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.xs,
    marginTop: 12,
  },
  thumbnailContainer: {
    width: 60,
    height: 60,
    borderRadius: Theme.borderRadius.md,
    margin: Theme.spacing.xs / 2,
    position: 'relative',
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  reviewLabel: {
    fontFamily: 'Tajawal-Bold',
    color: Theme.colors.text.primary,
    fontSize: Theme.fontSizes.md,
    minWidth: 90,
    textAlign: 'right',
  },
  reviewValue: {
    fontFamily: 'Tajawal-Regular',
    color: Theme.colors.text.secondary,
    fontSize: Theme.fontSizes.md,
    flex: 1,
    textAlign: 'right',
  },
});